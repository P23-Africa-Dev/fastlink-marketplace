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
     *     stores: list<array{name: string, slug: string}>,
     *     didYouMean?: string|null
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

        $didYouMean = null;
        if ($products === [] && mb_strlen($term) >= 3) {
            $didYouMean = $this->bestProductTerm($term);
            if ($didYouMean !== null && mb_strtolower($didYouMean) !== mb_strtolower($term)) {
                $ids = $this->fuzzyProductIds($didYouMean, $limit);
                if ($ids !== []) {
                    $products = Product::query()
                        ->with('images')
                        ->active()
                        ->whereIn('id', $ids)
                        ->get()
                        ->sortBy(fn (Product $product) => array_search($product->id, $ids, true))
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
                }
            }
        }

        return [
            'products' => $products,
            'brands' => $brands,
            'stores' => $stores,
            'didYouMean' => $didYouMean,
        ];
    }

    /**
     * @return list<int>
     */
    public function fuzzyProductIds(string $q, int $limit = 12): array
    {
        $term = trim(mb_strtolower($q));
        if ($term === '') {
            return [];
        }

        $candidates = Product::query()
            ->active()
            ->orderByDesc('is_featured')
            ->limit(250)
            ->get(['id', 'name', 'sku']);

        return $candidates
            ->map(function (Product $product) use ($term) {
                $name = mb_strtolower($product->name);
                $sku = mb_strtolower((string) $product->sku);
                $nameDistance = $this->minTermDistance($term, $name);
                $skuDistance = $sku !== '' ? levenshtein($term, $sku) : PHP_INT_MAX;
                $distance = min($nameDistance, $skuDistance);

                return ['id' => (int) $product->id, 'distance' => $distance];
            })
            ->sortBy('distance')
            ->filter(fn (array $row) => $row['distance'] <= 4)
            ->take($limit)
            ->pluck('id')
            ->values()
            ->all();
    }

    private function bestProductTerm(string $term): ?string
    {
        $needle = mb_strtolower(trim($term));
        if ($needle === '') {
            return null;
        }

        $names = Product::query()
            ->active()
            ->orderByDesc('is_featured')
            ->limit(200)
            ->pluck('name');

        $best = null;
        $bestScore = PHP_INT_MAX;
        foreach ($names as $name) {
            $score = $this->minTermDistance($needle, mb_strtolower((string) $name));
            if ($score < $bestScore) {
                $bestScore = $score;
                $best = (string) $name;
            }
        }

        return $bestScore <= 4 ? $best : null;
    }

    private function minTermDistance(string $needle, string $candidate): int
    {
        $parts = preg_split('/\s+/', $candidate) ?: [];
        $scores = [levenshtein($needle, $candidate)];
        foreach ($parts as $part) {
            $part = trim((string) $part);
            if ($part !== '') {
                $scores[] = levenshtein($needle, $part);
            }
        }

        return min($scores);
    }
}
