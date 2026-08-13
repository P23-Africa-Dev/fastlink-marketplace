<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReturnResource;
use App\Models\ReturnRequest;
use App\Services\ReturnService;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerReturnController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $storeIds = SellerContext::storeIds($request->user());
        $query = ReturnRequest::query()
            ->with(['order', 'buyer', 'store'])
            ->whereIn('store_id', $storeIds)
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 20);
        $total = (clone $query)->count();
        $rows = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            ReturnResource::collection($rows)->resolve(),
            $total,
            $page,
            $limit,
        );
    }

    public function update(Request $request, ReturnRequest $return, ReturnService $returns): JsonResponse
    {
        $storeIds = SellerContext::storeIds($request->user());
        if (! $storeIds->contains($return->store_id)) {
            abort(403);
        }

        $validated = $request->validate([
            'action' => ['required', 'in:approve,reject'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $result = $validated['action'] === 'approve'
            ? $returns->approve($request->user(), $return)
            : $returns->reject($request->user(), $return, $validated['note'] ?? null);

        return ApiResponse::success(
            (new ReturnResource($result->load(['order', 'store', 'buyer'])))->resolve(),
            'Return updated.',
        );
    }
}
