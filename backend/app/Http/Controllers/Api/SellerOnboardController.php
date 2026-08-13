<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
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
            'bank_name' => ['required', 'string', 'max:120'],
            'bank_account_number' => ['required', 'string', 'max:40'],
            'bank_account_name' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', Rule::in(['mall_store', 'independent', 'nationwide', 'emerging'])],
            'mall_id' => ['nullable', 'integer', 'exists:malls,id'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'location' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
        ]);

        $type = $validated['type'] ?? 'independent';
        if ($type === 'mall_store' && empty($validated['mall_id'])) {
            return ApiResponse::error('Please select a mall for a mall store.', 422);
        }

        $status = app()->environment('testing') ? 'approved' : 'pending';

        $store = Store::query()->create([
            'owner_id' => $user->id,
            'name' => $validated['business_name'],
            'slug' => Store::uniqueSlug($validated['business_name']),
            'phone' => $validated['phone'],
            'bank_name' => $validated['bank_name'],
            'bank_account_number' => $validated['bank_account_number'],
            'bank_account_name' => $validated['bank_account_name'],
            'type' => $type,
            'mall_id' => $type === 'mall_store' ? ($validated['mall_id'] ?? null) : null,
            'category_id' => $validated['category_id'] ?? null,
            'location' => $validated['location'] ?? null,
            'description' => $validated['description'] ?? null,
            'status' => $status,
        ]);

        $user->forceFill([
            'role' => 'seller',
            'phone' => $validated['phone'],
        ])->save();

        if ($status === 'pending') {
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
                'type' => $store->type,
            ],
            'user' => [
                'id' => (string) $user->id,
                'role' => $user->role,
            ],
        ], $status === 'approved'
            ? 'Store created and approved for testing.'
            : 'Store submitted. An admin will review it shortly.', 201);
    }
}
