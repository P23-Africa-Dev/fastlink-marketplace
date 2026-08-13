<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $query = Order::query()
            ->with(['items', 'store', 'events'])
            ->where('buyer_id', $request->user()->id)
            ->orderByDesc('id');

        if ($request->filled('status') && $request->query('status') !== 'All') {
            $query->where('status', Order::normalizeStatus((string) $request->query('status')));
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 20);
        $total = (clone $query)->count();
        $orders = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            OrderResource::collection($orders)->resolve(),
            $total,
            $page,
            $limit,
        );
    }

    public function show(Request $request, string $order): JsonResponse
    {
        $model = $this->findOwnedOrFail($request, $order);
        $this->authorize('view', $model);

        return ApiResponse::success((new OrderResource($model->load(['items', 'store', 'events'])))->resolve());
    }

    public function track(Request $request, string $order): JsonResponse
    {
        $model = $this->findByReference($order);

        if (! $model) {
            abort(404);
        }

        $user = $request->user();
        $email = strtolower((string) $request->query('email', ''));

        $allowed = ($user && ($user->id === $model->buyer_id || $user->role === 'admin' || $model->store?->owner_id === $user->id))
            || ($email !== '' && $email === strtolower($model->buyer_email));

        if (! $allowed) {
            abort(404);
        }

        return ApiResponse::success((new OrderResource($model->load(['items', 'store', 'events'])))->resolve());
    }

    private function findOwnedOrFail(Request $request, string $value): Order
    {
        $order = $this->findByReference($value);

        if (! $order || $order->buyer_id !== $request->user()->id) {
            abort(404);
        }

        return $order;
    }

    private function findByReference(string $value): ?Order
    {
        $clean = ltrim($value, '#');

        return Order::query()
            ->with('store')
            ->where(function ($query) use ($clean) {
                $query->where('id', $clean)
                    ->orWhere('reference', $clean)
                    ->orWhere('tracking_number', $clean);
            })
            ->first();
    }
}
