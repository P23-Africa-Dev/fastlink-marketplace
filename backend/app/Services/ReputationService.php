<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Review;
use App\Models\Store;

class ReputationService
{
    /**
     * @return array{score: float, badge: string|null, metrics: array<string, float|int>}
     */
    public function forStore(Store $store): array
    {
        $orders = Order::query()->where('store_id', $store->id);
        $totalOrders = (clone $orders)->count();
        $delivered = (clone $orders)->where('status', 'delivered')->count();
        $cancelled = (clone $orders)->where('status', 'cancelled')->count();

        $fulfillmentRate = $totalOrders > 0
            ? round(($delivered / $totalOrders) * 100, 1)
            : 100.0;

        $cancellationRate = $totalOrders > 0
            ? round(($cancelled / $totalOrders) * 100, 1)
            : 0.0;

        $reviews = Review::query()
            ->whereHas('product', fn ($q) => $q->where('store_id', $store->id))
            ->where('status', 'approved');

        $avgRating = (float) ((clone $reviews)->avg('rating') ?? 0);
        $reviewCount = (clone $reviews)->count();

        $ratingScore = min(100, ($avgRating / 5) * 100);
        $fulfillmentScore = min(100, $fulfillmentRate);
        $cancelPenalty = max(0, 100 - ($cancellationRate * 2));

        $score = round(
            ($ratingScore * 0.45) + ($fulfillmentScore * 0.35) + ($cancelPenalty * 0.20),
            1,
        );

        if ($reviewCount < 3) {
            $score = min($score, 79.9);
        }

        $badge = null;
        if ($score >= 85 && $reviewCount >= 5 && $fulfillmentRate >= 90) {
            $badge = 'trusted_seller';
        } elseif ($score >= 70 && $reviewCount >= 2) {
            $badge = 'verified_seller';
        }

        return [
            'score' => $score,
            'badge' => $badge,
            'metrics' => [
                'averageRating' => round($avgRating, 2),
                'reviewCount' => $reviewCount,
                'fulfillmentRate' => $fulfillmentRate,
                'cancellationRate' => $cancellationRate,
                'totalOrders' => $totalOrders,
            ],
        ];
    }
}
