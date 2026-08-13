<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerOnboardController extends Controller
{
    public function store(Request $request): JsonResponse
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
        ]);

        $status = app()->environment(['local', 'testing']) ? 'approved' : 'pending';

        $store = Store::query()->create([
            'owner_id' => $user->id,
            'name' => $validated['business_name'],
            'slug' => Store::uniqueSlug($validated['business_name']),
            'phone' => $validated['phone'],
            'bank_name' => $validated['bank_name'],
            'bank_account_number' => $validated['bank_account_number'],
            'bank_account_name' => $validated['bank_account_name'],
            'type' => 'independent',
            'status' => $status,
        ]);

        $user->forceFill([
            'role' => 'seller',
            'phone' => $validated['phone'],
        ])->save();

        return ApiResponse::success([
            'store' => [
                'id' => (string) $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
                'status' => $store->status,
            ],
            'user' => [
                'id' => (string) $user->id,
                'role' => $user->role,
            ],
        ], $status === 'approved'
            ? 'Store created and approved for local development.'
            : 'Store submitted. An admin will review it shortly.', 201);
    }
}
