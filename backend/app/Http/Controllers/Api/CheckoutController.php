<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Address;
use App\Services\CheckoutService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function store(Request $request, CheckoutService $checkout): JsonResponse
    {
        $validated = $request->validate([
            'address_id' => ['required', 'integer', 'exists:addresses,id'],
            'delivery_method' => ['nullable', 'string', 'max:40'],
            'payment_method' => ['nullable', 'string', 'max:40'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.variants' => ['nullable', 'array'],
        ]);

        $address = Address::query()->findOrFail($validated['address_id']);
        $orders = $checkout->checkout(
            $request->user(),
            $address,
            $validated['items'],
            $validated['delivery_method'] ?? 'standard',
            $validated['payment_method'] ?? 'demo',
        );

        return ApiResponse::success([
            'groupId' => $orders->first()?->group_id,
            'orders' => OrderResource::collection($orders)->resolve(),
        ], 'Order placed. Complete demo payment to confirm.', 201);
    }

    public function confirm(Request $request, CheckoutService $checkout): JsonResponse
    {
        $validated = $request->validate([
            'group_id' => ['required', 'string'],
        ]);

        $orders = $checkout->confirm($request->user(), $validated['group_id']);

        return ApiResponse::success([
            'groupId' => $validated['group_id'],
            'orders' => OrderResource::collection($orders)->resolve(),
        ], 'Demo payment recorded. Order confirmed.');
    }
}
