<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DisputeResource;
use App\Models\Dispute;
use App\Models\Order;
use App\Services\DisputeService;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DisputeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Dispute::query()
            ->with(['order', 'store', 'buyer'])
            ->where('buyer_id', $request->user()->id)
            ->orderByDesc('id');

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 20);
        $total = (clone $query)->count();
        $rows = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            DisputeResource::collection($rows)->resolve(),
            $total,
            $page,
            $limit,
        );
    }

    public function store(Request $request, Order $order, DisputeService $disputes): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:2000'],
            'type' => ['nullable', Rule::in(['refund', 'replacement', 'other'])],
            'buyer_evidence' => ['nullable', 'string', 'max:5000'],
        ]);

        $dispute = $disputes->open(
            $request->user(),
            $order,
            $validated['reason'],
            $validated['type'] ?? 'refund',
            $validated['buyer_evidence'] ?? null,
        );

        return ApiResponse::success(
            (new DisputeResource($dispute->load(['order', 'store', 'buyer'])))->resolve(),
            'Dispute opened. The seller and platform will review it.',
            201,
        );
    }

    public function show(Request $request, Dispute $dispute): JsonResponse
    {
        if ($dispute->buyer_id !== $request->user()->id) {
            abort(403);
        }

        return ApiResponse::success(
            (new DisputeResource($dispute->load(['order', 'store', 'buyer'])))->resolve(),
        );
    }

    public function showForOrder(Request $request, Order $order): JsonResponse
    {
        if ($order->buyer_id !== $request->user()->id && $request->user()->role !== 'admin') {
            abort(403);
        }

        $dispute = Dispute::query()
            ->with(['order', 'store', 'buyer'])
            ->where('order_id', $order->id)
            ->first();

        if (! $dispute) {
            return ApiResponse::success(null, 'No dispute for this order.');
        }

        return ApiResponse::success((new DisputeResource($dispute))->resolve());
    }
}
