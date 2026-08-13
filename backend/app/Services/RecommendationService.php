<?php

namespace App\Services;

use App\Http\Resources\ProductResource;
use App\Models\Order;
use App\Models\PageView;
use App\Models\Product;
use App\Models\User;
use App\Models\WishlistItem;

class RecommendationService
{
    /**
     * @return array{forYou: list<array<string, mixed>>, recentlyViewed: list<array<string, mixed>>}
     */
    public function forUser(?User $user, int $limit = 8): array
    {
        $recentIds = $user ? $this->recentlyViewedIds($user, 8) : [];
        $seedIds = $user ? $this->seedProductIds($user, $recentIds) : [];
        $exclude = array_values(array_unique(array_merge($seedIds, $recentIds)));

        $forYou = $this->relatedToSeeds($seedIds, $exclude, $limit);
        if ($forYou->count() < $limit) {
            $needed = $limit - $forYou->count();
            $fallback = Product::query()
                ->with(['images', 'variants', 'store', 'brand', 'category'])
                ->active()
                ->where('stock', '>', 0)
                ->when($forYou->isNotEmpty(), fn ($q) => $q->whereNotIn('id', $forYou->pluck('id')))
                ->when($exclude !== [], fn ($q) => $q->whereNotIn('id', $exclude))
                ->orderByDesc('is_featured')
                ->orderByDesc('is_bestseller')
                ->orderByDesc('rating')
                ->limit($needed)
                ->get();
            $forYou = $forYou->concat($fallback);
        }

        $recent = $recentIds === []
            ? collect()
            : Product::query()
                ->with(['images', 'variants', 'store', 'brand', 'category'])
                ->active()
                ->whereIn('id', $recentIds)
                ->get()
                ->sortBy(fn (Product $p) => array_search($p->id, $recentIds, false))
                ->values();

        return [
            'forYou' => ProductResource::collection($forYou->take($limit))->resolve(),
            'recentlyViewed' => ProductResource::collection($recent)->resolve(),
        ];
    }

    /**
     * @param  list<int>  $recentIds
     * @return list<int>
     */
    private function seedProductIds(User $user, array $recentIds): array
    {
        $wishlist = WishlistItem::query()->where('user_id', $user->id)->pluck('product_id');
        $purchased = Order::query()
            ->where('buyer_id', $user->id)
            ->where('payment_status', 'paid')
            ->with('items')
            ->latest('id')
            ->limit(15)
            ->get()
            ->flatMap(fn (Order $order) => $order->items->pluck('product_id'));

        return collect($recentIds)
            ->concat($wishlist)
            ->concat($purchased)
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return list<int>
     */
    private function recentlyViewedIds(User $user, int $limit): array
    {
        return PageView::query()
            ->where('viewer_id', $user->id)
            ->whereNotNull('product_id')
            ->latest('id')
            ->limit(40)
            ->pluck('product_id')
            ->unique()
            ->take($limit)
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }

    /**
     * @param  list<int>  $seedIds
     * @param  list<int>  $exclude
     * @return \Illuminate\Support\Collection<int, Product>
     */
    private function relatedToSeeds(array $seedIds, array $exclude, int $limit)
    {
        if ($seedIds === []) {
            return collect();
        }

        $seeds = Product::query()->whereIn('id', $seedIds)->get();
        $categoryIds = $seeds->pluck('category_id')->filter()->unique()->all();
        $storeIds = $seeds->pluck('store_id')->filter()->unique()->all();

        return Product::query()
            ->with(['images', 'variants', 'store', 'brand', 'category'])
            ->active()
            ->where('stock', '>', 0)
            ->when($exclude !== [], fn ($q) => $q->whereNotIn('id', $exclude))
            ->where(function ($query) use ($categoryIds, $storeIds) {
                if ($categoryIds !== []) {
                    $query->whereIn('category_id', $categoryIds);
                }
                if ($storeIds !== []) {
                    $query->orWhereIn('store_id', $storeIds);
                }
            })
            ->orderByDesc('is_featured')
            ->orderByDesc('rating')
            ->limit($limit)
            ->get();
    }
}
