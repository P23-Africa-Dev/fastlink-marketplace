<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DisputeResource;
use App\Models\Dispute;
use App\Services\DisputeService;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerDisputeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $storeIds = SellerContext::storeIds($request->user());
        $query = Dispute::query()
            ->with(['order', 'store', 'buyer'])
            ->whereIn('store_id', $storeIds)
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

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

    public function respond(Request $request, Dispute $dispute, DisputeService $disputes): JsonResponse
    {
        $validated = $request->validate([
            'response' => ['required', 'string', 'max:5000'],
        ]);

        $dispute = $disputes->respond($request->user(), $dispute, $validated['response']);

        return ApiResponse::success(
            (new DisputeResource($dispute))->resolve(),
            'Response submitted.',
        );
    }
}
