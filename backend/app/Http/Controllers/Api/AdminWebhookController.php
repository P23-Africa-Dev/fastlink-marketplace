<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaystackWebhookEventResource;
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
}
