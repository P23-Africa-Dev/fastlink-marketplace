<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use App\Support\ApiResponse;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerCampaignController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $storeIds = SellerContext::storeIds($request->user());
        $campaigns = Campaign::query()
            ->whereIn('store_id', $storeIds)
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success(CampaignResource::collection($campaigns)->resolve());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'channel' => ['required', 'string', 'max:40'],
            'spend' => ['nullable', 'numeric', 'min:0'],
            'conversions' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'in:active,completed,reviewing,on_hold,successful'],
            'starts_at' => ['nullable', 'date'],
        ]);

        $store = SellerContext::storeOrFail($request->user());
        $campaign = Campaign::query()->create([
            'store_id' => $store->id,
            'name' => $validated['name'],
            'channel' => $validated['channel'],
            'spend' => $validated['spend'] ?? 0,
            'conversions' => $validated['conversions'] ?? 0,
            'status' => $validated['status'] ?? 'active',
            'starts_at' => $validated['starts_at'] ?? now(),
        ]);

        return ApiResponse::success((new CampaignResource($campaign))->resolve(), 'Campaign created.', 201);
    }

    public function update(Request $request, Campaign $campaign): JsonResponse
    {
        $this->assertOwned($request, $campaign);
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'channel' => ['sometimes', 'string', 'max:40'],
            'spend' => ['sometimes', 'numeric', 'min:0'],
            'conversions' => ['sometimes', 'integer', 'min:0'],
            'status' => ['sometimes', 'in:active,completed,reviewing,on_hold,successful'],
            'starts_at' => ['sometimes', 'nullable', 'date'],
        ]);

        $campaign->update($validated);

        return ApiResponse::success((new CampaignResource($campaign->fresh()))->resolve(), 'Campaign updated.');
    }

    private function assertOwned(Request $request, Campaign $campaign): void
    {
        if (! SellerContext::storeIds($request->user())->contains($campaign->store_id) && $request->user()->role !== 'admin') {
            abort(403);
        }
    }
}
