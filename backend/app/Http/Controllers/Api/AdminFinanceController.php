<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\PayoutResource;
use App\Models\AuditLog;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\PlatformSetting;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminFinanceController extends Controller
{
    public function payments(Request $request): JsonResponse
    {
        $query = Payment::query()->with(['order', 'store'])->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('q')) {
            $q = '%'.$request->query('q').'%';
            $query->where(function ($inner) use ($q) {
                $inner->where('reference', 'like', $q)
                    ->orWhereHas('order', fn ($order) => $order->where('reference', 'like', $q)->orWhere('buyer_email', 'like', $q));
            });
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 20);
        $total = (clone $query)->count();
        $payments = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            PaymentResource::collection($payments)->resolve(),
            $total,
            $page,
            $limit,
        );
    }

    public function payouts(Request $request): JsonResponse
    {
        $query = Payout::query()->with('store')->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 20);
        $total = (clone $query)->count();
        $payouts = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            PayoutResource::collection($payouts)->resolve(),
            $total,
            $page,
            $limit,
        );
    }

    public function approvePayout(Request $request, Payout $payout): JsonResponse
    {
        if ($payout->status !== 'pending') {
            throw ValidationException::withMessages(['status' => 'Only pending payouts can be approved.']);
        }

        $payout->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'provider_reference' => 'ADM-'.strtoupper(Str::random(10)),
        ]);

        AuditLog::record($request->user(), 'payout.approved', $payout, [
            'amount' => $payout->amount,
        ]);

        return ApiResponse::success(
            (new PayoutResource($payout->fresh('store')))->resolve(),
            'Payout approved.',
        );
    }

    public function rejectPayout(Request $request, Payout $payout): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        if (! in_array($payout->status, ['pending', 'approved'], true)) {
            throw ValidationException::withMessages(['status' => 'This payout cannot be rejected.']);
        }

        $payout->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'rejection_reason' => $validated['reason'] ?? null,
        ]);

        AuditLog::record($request->user(), 'payout.rejected', $payout, [
            'reason' => $validated['reason'] ?? null,
        ]);

        return ApiResponse::success(
            (new PayoutResource($payout->fresh('store')))->resolve(),
            'Payout rejected.',
        );
    }

    public function commission(): JsonResponse
    {
        return ApiResponse::success([
            'rate' => PlatformSetting::commissionRate(),
        ]);
    }

    public function updateCommission(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rate' => ['required', 'numeric', 'min:0', 'max:50'],
        ]);

        PlatformSetting::setValue('commission_rate', $validated['rate']);
        AuditLog::record($request->user(), 'settings.commission', $request->user(), [
            'rate' => $validated['rate'],
        ]);

        return ApiResponse::success([
            'rate' => PlatformSetting::commissionRate(),
        ], 'Commission rate updated.');
    }
}
