<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DisputeResource;
use App\Models\AuditLog;
use App\Models\Dispute;
use App\Services\DisputeService;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminDisputeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Dispute::query()
            ->with(['order', 'store', 'buyer'])
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 30);
        $total = (clone $query)->count();
        $rows = $query->forPage($page, $limit)->get();

        return ApiResponse::success([
            'data' => DisputeResource::collection($rows)->resolve(),
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'openCount' => Dispute::query()->whereIn('status', ['open', 'seller_responded', 'under_review'])->count(),
        ]);
    }

    public function update(Request $request, Dispute $dispute, DisputeService $disputes): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', Rule::in(['review', 'resolve'])],
            'resolution' => ['required_if:action,resolve', Rule::in(['refund', 'replacement', 'rejected'])],
            'admin_note' => ['nullable', 'string', 'max:2000'],
            'refund_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        if ($validated['action'] === 'review') {
            $dispute = $disputes->escalateToReview($request->user(), $dispute);
            AuditLog::record($request->user(), 'dispute.review', $dispute);
        } else {
            $dispute = $disputes->resolve(
                $request->user(),
                $dispute,
                $validated['resolution'],
                $validated['admin_note'] ?? null,
                isset($validated['refund_amount']) ? (float) $validated['refund_amount'] : null,
            );
            AuditLog::record($request->user(), 'dispute.resolved', $dispute, [
                'resolution' => $validated['resolution'],
            ]);
        }

        return ApiResponse::success(
            (new DisputeResource($dispute->load(['order', 'store', 'buyer'])))->resolve(),
            'Dispute updated.',
        );
    }
}
