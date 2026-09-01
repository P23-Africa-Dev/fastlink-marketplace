<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TrustReportResource;
use App\Models\Product;
use App\Models\Store;
use App\Models\TrustReport;
use App\Support\PageViewRecorder;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TrustReportController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject_type' => ['required', Rule::in(['product', 'store'])],
            'subject_id' => ['required', 'integer'],
            'reason' => ['required', 'string', 'max:120'],
            'details' => ['nullable', 'string', 'max:2000'],
        ]);

        $subject = match ($validated['subject_type']) {
            'product' => Product::query()->find($validated['subject_id']),
            'store' => Store::query()->find($validated['subject_id']),
            default => null,
        };

        if (! $subject) {
            throw ValidationException::withMessages(['subject_id' => 'Reported item was not found.']);
        }

        $duplicateOpenReport = TrustReport::query()
            ->where('reporter_id', $request->user()->id)
            ->where('subject_type', $validated['subject_type'])
            ->where('subject_id', $validated['subject_id'])
            ->whereIn('status', ['open', 'investigating'])
            ->exists();

        if ($duplicateOpenReport) {
            throw ValidationException::withMessages([
                'subject_id' => 'You already submitted a report for this item. Please wait for review.',
            ]);
        }

        $report = TrustReport::query()->create([
            'reporter_id' => $request->user()->id,
            'subject_type' => $validated['subject_type'],
            'subject_id' => $validated['subject_id'],
            'reason' => $validated['reason'],
            'details' => $validated['details'] ?? null,
            'status' => 'open',
        ]);

        PageViewRecorder::record(
            $request->user(),
            $validated['subject_type'] === 'store' ? $subject : ($subject->store ?? null),
            $validated['subject_type'] === 'product' ? $subject : null,
            '/trust-reports',
            'trust_report_submitted',
            ['reportId' => (string) $report->id, 'reason' => $validated['reason']],
        );

        return ApiResponse::success(
            (new TrustReportResource($report->load('reporter')))->resolve(),
            'Report submitted. Our team will review it.',
            201,
        );
    }
}
