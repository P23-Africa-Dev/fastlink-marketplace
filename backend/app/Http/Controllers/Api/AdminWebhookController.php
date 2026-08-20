<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaystackWebhookEventResource;
use App\Models\Payment;
use App\Models\PaystackWebhookEvent;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminWebhookController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PaystackWebhookEvent::query()->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->filled('q')) {
            $like = '%'.$request->query('q').'%';
            $query->where(function ($inner) use ($like) {
                $inner->where('event', 'like', $like)
                    ->orWhere('reference', 'like', $like);
            });
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 50);
        $total = (clone $query)->count();
        $rows = $query->forPage($page, $limit)->get();

        return ApiResponse::success([
            'data' => PaystackWebhookEventResource::collection($rows)->resolve(),
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'failedCount' => PaystackWebhookEvent::query()->where('status', 'failed')->count(),
        ]);
    }

    public function reconciliation(): JsonResponse
    {
        $events24h = PaystackWebhookEvent::query()
            ->where('created_at', '>=', now()->subDay())
            ->count();
        $processed24h = PaystackWebhookEvent::query()
            ->where('created_at', '>=', now()->subDay())
            ->where('status', 'processed')
            ->count();
        $failed24h = PaystackWebhookEvent::query()
            ->where('created_at', '>=', now()->subDay())
            ->whereIn('status', ['failed', 'invalid_signature'])
            ->count();

        $orphanEvents24h = PaystackWebhookEvent::query()
            ->where('created_at', '>=', now()->subDay())
            ->whereNotNull('reference')
            ->get(['reference'])
            ->filter(fn (PaystackWebhookEvent $event) => ! Payment::query()->where('reference', $event->reference)->exists())
            ->count();

        $pendingPayments24h = Payment::query()
            ->where('created_at', '>=', now()->subDay())
            ->where('status', 'pending')
            ->count();
        $paidPayments24h = Payment::query()
            ->where('created_at', '>=', now()->subDay())
            ->where('status', 'paid')
            ->count();

        return ApiResponse::success([
            'events24h' => $events24h,
            'processed24h' => $processed24h,
            'failed24h' => $failed24h,
            'orphanEvents24h' => $orphanEvents24h,
            'pendingPayments24h' => $pendingPayments24h,
            'paidPayments24h' => $paidPayments24h,
        ]);
    }
}
