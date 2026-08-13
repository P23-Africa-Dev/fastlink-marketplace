<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Support\ApiResponse;
use App\Support\PageViewRecorder;
use App\Support\ProductQuery;
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

        return $this->index($request);
    }
}
