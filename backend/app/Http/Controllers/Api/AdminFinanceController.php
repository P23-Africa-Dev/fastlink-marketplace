<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\PayoutResource;
use App\Models\AuditLog;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\PlatformSetting;
use App\Services\LedgerService;
use App\Services\NotificationService;
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

        app(LedgerService::class)->recordPayoutApproved($payout->fresh());

        $payout->loadMissing('store.owner');
        if ($payout->store?->owner) {
            app(NotificationService::class)->notify(
                $payout->store->owner,
                'payout.approved',
                'Payout approved',
                'Your payout request of ₦'.number_format((float) $payout->amount, 2).' was approved.',
                [
                    'amount' => (float) $payout->amount,
                    'ctaUrl' => rtrim((string) config('app.frontend_url'), '/').'/payouts',
                    'ctaLabel' => 'View payouts',
                ],
            );
        }

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

        $payout->loadMissing('store.owner');
        if ($payout->store?->owner) {
            app(NotificationService::class)->notify(
                $payout->store->owner,
                'payout.rejected',
                'Payout rejected',
                $validated['reason'] ?? 'Your payout request was rejected.',
                [
                    'amount' => (float) $payout->amount,
                    'reason' => $validated['reason'] ?? null,
                    'ctaUrl' => rtrim((string) config('app.frontend_url'), '/').'/payouts',
                    'ctaLabel' => 'View payouts',
                ],
            );
        }

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

    public function settings(): JsonResponse
    {
        return ApiResponse::success(PlatformSetting::marketplaceConfig());
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'commissionRate' => ['sometimes', 'numeric', 'min:0', 'max:50'],
            'returnWindowDays' => ['sometimes', 'integer', 'min:1', 'max:90'],
            'minOrderAmount' => ['sometimes', 'numeric', 'min:0'],
            'defaultShippingFee' => ['sometimes', 'numeric', 'min:0'],
            'maintenanceMode' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('commissionRate', $validated)) {
            PlatformSetting::setValue('commission_rate', $validated['commissionRate']);
        }
        if (array_key_exists('returnWindowDays', $validated)) {
            PlatformSetting::setValue('return_window_days', $validated['returnWindowDays']);
        }
        if (array_key_exists('minOrderAmount', $validated)) {
            PlatformSetting::setValue('min_order_amount', $validated['minOrderAmount']);
        }
        if (array_key_exists('defaultShippingFee', $validated)) {
            PlatformSetting::setValue('default_shipping_fee', $validated['defaultShippingFee']);
        }
        if (array_key_exists('maintenanceMode', $validated)) {
            PlatformSetting::setValue('maintenance_mode', $validated['maintenanceMode'] ? '1' : '0');
        }

        AuditLog::record($request->user(), 'settings.marketplace', $request->user(), $validated);

        return ApiResponse::success(PlatformSetting::marketplaceConfig(), 'Marketplace settings updated.');
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
