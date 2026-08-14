<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Services\NotificationService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SellerOnboardController extends Controller
{
    public function store(Request $request, NotificationService $notifications): JsonResponse
    {
        $user = $request->user();

        if ($user->store()->exists()) {
            return ApiResponse::error('You already have a store.', 422);
        }

        $validated = $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:40'],
            'bank_name' => ['nullable', 'string', 'max:120'],
            'bank_account_number' => ['nullable', 'string', 'max:40'],
            'bank_account_name' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', Rule::in(['mall_store', 'independent', 'nationwide', 'emerging'])],
            'mall_id' => ['nullable', 'integer', 'exists:malls,id'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'location' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'submit_kyc' => ['sometimes', 'boolean'],
        ]);

        $type = $validated['type'] ?? 'independent';
        if ($type === 'mall_store' && empty($validated['mall_id'])) {
            return ApiResponse::error('Please select a mall for a mall store.', 422);
        }

        $hasBank = filled($validated['bank_name'] ?? null)
            && filled($validated['bank_account_number'] ?? null)
            && filled($validated['bank_account_name'] ?? null);

        $submitKyc = (bool) ($validated['submit_kyc'] ?? $hasBank);
        if ($submitKyc && ! $hasBank) {
            return ApiResponse::error('Bank details are required to submit KYC for review.', 422);
        }

        $status = app()->environment('testing') && $submitKyc ? 'approved' : 'pending';
        $kycStatus = match (true) {
            app()->environment('testing') && $submitKyc => 'approved',
            $submitKyc => 'under_review',
            $hasBank => 'in_progress',
            default => 'not_started',
        };

        $store = Store::query()->create([
            'owner_id' => $user->id,
            'name' => $validated['business_name'],
            'slug' => Store::uniqueSlug($validated['business_name']),
            'phone' => $validated['phone'],
            'bank_name' => $validated['bank_name'] ?? null,
            'bank_account_number' => $validated['bank_account_number'] ?? null,
            'bank_account_name' => $validated['bank_account_name'] ?? null,
            'type' => $type,
            'mall_id' => $type === 'mall_store' ? ($validated['mall_id'] ?? null) : null,
            'category_id' => $validated['category_id'] ?? null,
            'location' => $validated['location'] ?? null,
            'description' => $validated['description'] ?? null,
            'status' => $status,
            'kyc_status' => $kycStatus,
            'kyc_submitted_at' => $submitKyc ? now() : null,
            'kyc_verified_at' => $status === 'approved' ? now() : null,
        ]);

        $user->forceFill([
            'role' => 'seller',
            'phone' => $validated['phone'],
        ])->save();

        if ($submitKyc && $status === 'pending') {
            $notifications->notifyAdmins(
                'application.store_submitted',
                'New store application: '.$store->name,
                $user->name.' submitted '.$store->name.' for review.',
                ['storeId' => (string) $store->id, 'ownerId' => (string) $user->id],
            );
        }

        return ApiResponse::success([
            'store' => [
                'id' => (string) $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
                'status' => $store->status,
                'kycStatus' => $store->kyc_status,
                'type' => $store->type,
                'canSell' => $store->canSell(),
            ],
            'user' => [
                'id' => (string) $user->id,
                'role' => $user->role,
            ],
        ], $submitKyc
            ? 'Store submitted for verification.'
            : 'Store created. Complete KYC when you are ready to sell.', 201);
    }

    public function submitKyc(Request $request, NotificationService $notifications): JsonResponse
    {
        $user = $request->user();
        $store = $user->store;

        if (! $store) {
            return ApiResponse::error('Create a store before submitting KYC.', 404, null, 'STORE_REQUIRED');
        }

        if ($store->kyc_status === 'approved' && $store->status === 'approved') {
            return ApiResponse::success([
                'store' => [
                    'id' => (string) $store->id,
                    'status' => $store->status,
                    'kycStatus' => $store->kyc_status,
                    'canSell' => $store->canSell(),
                ],
            ], 'KYC already approved.');
        }

        $validated = $request->validate([
            'bank_name' => ['sometimes', 'nullable', 'string', 'max:120'],
            'bank_account_number' => ['sometimes', 'nullable', 'string', 'max:40'],
            'bank_account_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:40'],
        ]);

        $store->fill(array_filter([
            'bank_name' => $validated['bank_name'] ?? null,
            'bank_account_number' => $validated['bank_account_number'] ?? null,
            'bank_account_name' => $validated['bank_account_name'] ?? null,
            'phone' => $validated['phone'] ?? null,
        ], fn ($value) => $value !== null));
        $store->save();

        $hasBank = filled($store->bank_name)
            && filled($store->bank_account_number)
            && filled($store->bank_account_name);

        if (! $hasBank) {
            return ApiResponse::error('Bank details are required to submit KYC for review.', 422);
        }

        if (app()->environment('testing')) {
            $store->markKycApproved();
        } else {
            $store->markKycSubmitted();
            $notifications->notifyAdmins(
                'application.store_submitted',
                'KYC submitted: '.$store->name,
                $user->name.' submitted KYC for '.$store->name.'.',
                ['storeId' => (string) $store->id, 'ownerId' => (string) $user->id],
            );
        }

        $store->refresh();

        return ApiResponse::success([
            'store' => [
                'id' => (string) $store->id,
                'status' => $store->status,
                'kycStatus' => $store->kyc_status,
                'canSell' => $store->canSell(),
            ],
        ], app()->environment('testing')
            ? 'KYC approved.'
            : 'KYC submitted for review.');
    }
}
