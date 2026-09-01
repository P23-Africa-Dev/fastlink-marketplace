<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use App\Services\PromotionService;
use App\Support\ApiResponse;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerPromoCodeController extends Controller
{
    public function index(Request $request, PromotionService $promos): JsonResponse
    {
        $storeIds = SellerContext::storeIds($request->user());
        $codes = PromoCode::query()
            ->whereIn('store_id', $storeIds)
            ->orderByDesc('id')
            ->get()
            ->map(fn (PromoCode $promo) => $promos->serialize($promo));

        return ApiResponse::success($codes);
    }

    public function store(Request $request, PromotionService $promos): JsonResponse
    {
        $validated = $request->validate(PromotionService::rules());
        $store = SellerContext::storeOrFail($request->user());
        $promo = $promos->create($validated, (int) $store->id);

        return ApiResponse::success($promos->serialize($promo), 'Promo code created.', 201);
    }

    public function update(Request $request, PromoCode $promoCode, PromotionService $promos): JsonResponse
    {
        $this->assertOwned($request, $promoCode);
        $validated = $request->validate(PromotionService::rules(false));
        unset($validated['store_id']);
        $promo = $promos->update($promoCode, $validated);

        return ApiResponse::success($promos->serialize($promo), 'Promo code updated.');
    }

    private function assertOwned(Request $request, PromoCode $promo): void
    {
        if (! $promo->store_id || ! SellerContext::storeIds($request->user())->contains($promo->store_id)) {
            abort(403);
        }
    }
}
