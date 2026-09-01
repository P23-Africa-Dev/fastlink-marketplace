<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReturnResource;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Services\ReturnService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReturnController extends Controller
{
    public function store(Request $request, Order $order, ReturnService $returns): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:2000'],
        ]);

        $return = $returns->request($request->user(), $order, $validated['reason']);

        return ApiResponse::success(
            (new ReturnResource($return->load(['order', 'store'])))->resolve(),
            'Return request submitted.',
            201,
        );
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        if ($order->buyer_id !== $request->user()->id && $request->user()->role !== 'admin') {
            abort(403);
        }

        $return = ReturnRequest::query()
            ->with(['order', 'store'])
            ->where('order_id', $order->id)
            ->first();

        if (! $return) {
            return ApiResponse::success(null, 'No return request for this order.');
        }

        return ApiResponse::success((new ReturnResource($return))->resolve());
    }
}
