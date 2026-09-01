<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\AuditLog;
use App\Models\Order;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::query()->with(['items', 'store', 'rider.user'])->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', Order::normalizeStatus((string) $request->query('status')));
        }

        if ($request->filled('q')) {
            $q = '%'.$request->query('q').'%';
            $query->where(function ($inner) use ($q) {
                $inner->where('reference', 'like', $q)
                    ->orWhere('tracking_number', 'like', $q)
                    ->orWhere('buyer_email', 'like', $q)
                    ->orWhere('buyer_name', 'like', $q);
            });
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

    public function show(Order $order): JsonResponse
    {
        $order->load(['items', 'store', 'events']);

        return ApiResponse::success((new OrderResource($order))->resolve());
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,confirmed,shipped,delivered,cancelled'],
        ]);

        $previous = $order->status;
        $order->update(['status' => $validated['status']]);
        $order->addEvent($validated['status'], 'Admin set status to '.$validated['status'].'.');
        AuditLog::record($request->user(), 'order.status', $order, [
            'from' => $previous,
            'to' => $validated['status'],
        ]);

        return ApiResponse::success(
            (new OrderResource($order->fresh(['items', 'store', 'events'])))->resolve(),
            'Order updated.',
        );
    }
}
