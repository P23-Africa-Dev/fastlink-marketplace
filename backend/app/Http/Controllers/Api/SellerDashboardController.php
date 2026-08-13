<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Support\ApiResponse;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerDashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $storeIds = SellerContext::storeIds($request->user());
        $range = $request->query('range', '30d');

        $orders = Order::query()->whereIn('store_id', $storeIds);
        $paid = (clone $orders)->where('payment_status', 'paid');

        $now = now();
        $currentStart = match ($range) {
            '7d' => $now->copy()->subDays(7),
            '1y' => $now->copy()->subYear(),
            default => $now->copy()->subDays(30),
        };
        $previousStart = $currentStart->copy()->sub($now->diff($currentStart));

        $currentRevenue = (clone $paid)->where('created_at', '>=', $currentStart)->sum('total');
        $previousRevenue = (clone $paid)
            ->where('created_at', '>=', $previousStart)
            ->where('created_at', '<', $currentStart)
            ->sum('total');
        $currentOrderCount = (clone $orders)->where('created_at', '>=', $currentStart)->count();
        $previousOrderCount = (clone $orders)
            ->where('created_at', '>=', $previousStart)
            ->where('created_at', '<', $currentStart)
            ->count();

        $recent = Order::query()
            ->with(['items'])
            ->whereIn('store_id', $storeIds)
            ->orderByDesc('id')
            ->limit(8)
            ->get();

        $topProducts = OrderItem::query()
            ->selectRaw('product_id, name_snapshot, image_snapshot, SUM(quantity) as sales, SUM(quantity * unit_price) as revenue')
            ->whereHas('order', fn ($query) => $query->whereIn('store_id', $storeIds)->where('payment_status', 'paid'))
            ->groupBy('product_id', 'name_snapshot', 'image_snapshot')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        return ApiResponse::success([
            'totalRevenue' => (float) (clone $paid)->sum('total'),
            'totalOrders' => (clone $orders)->where('status', '!=', 'cancelled')->count(),
            'totalProducts' => Product::query()->whereIn('store_id', $storeIds)->count(),
            'totalCustomers' => (int) (clone $orders)->select('buyer_id')->distinct()->count('buyer_id'),
            'revenueChange' => $this->percentChange((float) $currentRevenue, (float) $previousRevenue),
            'ordersChange' => $this->percentChange($currentOrderCount, $previousOrderCount),
            'chart' => $this->chart($storeIds->all(), $range),
            'recentOrders' => $recent->map(function (Order $order) {
                $item = $order->items->first();

                return [
                    'id' => (string) $order->id,
                    'reference' => $order->reference,
                    'customerName' => $order->buyer_name,
                    'amount' => (float) $order->total,
                    'status' => $order->status,
                    'displayStatus' => match ($order->status) {
                        'pending' => 'Pending',
                        'confirmed' => 'Successful',
                        'shipped' => 'Shipped',
                        'delivered' => 'Delivered',
                        'cancelled' => 'Refunded',
                        default => ucfirst($order->status),
                    },
                    'date' => $order->created_at?->toIso8601String(),
                    'title' => $item?->name_snapshot ?? $order->reference,
                    'sku' => $item?->sku_snapshot,
                    'image' => $item?->image_snapshot,
                    'quantity' => (int) ($item?->quantity ?? 0),
                    'delivery' => $order->tracking_number ?: 'Standard delivery',
                ];
            })->values()->all(),
            'topProducts' => $topProducts->map(fn ($row) => [
                'id' => $row->product_id ? (string) $row->product_id : $row->name_snapshot,
                'name' => $row->name_snapshot,
                'image' => $row->image_snapshot,
                'sales' => (int) $row->sales,
                'revenue' => (float) $row->revenue,
            ])->values()->all(),
        ]);
    }

    /**
     * @param  list<int|string>  $storeIds
     * @return list<array{name: string, value: float}>
     */
    private function chart(array $storeIds, string $range): array
    {
        $start = match ($range) {
            '7d' => now()->subDays(6)->startOfDay(),
            '1y' => now()->subMonths(11)->startOfMonth(),
            default => now()->subDays(29)->startOfDay(),
        };

        $orders = Order::query()
            ->whereIn('store_id', $storeIds)
            ->where('payment_status', 'paid')
            ->where('created_at', '>=', $start)
            ->get(['created_at', 'total']);

        if ($range === '7d') {
            $buckets = [];
            foreach ($orders as $order) {
                $key = $order->created_at?->toDateString();
                if ($key) {
                    $buckets[$key] = ($buckets[$key] ?? 0) + (float) $order->total;
                }
            }

            $points = [];
            for ($i = 6; $i >= 0; $i--) {
                $day = now()->subDays($i);
                $points[] = ['name' => $day->format('D'), 'value' => (float) ($buckets[$day->toDateString()] ?? 0)];
            }

            return $points;
        }

        if ($range === '1y') {
            $buckets = [];
            foreach ($orders as $order) {
                $key = $order->created_at?->format('Y-m');
                if ($key) {
                    $buckets[$key] = ($buckets[$key] ?? 0) + (float) $order->total;
                }
            }

            $points = [];
            for ($i = 11; $i >= 0; $i--) {
                $month = now()->subMonths($i);
                $points[] = ['name' => $month->format('M'), 'value' => (float) ($buckets[$month->format('Y-m')] ?? 0)];
            }

            return $points;
        }

        $buckets = [];
        foreach ($orders as $order) {
            $key = $order->created_at?->toDateString();
            if ($key) {
                $buckets[$key] = ($buckets[$key] ?? 0) + (float) $order->total;
            }
        }

        $points = [];
        for ($i = 29; $i >= 0; $i -= 3) {
            $day = now()->subDays($i);
            $value = 0.0;
            for ($j = 0; $j < 3; $j++) {
                $value += (float) ($buckets[now()->subDays(max(0, $i - $j))->toDateString()] ?? 0);
            }
            $points[] = ['name' => $day->format('M j'), 'value' => $value];
        }

        return $points;
    }

    private function percentChange(float $current, float $previous): float
    {
        if ($previous <= 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
