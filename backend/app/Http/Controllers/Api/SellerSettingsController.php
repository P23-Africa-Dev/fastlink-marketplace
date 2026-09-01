<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SellerStoreResource;
use App\Support\ApiResponse;
use App\Support\NotificationPreferences;
use App\Support\SellerContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerSettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = SellerContext::storeOrFail($user);

        return ApiResponse::success([
            'store' => (new SellerStoreResource($store))->resolve(),
            'notifications' => NotificationPreferences::normalize($user->notification_preferences),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = SellerContext::storeOrFail($user);

        $validated = $request->validate([
            'bank_name' => ['sometimes', 'nullable', 'string', 'max:120'],
            'bank_account_number' => ['sometimes', 'nullable', 'string', 'max:40'],
            'bank_account_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'notifications' => ['sometimes', 'array'],
            'notifications.sale' => ['sometimes', 'array'],
            'notifications.sale.email' => ['sometimes', 'boolean'],
            'notifications.sale.push' => ['sometimes', 'boolean'],
            'notifications.order' => ['sometimes', 'array'],
            'notifications.order.email' => ['sometimes', 'boolean'],
            'notifications.order.push' => ['sometimes', 'boolean'],
            'notifications.stock' => ['sometimes', 'array'],
            'notifications.stock.email' => ['sometimes', 'boolean'],
            'notifications.stock.push' => ['sometimes', 'boolean'],
        ]);

        $store->fill(array_filter([
            'bank_name' => $validated['bank_name'] ?? null,
            'bank_account_number' => $validated['bank_account_number'] ?? null,
            'bank_account_name' => $validated['bank_account_name'] ?? null,
        ], fn ($value) => $value !== null));

        if (
            in_array($store->kyc_status, ['not_started', null, ''], true)
            && (filled($store->bank_name) || filled($store->bank_account_number) || filled($store->bank_account_name))
        ) {
            $store->kyc_status = 'in_progress';
        }

        $store->save();

        if (isset($validated['notifications'])) {
            $user->notification_preferences = NotificationPreferences::normalize(
                array_replace_recursive(
                    NotificationPreferences::normalize($user->notification_preferences),
                    $validated['notifications'],
                )
            );
            $user->save();
        }

        return ApiResponse::success([
            'store' => (new SellerStoreResource($store->fresh()))->resolve(),
            'notifications' => NotificationPreferences::normalize($user->fresh()->notification_preferences),
        ], 'Settings saved.');
    }
}
