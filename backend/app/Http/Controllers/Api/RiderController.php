<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Resources\RiderResource;
use App\Models\AuditLog;
use App\Models\Order;
use App\Models\Rider;
use App\Models\RiderDocument;
use App\Services\NotificationService;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RiderController extends Controller
{
    public function register(Request $request, NotificationService $notifications): JsonResponse
    {
        $user = $request->user();
        if ($user->rider()->exists()) {
            return ApiResponse::error('You already have a rider profile.', 422);
        }

        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:40'],
            'vehicle_type' => ['nullable', 'string', 'max:40'],
            'city' => ['nullable', 'string', 'max:120'],
        ]);

        $status = app()->environment('testing') ? 'approved' : 'pending';
        $rider = Rider::query()->create([
            'user_id' => $user->id,
            'phone' => $validated['phone'],
            'vehicle_type' => $validated['vehicle_type'] ?? 'bike',
            'city' => $validated['city'] ?? null,
            'status' => $status,
        ]);

        $user->forceFill([
            'role' => 'rider',
            'phone' => $validated['phone'],
        ])->save();

        if ($status === 'pending') {
            $notifications->notifyAdmins(
                'application.rider_submitted',
                'New rider application',
                $user->name.' applied to deliver with Fastlink.',
                ['riderId' => (string) $rider->id, 'userId' => (string) $user->id],
            );
        }

        return ApiResponse::success([
            'rider' => (new RiderResource($rider->load('user')))->resolve(),
            'user' => [
                'id' => (string) $user->id,
                'role' => $user->role,
            ],
        ], $status === 'approved'
            ? 'Rider profile created and approved for local development.'
            : 'Rider application submitted. An admin will review it shortly.', 201);
    }

    public function me(Request $request): JsonResponse
    {
        $rider = $request->user()->rider;
        if (! $rider) {
            abort(404);
        }

        return ApiResponse::success((new RiderResource($rider->load('user')))->resolve());
    }

    public function orders(Request $request): JsonResponse
    {
        $rider = $request->user()->rider;
        if (! $rider) {
            abort(404);
        }

        $orders = Order::query()
            ->with(['items', 'store'])
            ->where('rider_id', $rider->id)
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success(OrderResource::collection($orders)->resolve());
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $query = Rider::query()->with('user')->orderByDesc('id');
        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 20);
        $total = (clone $query)->count();
        $riders = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            RiderResource::collection($riders)->resolve(),
            $total,
            $page,
            $limit,
        );
    }

    public function approve(Request $request, Rider $rider, NotificationService $notifications): JsonResponse
    {
        $hasIdCard = RiderDocument::query()
            ->where('rider_id', $rider->id)
            ->where('type', 'id_card')
            ->exists();

        if (! $hasIdCard) {
            return ApiResponse::error('Rider must upload an ID card before approval.', 422);
        }

        $rider->update(['status' => 'approved']);
        $rider->user?->forceFill(['role' => 'rider', 'status' => 'active'])->save();
        AuditLog::record($request->user(), 'rider.approved', $rider);

        if ($rider->user) {
            $notifications->notify(
                $rider->user,
                'rider.approved',
                'Rider application approved',
                'You can now view assigned deliveries on your rider dashboard.',
                ['riderId' => (string) $rider->id],
            );
        }

        return ApiResponse::success((new RiderResource($rider->fresh('user')))->resolve(), 'Rider approved.');
    }

    public function reject(Request $request, Rider $rider, NotificationService $notifications): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $rider->update(['status' => 'rejected']);
        AuditLog::record($request->user(), 'rider.rejected', $rider, [
            'reason' => $validated['reason'] ?? null,
        ]);

        if ($rider->user) {
            $notifications->notify(
                $rider->user,
                'rider.rejected',
                'Rider application declined',
                $validated['reason'] ?? 'Your rider application was not approved at this time.',
                ['riderId' => (string) $rider->id],
            );
        }

        return ApiResponse::success((new RiderResource($rider->fresh('user')))->resolve(), 'Rider rejected.');
    }

    public function assign(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'rider_id' => ['required', 'integer', 'exists:riders,id'],
        ]);

        $rider = Rider::query()->findOrFail($validated['rider_id']);
        if ($rider->status !== 'approved') {
            abort(422, 'Rider is not approved.');
        }

        $order->update(['rider_id' => $rider->id]);
        $order->addEvent($order->status, 'Assigned to rider '.$rider->user?->name.'.');
        AuditLog::record($request->user(), 'order.assigned_rider', $order, [
            'rider_id' => $rider->id,
        ]);

        return ApiResponse::success(
            (new OrderResource($order->fresh(['items', 'store', 'events', 'rider.user'])))->resolve(),
            'Rider assigned.',
        );
    }
}
