<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class DealController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->with(['images', 'category'])
            ->active()
            ->whereNotNull('compare_at_price')
            ->whereColumn('compare_at_price', '>', 'price')
            ->orderByDesc('is_featured')
            ->orderByDesc('id')
            ->limit(16)
            ->get();

        $deals = $products->map(function (Product $product) {
            $price = (float) $product->price;
            $compare = (float) $product->compare_at_price;
            $image = $product->images->firstWhere('is_primary', true) ?? $product->images->first();
            $reviews = $product->review_count >= 1000
                ? round($product->review_count / 1000, 1).'k'
                : (string) $product->review_count;

            return [
                'id' => (string) $product->id,
                'name' => $product->name,
                'category' => $product->category?->name ?? $product->subcategory ?? '',
                'discount' => $compare > 0 ? (int) round((($compare - $price) / $compare) * 100) : 0,
                'image' => $image?->url,
                'href' => '/products/'.$product->slug,
                'rating' => (float) $product->rating,
                'reviews' => $reviews,
            ];
        })->values()->all();

        return ApiResponse::success($deals);
    }
}
