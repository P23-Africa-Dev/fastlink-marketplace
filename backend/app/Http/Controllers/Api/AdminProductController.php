<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\AuditLog;
use App\Models\Product;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with(['store', 'category', 'brand', 'images'])->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('q')) {
            $q = '%'.$request->query('q').'%';
            $query->where(function ($inner) use ($q) {
                $inner->where('name', 'like', $q)->orWhere('sku', 'like', $q)->orWhere('slug', 'like', $q);
            });
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 20);
        $total = (clone $query)->count();
        $products = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            ProductResource::collection($products)->resolve(),
            $total,
            $page,
            $limit,
        );
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['store', 'category', 'brand', 'images', 'variants']);

        return ApiResponse::success((new ProductResource($product))->resolve());
    }

    public function unpublish(Request $request, Product $product): JsonResponse
    {
        $product->update(['status' => 'archived']);
        AuditLog::record($request->user(), 'product.unpublished', $product);

        return ApiResponse::success(
            (new ProductResource($product->fresh(['store', 'category', 'brand', 'images'])))->resolve(),
            'Product unpublished.',
        );
    }
}
