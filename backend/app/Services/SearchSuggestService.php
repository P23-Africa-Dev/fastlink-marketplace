<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\Product;
use App\Models\Store;

class SearchSuggestService
{
    /**
     * @return array{
     *     products: list<array{id: string, name: string, slug: string, image: string|null}>,
     *     brands: list<array{name: string, slug: string}>,
     *     stores: list<array{name: string, slug: string}>
     * }
     */
    public function suggest(string $q, int $limit = 6): array
    {
        $term = trim($q);
        if (mb_strlen($term) < 2) {
            return ['products' => [], 'brands' => [], 'stores' => []];
        }

        $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $term).'%';
        $prefix = str_replace(['%', '_'], ['\\%', '\\_'], $term).'%';

        $products = Product::query()
            ->with('images')
            ->active()
            ->where(function ($query) use ($like) {
                $query->where('name', 'like', $like)
                    ->orWhere('sku', 'like', $like);
            })
            ->orderByRaw('CASE WHEN name LIKE ? THEN 0 ELSE 1 END', [$prefix])
            ->orderByDesc('is_featured')
            ->limit($limit)
            ->get()
            ->map(function (Product $product) {
                $image = $product->images->firstWhere('is_primary', true) ?? $product->images->first();

                return [
                    'id' => (string) $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'image' => $image?->url,
                ];
            })
            ->values()
            ->all();

        $brands = Brand::query()
            ->where(function ($query) use ($like) {
                $query->where('name', 'like', $like)
                    ->orWhere('product_brand', 'like', $like);
            })
            ->limit(3)
            ->get(['name', 'slug'])
            ->map(fn (Brand $brand) => [
                'name' => $brand->product_brand ?: $brand->name,
                'slug' => $brand->slug,
            ])
            ->values()
            ->all();

        $stores = Store::query()
            ->where('status', 'approved')
            ->where('name', 'like', $like)
            ->limit(3)
            ->get(['name', 'slug'])
            ->map(fn (Store $store) => [
                'name' => $store->name,
                'slug' => $store->slug,
            ])
            ->values()
            ->all();

        return [
            'products' => $products,
            'brands' => $brands,
            'stores' => $stores,
        ];
    }
}
