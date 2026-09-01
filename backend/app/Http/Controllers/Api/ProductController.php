<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Support\ApiResponse;
use App\Support\PageViewRecorder;
use App\Support\ProductQuery;
use App\Services\SearchSuggestService;
use App\Services\ReputationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with(['images', 'variants', 'store', 'brand', 'category']);
        ProductQuery::apply($query, $request);

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 12);
        $total = (clone $query)->count();
        $products = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            ProductResource::collection($products)->resolve(),
            $total,
            $page,
            $limit,
        );
    }

    public function show(string $idOrSlug, Request $request): JsonResponse
    {
        $product = Product::query()
            ->with(['images', 'variants', 'store', 'brand', 'category'])
            ->where(function ($query) use ($idOrSlug) {
                $query->where('slug', $idOrSlug);
                if (ctype_digit($idOrSlug)) {
                    $query->orWhere('id', $idOrSlug);
                }
            })
            ->firstOrFail();

        if (! Product::isPublicStatus($product->status)) {
            abort(404);
        }

        PageViewRecorder::record($request->user(), $product->store, $product, '/products/'.$product->slug);

        $payload = (new ProductResource($product))->resolve();
        if ($product->store) {
            $payload['storeReputation'] = app(ReputationService::class)->forStore($product->store);
        }

        return ApiResponse::success($payload);
    }

    public function search(Request $request): JsonResponse
    {
        $request->merge([
            'q' => $request->query('q', $request->query('query')),
        ]);

        $response = $this->index($request);
        $payload = $response->getData(true);
        $term = trim((string) ($request->query('q') ?? ''));

        if (($payload['data']['total'] ?? 0) > 0 || mb_strlen($term) < 3) {
            $payload['data']['typoToleranceApplied'] = false;

            return response()->json($payload, $response->status());
        }

        $suggest = app(SearchSuggestService::class);
        $ids = $suggest->fuzzyProductIds($term, 12);
        if ($ids === []) {
            $payload['data']['typoToleranceApplied'] = false;

            return response()->json($payload, $response->status());
        }

        $products = Product::query()
            ->with(['images', 'variants', 'store', 'brand', 'category'])
            ->active()
            ->whereIn('id', $ids)
            ->get()
            ->sortBy(fn (Product $product) => array_search($product->id, $ids, true))
            ->values();

        return ApiResponse::success([
            'data' => ProductResource::collection($products)->resolve(),
            'total' => $products->count(),
            'page' => 1,
            'limit' => max(1, (int) $request->query('limit', 12)),
            'typoToleranceApplied' => true,
        ]);
    }

    public function suggest(Request $request, \App\Services\SearchSuggestService $suggest): JsonResponse
    {
        $q = trim((string) $request->query('q', $request->query('query', '')));

        return ApiResponse::success($suggest->suggest($q));
    }
}
