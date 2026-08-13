<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\WishlistItem;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = WishlistItem::query()
            ->with(['product.images', 'product.variants', 'product.store', 'product.brand', 'product.category'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('id')
            ->get();

        $products = $items->map(fn (WishlistItem $item) => $item->product)->filter();

        return ApiResponse::success(ProductResource::collection($products)->resolve());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required'],
        ]);

        $product = Product::query()->findOrFail($validated['product_id']);
        WishlistItem::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
        ]);

        return $this->index($request);
    }

    public function destroy(Request $request, string $productId): JsonResponse
    {
        WishlistItem::query()
            ->where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->delete();

        return $this->index($request);
    }
}
