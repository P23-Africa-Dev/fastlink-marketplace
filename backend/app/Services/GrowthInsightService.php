<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Support\SellerContext;
use App\Models\User;

class GrowthInsightService
{
    /**
     * @return list<array{type: string, title: string, detail: string, productId?: string}>
     */
    public function forSeller(User $seller): array
    {
        $storeIds = SellerContext::storeIds($seller);
        $insights = [];

        Product::query()
            ->whereIn('store_id', $storeIds)
            ->where('stock', '>', 0)
            ->where('stock', '<=', InventoryService::LOW_STOCK_THRESHOLD)
            ->whereIn('status', ['active', 'published'])
            ->limit(5)
            ->get()
            ->each(function (Product $product) use (&$insights) {
                $insights[] = [
                    'type' => 'restock',
                    'title' => 'Restock '.$product->name,
                    'detail' => 'Only '.$product->stock.' units left. Low stock can lose sales.',
                    'productId' => (string) $product->id,
                ];
            });

        $recentProductIds = Order::query()
            ->whereIn('store_id', $storeIds)
            ->where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subDays(30))
            ->with('items')
            ->get()
            ->flatMap(fn (Order $order) => $order->items->pluck('product_id'))
            ->filter()
            ->unique()
            ->all();

        Product::query()
            ->whereIn('store_id', $storeIds)
            ->whereIn('status', ['active', 'published'])
            ->where('stock', '>', 5)
            ->when($recentProductIds !== [], fn ($q) => $q->whereNotIn('id', $recentProductIds))
            ->limit(3)
            ->get()
            ->each(function (Product $product) use (&$insights) {
                $insights[] = [
                    'type' => 'promote',
                    'title' => 'Promote '.$product->name,
                    'detail' => 'No paid orders in 30 days. Consider a promo code or a small price drop.',
                    'productId' => (string) $product->id,
                ];
            });

        return $insights;
    }
}
