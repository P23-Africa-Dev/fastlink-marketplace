<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PageView;
use App\Support\ApiResponse;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class SellerAnalyticsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $storeIds = SellerContext::storeIds($request->user());
        $range = $this->normalizeRange((string) $request->query('range', '7days'));
        [$currentStart, $previousStart, $buckets] = $this->window($range);

        $now = now();
        $orders = Order::query()->whereIn('store_id', $storeIds);
        $paid = (clone $orders)->where('payment_status', 'paid');

        $currentPaid = (clone $paid)->where('created_at', '>=', $currentStart);
        $previousPaid = (clone $paid)->where('created_at', '>=', $previousStart)->where('created_at', '<', $currentStart);
        $currentOrders = (clone $orders)->where('created_at', '>=', $currentStart);
        $previousOrders = (clone $orders)->where('created_at', '>=', $previousStart)->where('created_at', '<', $currentStart);

        $revenue = (float) (clone $currentPaid)->sum('total');
        $prevRevenue = (float) (clone $previousPaid)->sum('total');
        $orderCount = (clone $currentOrders)->count();
        $prevOrders = (clone $previousOrders)->count();
        $visitors = PageView::query()->whereIn('store_id', $storeIds)->where('created_at', '>=', $currentStart)->count();
        $prevVisitors = PageView::query()
            ->whereIn('store_id', $storeIds)
            ->where('created_at', '>=', $previousStart)
            ->where('created_at', '<', $currentStart)
            ->count();

        $paidRows = (clone $currentPaid)->get(['total', 'created_at']);
        $viewRows = PageView::query()
            ->whereIn('store_id', $storeIds)
            ->where('created_at', '>=', $currentStart)
            ->get(['created_at']);

        $chartRevenue = [];
        $chartTraffic = [];
        foreach ($buckets as $bucket) {
            $chartRevenue[] = [
                'name' => $bucket['label'],
                'value' => round((float) $paidRows
                    ->filter(fn ($row) => Carbon::parse($row->created_at)->betweenIncluded($bucket['start'], $bucket['end']))
                    ->sum('total'), 2),
            ];
            $chartTraffic[] = [
                'name' => $bucket['label'],
                'visitors' => $viewRows
                    ->filter(fn ($row) => Carbon::parse($row->created_at)->betweenIncluded($bucket['start'], $bucket['end']))
                    ->count(),
            ];
        }

        $conversion = $visitors > 0 ? round($orderCount / $visitors * 100, 2) : 0;
        $prevConversion = $prevVisitors > 0 ? round($prevOrders / $prevVisitors * 100, 2) : 0;

        return ApiResponse::success([
            'range' => $range,
            'revenue' => $revenue,
            'revenueChange' => $this->delta($revenue, $prevRevenue),
            'visitors' => $visitors,
            'visitorsChange' => $this->delta($visitors, $prevVisitors),
            'orders' => $orderCount,
            'ordersChange' => $this->delta($orderCount, $prevOrders),
            'conversion' => $conversion,
            'conversionChange' => $this->delta($conversion, $prevConversion),
            'chartRevenue' => $chartRevenue,
            'chartTraffic' => $chartTraffic,
        ]);
    }

    private function normalizeRange(string $range): string
    {
        return match ($range) {
            'today' => 'today',
            '30days', '30d' => '30days',
            '1year', '1y' => '1year',
            default => '7days',
        };
    }

    /**
     * @return array{0: Carbon, 1: Carbon, 2: list<array{label: string, start: Carbon, end: Carbon}>}
     */
    private function window(string $range): array
    {
        $now = now();

        return match ($range) {
            'today' => [
                $now->copy()->startOfDay(),
                $now->copy()->subDay()->startOfDay(),
                collect(range(9, 21, 2))->map(function (int $hour) use ($now) {
                    $start = $now->copy()->startOfDay()->setHour($hour);
                    return ['label' => $start->format('g A'), 'start' => $start, 'end' => $start->copy()->addHours(2)->subSecond()];
                })->all(),
            ],
            '30days' => [
                $now->copy()->subDays(30),
                $now->copy()->subDays(60),
                collect(range(5, 0))->map(function (int $i) use ($now) {
                    $start = $now->copy()->subDays($i * 5)->startOfDay();
                    return ['label' => $start->format('M j'), 'start' => $start, 'end' => $start->copy()->addDays(5)->subSecond()];
                })->all(),
            ],
            '1year' => [
                $now->copy()->subYear(),
                $now->copy()->subYears(2),
                collect(range(11, 0))->map(function (int $i) use ($now) {
                    $start = $now->copy()->startOfMonth()->subMonths($i);
                    return ['label' => $start->format('M'), 'start' => $start, 'end' => $start->copy()->endOfMonth()];
                })->all(),
            ],
            default => [
                $now->copy()->subDays(7),
                $now->copy()->subDays(14),
                collect(range(6, 0))->map(function (int $i) use ($now) {
                    $start = $now->copy()->subDays($i)->startOfDay();
                    return ['label' => $start->format('D'), 'start' => $start, 'end' => $start->copy()->endOfDay()];
                })->all(),
            ],
        };
    }

    private function delta(float|int $current, float|int $previous): string
    {
        if ($previous == 0) {
            return $current > 0 ? '+100%' : '0%';
        }
        $change = round((($current - $previous) / $previous) * 100, 1);

        return ($change >= 0 ? '+' : '').$change.'%';
    }
}
