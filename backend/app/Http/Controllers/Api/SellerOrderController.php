<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\CheckoutService;
use App\Services\NotificationService;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SellerOrderController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Order::class);

        $query = Order::query()
            ->with(['items', 'store', 'events'])
            ->orderByDesc('id');

        if ($request->user()->role !== 'admin') {
            $query->whereIn('store_id', \App\Support\SellerContext::storeIds($request->user()));
        }

        if ($request->filled('status') && $request->query('status') !== 'All') {
            $query->where('status', Order::normalizeStatus((string) $request->query('status')));
        }

        if ($request->filled('q')) {
            $q = '%'.$request->query('q').'%';
            $query->where(function ($inner) use ($q) {
                $inner->where('reference', 'like', $q)
                    ->orWhere('buyer_name', 'like', $q)
                    ->orWhere('buyer_email', 'like', $q)
                    ->orWhere('tracking_number', 'like', $q);
            });
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 50);
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
        $model = $this->findForSeller($request, $order);
        $this->authorize('view', $model);

        return ApiResponse::success((new OrderResource($model->load(['items', 'store', 'events'])))->resolve());
    }

    public function updateStatus(Request $request, string $order, CheckoutService $checkout): JsonResponse
    {
        $model = $this->findForSeller($request, $order);
        $this->authorize('update', $model);

        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $next = Order::normalizeStatus($validated['status']);

        if (! in_array($next, Order::STATUSES, true)) {
            throw ValidationException::withMessages(['status' => 'Unknown status.']);
        }

        if ($next === $model->status) {
            return ApiResponse::success((new OrderResource($model->load(['items', 'store', 'events'])))->resolve());
        }

        if (! $model->canTransitionTo($next)) {
            throw ValidationException::withMessages([
                'status' => "Cannot change status from {$model->status} to {$next}.",
            ]);
        }

        if ($next === 'cancelled') {
            $checkout->restoreStock($model);
        }

        $model->update(['status' => $next]);
        $model->addEvent($next, $this->eventTitle($next));

        $type = match ($next) {
            'confirmed' => 'order.confirmed',
            'shipped' => 'order.shipped',
            'delivered' => 'order.delivered',
            'cancelled' => 'order.cancelled',
            default => null,
        };
        if ($type) {
            app(NotificationService::class)->notifyOrderEvent(
                $model->fresh(['buyer', 'store.owner']),
                $type,
                $this->eventTitle($next),
                $this->eventTitle($next),
            );
        }

        return ApiResponse::success(
            (new OrderResource($model->fresh(['items', 'store', 'events'])))->resolve(),
            'Order status updated.',
        );
    }

    private function findForSeller(Request $request, string $value): Order
    {
        $clean = ltrim($value, '#');
        $order = Order::query()
            ->with('store')
            ->where(function ($query) use ($clean) {
                $query->where('id', $clean)->orWhere('reference', $clean);
            })
            ->first();

        if (! $order) {
            abort(404);
        }

        return $order;
    }

    private function eventTitle(string $status): string
    {
        return match ($status) {
            'confirmed' => 'Your order has been confirmed.',
            'shipped' => 'Your order is on the way.',
            'delivered' => 'Your order has been delivered. Thank you for shopping at Fastlink!',
            'cancelled' => 'Your order was cancelled and stock was restored.',
            default => 'Order status updated.',
        };
    }
}
