<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StoreResource;
use App\Models\AuditLog;
use App\Models\Store;
use App\Services\NotificationService;
use App\Support\ApiResponse;
use App\Support\ProductQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminStoreController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Store::query()->with(['owner', 'mall', 'category'])->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('q')) {
            $q = '%'.$request->query('q').'%';
            $query->where(function ($inner) use ($q) {
                $inner->where('name', 'like', $q)
                    ->orWhere('slug', 'like', $q)
                    ->orWhereHas('owner', fn ($owner) => $owner->where('email', 'like', $q)->orWhere('name', 'like', $q));
            });
        }

        ['page' => $page, 'limit' => $limit] = ProductQuery::page($request, 20);
        $total = (clone $query)->count();
        $stores = $query->forPage($page, $limit)->get();

        return ApiResponse::paginated(
            $stores->map(fn (Store $store) => [
                ...(new StoreResource($store))->resolve(),
                'owner' => $store->owner ? [
                    'id' => (string) $store->owner->id,
                    'name' => $store->owner->name,
                    'email' => $store->owner->email,
                ] : null,
            ])->values()->all(),
            $total,
            $page,
            $limit,
        );
    }

    public function show(Store $store): JsonResponse
    {
        $store->load(['owner', 'mall', 'category']);

        return ApiResponse::success([
            ...(new StoreResource($store))->resolve(),
            'owner' => $store->owner ? [
                'id' => (string) $store->owner->id,
                'name' => $store->owner->name,
                'email' => $store->owner->email,
                'phone' => $store->owner->phone,
            ] : null,
            'bankName' => $store->bank_name,
            'bankAccountNumber' => $store->bank_account_number,
            'bankAccountName' => $store->bank_account_name,
            'createdAt' => $store->created_at?->toIso8601String(),
        ]);
    }

    public function approve(Request $request, Store $store, NotificationService $notifications): JsonResponse
    {
        $validated = $request->validate([
            'mall_id' => ['nullable', 'integer', 'exists:malls,id'],
        ]);

        $store->markKycApproved();
        if (! empty($validated['mall_id'])) {
            $store->update(['mall_id' => $validated['mall_id']]);
        }

        AuditLog::record($request->user(), 'store.approved', $store, [
            'mall_id' => $store->mall_id,
        ]);

        $store->loadMissing('owner');
        if ($store->owner) {
            $notifications->notify(
                $store->owner,
                'store.approved',
                'Your store was approved',
                $store->name.' is now live on Fastlink. You can publish products.',
                ['storeId' => (string) $store->id],
            );
        }

        return ApiResponse::success(
            (new StoreResource($store->fresh(['mall', 'category'])))->resolve(),
            'Store approved.',
        );
    }

    public function reject(Request $request, Store $store, NotificationService $notifications): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $store->markKycRejected($validated['reason'] ?? null);
        AuditLog::record($request->user(), 'store.rejected', $store, [
            'reason' => $validated['reason'] ?? null,
        ]);

        $store->loadMissing('owner');
        if ($store->owner) {
            $notifications->notify(
                $store->owner,
                'store.rejected',
                'Store application declined',
                $validated['reason'] ?? 'Your store application was not approved at this time.',
                ['storeId' => (string) $store->id],
            );
        }

        return ApiResponse::success(
            (new StoreResource($store->fresh(['mall', 'category'])))->resolve(),
            'Store rejected.',
        );
    }

    public function suspend(Request $request, Store $store): JsonResponse
    {
        $store->update(['status' => 'suspended']);
        AuditLog::record($request->user(), 'store.suspended', $store);

        return ApiResponse::success(
            (new StoreResource($store->fresh(['mall', 'category'])))->resolve(),
            'Store suspended.',
        );
    }
}
