<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReturnResource;
use App\Models\ReturnRequest;
use App\Services\ReturnService;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReturnController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ReturnRequest::query()
            ->with(['order', 'buyer', 'store'])
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
