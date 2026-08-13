<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SellerStoreResource;
use App\Support\ApiResponse;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerStoreController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $store = SellerContext::storeOrFail($request->user());

        return ApiResponse::success((new SellerStoreResource($store))->resolve());
    }

    public function update(Request $request): JsonResponse
    {
        $store = SellerContext::storeOrFail($request->user());

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'logo' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'banner' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'headline' => ['sometimes', 'nullable', 'string', 'max:255'],
            'delivery_tag' => ['sometimes', 'nullable', 'string', 'max:80'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:40'],
        ]);

        $store->fill($validated);
        $store->save();

        return ApiResponse::success((new SellerStoreResource($store->fresh()))->resolve(), 'Store updated.');
    }
}
