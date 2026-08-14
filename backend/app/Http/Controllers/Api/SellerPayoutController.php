<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PayoutResource;
use App\Http\Resources\SellerStoreResource;
use App\Models\Payment;
use App\Models\Payout;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SellerPayoutController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $storeIds = SellerContext::storeIds($request->user());
        $query = Payout::query()
            ->with('store')
            ->whereIn('store_id', $storeIds)
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 20);
        $total = (clone $query)->count();
        $payouts = $query->forPage($page, $limit)->get();

        return ApiResponse::success([
            'data' => PayoutResource::collection($payouts)->resolve(),
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => max(1, (int) ceil($total / $limit)),
            'hasNextPage' => $page * $limit < $total,
            'hasPrevPage' => $page > 1,
            'summary' => $this->summary($storeIds->all()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $store = SellerContext::storeOrFail($request->user());

        if (! $store->canSell()) {
            return ApiResponse::error(
                'Complete KYC verification before requesting payouts.',
                403,
                null,
                'KYC_REQUIRED',
            );
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
        ]);

        if (! $store->bank_account_number || ! $store->bank_name) {
            throw ValidationException::withMessages([
                'account' => 'Link a bank account in settings before requesting a payout.',
            ]);
        }

        $payout = DB::transaction(function () use ($request, $store, $validated) {
            $available = $this->available((int) $store->id);

            if ((float) $validated['amount'] > $available) {
                throw ValidationException::withMessages([
                    'amount' => 'Insufficient available balance.',
                ]);
            }

            return Payout::query()->create([
                'store_id' => $store->id,
                'amount' => $validated['amount'],
                'bank_name' => $store->bank_name,
                'account_number' => $store->bank_account_number,
                'account_name' => $store->bank_account_name,
                'status' => 'pending',
                'requested_by' => $request->user()->id,
            ]);
        });

        return ApiResponse::success(
            (new PayoutResource($payout->load('store')))->resolve(),
            'Payout requested. It will remain pending until an admin approves it.',
            201,
        );
    }

    public function accounts(Request $request): JsonResponse
    {
        $store = SellerContext::storeOrFail($request->user());

        return ApiResponse::success([
            'store' => (new SellerStoreResource($store))->resolve(),
            'bankName' => $store->bank_name,
            'bankAccountNumber' => $store->bank_account_number,
            'bankAccountName' => $store->bank_account_name,
        ]);
    }

    public function updateAccount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bank_name' => ['required', 'string', 'max:120'],
            'bank_account_number' => ['required', 'string', 'max:40'],
            'bank_account_name' => ['required', 'string', 'max:255'],
            'bank_code' => ['nullable', 'string', 'max:20'],
        ]);

        $store = SellerContext::storeOrFail($request->user());
        $payload = [
            'bank_name' => $validated['bank_name'],
            'bank_account_number' => $validated['bank_account_number'],
            'bank_account_name' => $validated['bank_account_name'],
        ];
        if (in_array($store->kyc_status, ['not_started', null, ''], true)) {
            $payload['kyc_status'] = 'in_progress';
        }
        $store->update($payload);

        return ApiResponse::success([
            'store' => (new SellerStoreResource($store->fresh()))->resolve(),
            'bankName' => $store->bank_name,
            'bankAccountNumber' => $store->bank_account_number,
            'bankAccountName' => $store->bank_account_name,
        ], 'Bank account saved.');
    }

    /**
     * @param  list<int|string>  $storeIds
     * @return array<string, float>
     */
    private function summary(array $storeIds): array
    {
        $earned = (float) Payment::query()->whereIn('store_id', $storeIds)->where('status', 'paid')->sum('net');
        $pending = (float) Payout::query()->whereIn('store_id', $storeIds)->whereIn('status', ['pending', 'approved'])->sum('amount');
        $transferred = (float) Payout::query()->whereIn('store_id', $storeIds)->where('status', 'transferred')->sum('amount');
        $reserved = (float) Payout::query()->whereIn('store_id', $storeIds)->whereIn('status', ['pending', 'approved', 'transferred'])->sum('amount');

        return [
            'available' => round($earned - $reserved, 2),
            'pending' => $pending,
            'transferred' => $transferred,
            'held' => $pending,
        ];
    }

    private function available(int $storeId): float
    {
        $earned = (float) Payment::query()->where('store_id', $storeId)->where('status', 'paid')->sum('net');
        $reserved = (float) Payout::query()->where('store_id', $storeId)->whereIn('status', ['pending', 'approved', 'transferred'])->sum('amount');

        return round($earned - $reserved, 2);
    }
}
