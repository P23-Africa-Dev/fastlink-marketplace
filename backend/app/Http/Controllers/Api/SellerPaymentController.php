<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class SellerPaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $storeIds = SellerContext::storeIds($request->user());
        $query = Payment::query()
            ->with(['order', 'store'])
            ->whereIn('store_id', $storeIds)
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('q')) {
            $q = '%'.$request->query('q').'%';
            $query->where(function ($inner) use ($q) {
                $inner->where('reference', 'like', $q)
                    ->orWhereHas('order', function ($order) use ($q) {
                        $order->where('reference', 'like', $q)
                            ->orWhere('buyer_name', 'like', $q)
                            ->orWhere('buyer_email', 'like', $q);
                    });
            });
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 20);
        $total = (clone $query)->count();
        $payments = $query->forPage($page, $limit)->get();

        $all = Payment::query()->whereIn('store_id', $storeIds);
        $paid = (clone $all)->where('status', 'paid');
        $paidCount = (clone $paid)->count();
        $volume = (float) (clone $paid)->sum('amount');

        $chartStart = now()->startOfMonth()->subMonths(5);
        $chartRows = Payment::query()
            ->whereIn('store_id', $storeIds)
            ->where('status', 'paid')
            ->where('created_at', '>=', $chartStart)
            ->get(['amount', 'created_at']);

        $chart = collect(range(0, 5))->map(function (int $offset) use ($chartStart, $chartRows) {
            $month = $chartStart->copy()->addMonths($offset);

            return [
                'name' => $month->format('M'),
                'volume' => round((float) $chartRows
                    ->filter(fn ($row) => Carbon::parse($row->created_at)->isSameMonth($month))
                    ->sum('amount'), 2),
            ];
        })->values()->all();

        return ApiResponse::success([
            'data' => PaymentResource::collection($payments)->resolve(),
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => max(1, (int) ceil($total / $limit)),
            'hasNextPage' => $page * $limit < $total,
            'hasPrevPage' => $page > 1,
            'summary' => [
                'volume' => $volume,
                'fees' => (float) (clone $paid)->sum('fees'),
                'net' => (float) (clone $paid)->sum('net'),
                'pending' => (clone $all)->where('status', 'pending')->count(),
                'average' => $paidCount > 0 ? round($volume / $paidCount, 2) : 0,
            ],
            'chart' => $chart,
        ]);
    }
}
