<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Address;
use App\Models\PlatformSetting;
use App\Services\CheckoutService;
use App\Services\PaymentService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function store(Request $request, CheckoutService $checkout): JsonResponse
    {
        if (PlatformSetting::maintenanceMode()) {
            throw ValidationException::withMessages([
                'checkout' => 'Checkout is temporarily unavailable while we perform maintenance.',
            ]);
        }

        $validated = $request->validate([
            'address_id' => ['required', 'integer', 'exists:addresses,id'],
            'delivery_method' => ['nullable', 'string', 'max:40'],
            'payment_method' => ['nullable', 'string', 'max:40'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.variants' => ['nullable', 'array'],
            'coupon_code' => ['nullable', 'string', 'max:40'],
        ]);

        $address = Address::query()->findOrFail($validated['address_id']);
        $orders = $checkout->checkout(
            $request->user(),
            $address,
            $validated['items'],
            $validated['delivery_method'] ?? 'standard',
            $validated['payment_method'] ?? 'demo',
            $this->couponCode($validated),
        );

        return ApiResponse::success([
            'groupId' => $orders->first()?->group_id,
            'orders' => OrderResource::collection($orders)->resolve(),
        ], 'Order placed. Complete payment to confirm.', 201);
    }

    public function initialize(Request $request, PaymentService $payments): JsonResponse
    {
        $validated = $request->validate([
            'group_id' => ['required', 'string'],
        ]);

        $result = $payments->initialize($request->user(), $validated['group_id']);

        return ApiResponse::success($result, $result['alreadyPaid']
            ? 'Order already paid.'
            : 'Redirect the buyer to complete payment.');
    }

    public function verify(Request $request, PaymentService $payments): JsonResponse
    {
        $validated = $request->validate([
            'reference' => ['required', 'string'],
        ]);

        $orders = $payments->verify($validated['reference'], $request->user());

        return ApiResponse::success([
            'groupId' => $orders->first()?->group_id,
            'reference' => $validated['reference'],
            'orders' => OrderResource::collection($orders)->resolve(),
        ], 'Payment confirmed.');
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

    public function quote(Request $request, CheckoutService $checkout): JsonResponse
    {
        $validated = $request->validate([
            'address_id' => ['required', 'integer', 'exists:addresses,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.variants' => ['nullable', 'array'],
            'coupon_code' => ['nullable', 'string', 'max:40'],
        ]);

        $address = Address::query()->findOrFail($validated['address_id']);
        $quote = $checkout->quote(
            $request->user(),
            $address,
            $validated['items'],
            $this->couponCode($validated),
        );

        return ApiResponse::success($quote);
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function couponCode(array $validated): ?string
    {
        $code = isset($validated['coupon_code']) ? trim((string) $validated['coupon_code']) : '';

        return $code !== '' ? $code : null;
    }
}
