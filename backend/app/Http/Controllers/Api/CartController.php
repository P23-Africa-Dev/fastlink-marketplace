<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CartRecoveryService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function sync(Request $request, CartRecoveryService $carts): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['present', 'array'],
            'items.*.product_id' => ['required'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'coupon_code' => ['nullable', 'string', 'max:40'],
        ]);

        $snapshot = $carts->sync(
            $request->user(),
            $validated['items'],
            isset($validated['coupon_code']) && trim((string) $validated['coupon_code']) !== ''
                ? trim((string) $validated['coupon_code'])
                : null,
        );

        return ApiResponse::success([
            'itemCount' => count($snapshot->items ?? []),
            'couponCode' => $snapshot->coupon_code,
        ]);
    }
}
