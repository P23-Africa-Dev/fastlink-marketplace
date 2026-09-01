<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TrustReportResource;
use App\Models\AuditLog;
use App\Models\Product;
use App\Models\Store;
use App\Models\TrustReport;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminTrustReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TrustReport::query()
            ->with(['reporter'])
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->filled('subject_type')) {
            $query->where('subject_type', $request->query('subject_type'));
        }
        if ($request->filled('reason')) {
            $query->where('reason', 'like', '%'.$request->query('reason').'%');
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 30);
        $total = (clone $query)->count();
        $reports = $query->forPage($page, $limit)->get();

        $reports->each(function (TrustReport $report) {
            if ($report->subject_type === 'product') {
                $report->setRelation('subject', Product::query()->find($report->subject_id));
            } elseif ($report->subject_type === 'store') {
                $report->setRelation('subject', Store::query()->find($report->subject_id));
            }
        });

        return ApiResponse::success([
            'data' => TrustReportResource::collection($reports)->resolve(),
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'openCount' => TrustReport::query()->where('status', 'open')->count(),
        ]);
    }

    public function update(Request $request, TrustReport $trustReport): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['open', 'investigating', 'resolved', 'dismissed'])],
            'admin_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $trustReport->update([
            'status' => $validated['status'],
            'admin_note' => $validated['admin_note'] ?? $trustReport->admin_note,
            'resolved_by' => in_array($validated['status'], ['resolved', 'dismissed'], true)
                ? $request->user()->id
                : null,
            'resolved_at' => in_array($validated['status'], ['resolved', 'dismissed'], true)
                ? now()
                : null,
        ]);

        AuditLog::record($request->user(), 'trust_report.updated', $trustReport, [
            'status' => $validated['status'],
        ]);

        if ($trustReport->subject_type === 'product') {
            $trustReport->setRelation('subject', Product::query()->find($trustReport->subject_id));
        } elseif ($trustReport->subject_type === 'store') {
            $trustReport->setRelation('subject', Store::query()->find($trustReport->subject_id));
        }

        return ApiResponse::success(
            (new TrustReportResource($trustReport->fresh(['reporter'])))->resolve(),
            'Report updated.',
        );
    }
}
