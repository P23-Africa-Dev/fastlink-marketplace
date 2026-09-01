<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\StoreResource;
use App\Models\Store;
use App\Services\ReputationService;
use App\Support\ApiResponse;
use App\Support\PageViewRecorder;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function nationwide(): JsonResponse
    {
        $stores = Store::query()
            ->with(['category', 'mall'])
            ->where('type', 'nationwide')
            ->where('status', 'approved')
            ->orderBy('name')
            ->get();

        $data = $stores->map(function (Store $store) {
            return [
                'id' => (string) $store->id,
                'name' => $store->name,
                'tagline' => $store->headline ?: ($store->delivery_tag ?: 'Ships Nationwide'),
                'href' => '/stores/'.$store->slug,
            ];
        })->values()->all();

        return ApiResponse::success($data);
    }

    public function show(string $slug, Request $request): JsonResponse
    {
        $store = Store::query()
            ->with(['category', 'mall'])
            ->where('slug', $slug)
            ->where('status', 'approved')
            ->firstOrFail();

        PageViewRecorder::record($request->user(), $store, null, '/stores/'.$store->slug);

        $reputation = app(ReputationService::class)->forStore($store);
        $data = (new StoreResource($store))->resolve();
        $data['reputation'] = $reputation;

        return ApiResponse::success($data);
    }

    public function products(Request $request, string $slug): JsonResponse
    {
        $store = Store::query()->where('slug', $slug)->where('status', 'approved')->firstOrFail();

        $query = $store->products()->with(['images', 'variants', 'store', 'brand', 'category']);
        ProductQuery::apply($query, $request);

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 24);
        $total = (clone $query)->count();
        $products = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            ProductResource::collection($products)->resolve(),
            $total,
            $page,
            $limit,
        );
    }
}
