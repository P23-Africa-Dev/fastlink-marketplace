<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChargebackResource;
use App\Models\Chargeback;
use App\Models\Payment;
use App\Services\ChargebackService;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminChargebackController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Chargeback::query()
            ->with(['order', 'store', 'payment'])
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 30);
        $total = (clone $query)->count();
        $rows = $query->forPage($page, $limit)->get();

        return ApiResponse::success([
            'data' => ChargebackResource::collection($rows)->resolve(),
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'openCount' => Chargeback::query()->where('status', 'open')->count(),
        ]);
    }

    public function store(Request $request, ChargebackService $chargebacks): JsonResponse
    {
        $validated = $request->validate([
            'payment_id' => ['required', 'integer', 'exists:payments,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', 'max:2000'],
            'provider_reference' => ['nullable', 'string', 'max:120'],
        ]);

        $payment = Payment::query()->findOrFail($validated['payment_id']);
        $chargeback = $chargebacks->record(
            $request->user(),
            $payment,
            (float) $validated['amount'],
            $validated['reason'],
            $validated['provider_reference'] ?? null,
        );

        return ApiResponse::success(
            (new ChargebackResource($chargeback))->resolve(),
            'Chargeback recorded and linked to ledger.',
            201,
        );
    }

    public function update(Request $request, Chargeback $chargeback, ChargebackService $chargebacks): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['won', 'lost'])],
            'admin_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $chargeback = $chargebacks->resolve(
            $request->user(),
            $chargeback,
            $validated['status'],
            $validated['admin_note'] ?? null,
        );

        return ApiResponse::success(
            (new ChargebackResource($chargeback->load(['order', 'store', 'payment'])))->resolve(),
            'Chargeback updated.',
        );
    }
}
