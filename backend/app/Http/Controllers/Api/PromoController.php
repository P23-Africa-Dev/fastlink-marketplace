<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PromotionService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    public function preview(Request $request, PromotionService $promos): JsonResponse
    {
        $validated = $request->validate([
            'coupon_code' => ['required', 'string', 'max:40'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $preview = $promos->previewCart(
            $request->user(),
            $validated['items'],
            $validated['coupon_code'],
        );

        return ApiResponse::success($preview);
    }
}
