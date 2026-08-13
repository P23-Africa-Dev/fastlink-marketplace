<?php

namespace App\Support;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Store;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ProductQuery
{
    /**
     * Shop category names/slugs that map onto one or more catalog slugs.
     *
     * @var array<string, list<string>>
     */
    private const CATEGORY_SLUGS = [
        'electronics' => ['electronics'],
        'fashion' => ['fashion'],
        'groceries' => ['groceries'],
        'beauty' => ['beauty'],
        'health' => ['health', 'beauty'],
        'home-living' => ['home-living'],
        'home & living' => ['home-living'],
        'home & kitchen' => ['home-living'],
        'books' => ['books'],
        'stationery' => ['books'],
    ];

    public static function apply(Builder $query, Request $request, bool $activeOnly = true): Builder
    {
        if ($activeOnly) {
            $query->active();
        }

        if ($request->filled('featured')) {
            $featured = filter_var($request->query('featured'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($featured) {
                $query->where('is_featured', true);
            }
        }

        if ($request->filled('q')) {
            $q = '%'.str_replace(['%', '_'], ['\\%', '\\_'], (string) $request->query('q')).'%';
            $query->where(function (Builder $inner) use ($q) {
                $inner->where('name', 'like', $q)
                    ->orWhere('description', 'like', $q)
                    ->orWhere('sku', 'like', $q)
                    ->orWhere('subcategory', 'like', $q);
            });
        }

        $categoryIds = self::resolveCategoryIds($request->query('category'));
        if ($categoryIds !== null) {
            $query->whereIn('category_id', $categoryIds);
        }

        if ($request->filled('store')) {
            $value = (string) $request->query('store');
            $store = Store::query()
                ->where('slug', $value)
                ->when(ctype_digit($value), fn ($q) => $q->orWhere('id', $value))
                ->first();
            $query->where('store_id', $store?->id ?? 0);
        }

        if ($request->filled('brand')) {
            $brand = Brand::query()
                ->where('slug', $request->query('brand'))
                ->orWhere('product_brand', $request->query('brand'))
                ->orWhere('name', $request->query('brand'))
                ->first();
            $query->where('brand_id', $brand?->id ?? 0);
        }

        if ($request->filled('min_price') || $request->filled('minPrice')) {
            $query->where('price', '>=', (float) ($request->query('min_price') ?? $request->query('minPrice')));
        }

        if ($request->filled('max_price') || $request->filled('maxPrice')) {
            $query->where('price', '<=', (float) ($request->query('max_price') ?? $request->query('maxPrice')));
        }

        if (filter_var($request->query('inStock') ?? $request->query('in_stock'), FILTER_VALIDATE_BOOLEAN)) {
            $query->where('stock', '>', 0);
        }

        self::applySort($query, (string) ($request->query('sort') ?? $request->query('sortBy') ?? ''));

        return $query;
    }

    public static function applySort(Builder $query, string $sort): void
    {
        match ($sort) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'rating' => $query->orderByDesc('rating'),
            'newest' => $query->orderByDesc('created_at'),
            'bestseller' => $query->orderByDesc('is_bestseller')->orderByDesc('review_count'),
            default => $query->orderByDesc('is_featured')->orderByDesc('created_at'),
        };
    }

    /**
     * @return list<int>|null
     */
    public static function resolveCategoryIds(?string $category): ?array
    {
        if ($category === null || $category === '' || $category === 'all') {
            return null;
        }

        $key = strtolower($category);
        $slugs = self::CATEGORY_SLUGS[$key] ?? null;

        if ($slugs !== null) {
            return Category::query()->whereIn('slug', $slugs)->pluck('id')->all();
        }

        $match = Category::query()
            ->where('slug', $category)
            ->orWhere('name', $category)
            ->first();

        return $match ? [$match->id] : [0];
    }

    /**
     * @return array{page: int, limit: int}
     */
    public static function page(Request $request, int $defaultLimit = 12): array
    {
        $page = max(1, (int) $request->query('page', 1));
        $limit = min(50, max(1, (int) ($request->query('limit') ?? $defaultLimit)));

        return ['page' => $page, 'limit' => $limit];
    }
}
