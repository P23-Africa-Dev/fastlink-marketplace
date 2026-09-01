<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use App\Services\PromotionService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPromoCodeController extends Controller
{
    public function index(PromotionService $promos): JsonResponse
    {
        $codes = PromoCode::query()
            ->orderByDesc('id')
            ->get()
            ->map(fn (PromoCode $promo) => $promos->serialize($promo));

        return ApiResponse::success($codes);
    }

    public function store(Request $request, PromotionService $promos): JsonResponse
    {
        $validated = $request->validate(PromotionService::rules());
        $storeId = isset($validated['store_id']) ? (int) $validated['store_id'] : null;
        $promo = $promos->create($validated, $storeId);

        return ApiResponse::success($promos->serialize($promo), 'Promo code created.', 201);
    }

    public function update(Request $request, PromoCode $promoCode, PromotionService $promos): JsonResponse
    {
        $validated = $request->validate(PromotionService::rules(false));
        $promo = $promos->update($promoCode, $validated);

        return ApiResponse::success($promos->serialize($promo), 'Promo code updated.');
    }
}
