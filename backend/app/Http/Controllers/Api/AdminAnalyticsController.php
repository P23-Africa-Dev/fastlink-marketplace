<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class AdminAnalyticsController extends Controller
{
    public function show(): JsonResponse
    {
        $paid = Order::query()->where('payment_status', 'paid');
        $gmv = (float) (clone $paid)->sum('total');
        $take = (float) Payment::query()->where('status', 'paid')->sum('fees');
        $orders = Order::query()->count();
        $start = now()->subDays(30);
        $prev = now()->subDays(60);
        $currentGmv = (float) (clone $paid)->where('created_at', '>=', $start)->sum('total');
        $previousGmv = (float) (clone $paid)->where('created_at', '>=', $prev)->where('created_at', '<', $start)->sum('total');

        $chart = collect(range(5, 0))->map(function (int $i) use ($paid) {
            $month = now()->startOfMonth()->subMonths($i);
            $volume = (float) (clone $paid)
                ->where('created_at', '>=', $month)
                ->where('created_at', '<=', $month->copy()->endOfMonth())
                ->sum('total');

            return [
                'name' => $month->format('M'),
                'gmv' => round($volume, 2),
            ];
        })->values()->all();

        $growth = $previousGmv == 0 ? ($currentGmv > 0 ? 100 : 0) : round((($currentGmv - $previousGmv) / $previousGmv) * 100, 1);

        return ApiResponse::success([
            'gmv' => $gmv,
            'take' => $take,
            'takeRate' => $gmv > 0 ? round($take / $gmv * 100, 2) : 0,
            'orders' => $orders,
            'buyers' => User::query()->where('role', 'buyer')->count(),
            'sellers' => User::query()->where('role', 'seller')->count(),
            'growth30d' => $growth,
            'chart' => $chart,
        ]);
    }
}
