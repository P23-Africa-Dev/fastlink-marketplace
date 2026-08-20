<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RiderResource;
use App\Http\Resources\StoreResource;
use App\Models\Rider;
use App\Models\RiderDocument;
use App\Models\Store;
use App\Models\StoreDocument;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class AdminVerificationController extends Controller
{
    public function index(): JsonResponse
    {
        $pendingStores = Store::query()
            ->with(['owner', 'mall', 'category'])
            ->where('status', 'pending')
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->map(fn (Store $store) => [
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
                'documents' => StoreDocument::query()
                    ->where('store_id', $store->id)
                    ->orderByDesc('id')
                    ->get()
                    ->map(fn (StoreDocument $doc) => [
                        'id' => (string) $doc->id,
                        'type' => $doc->type,
                        'fileUrl' => $doc->file_url,
                        'status' => $doc->status,
                    ])
                    ->values()
                    ->all(),
                'createdAt' => $store->created_at?->toIso8601String(),
            ]);

        $pendingRiders = Rider::query()
            ->with('user')
            ->where('status', 'pending')
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->map(function (Rider $rider): array {
                $documents = RiderDocument::query()
                    ->where('rider_id', $rider->id)
                    ->orderByDesc('id')
                    ->get()
                    ->map(fn (RiderDocument $doc) => [
                        'id' => (string) $doc->id,
                        'type' => $doc->type,
                        'fileUrl' => $doc->file_url,
                        'status' => $doc->status,
                    ])
                    ->values()
                    ->all();

                $payload = (new RiderResource($rider))->resolve();
                $payload['documents'] = $documents;
                $payload['hasRequiredIdCard'] = collect($documents)->contains(
                    fn (array $doc) => $doc['type'] === 'id_card'
                );

                return $payload;
            });

        return ApiResponse::success([
            'pendingStores' => $pendingStores->values()->all(),
            'pendingRiders' => $pendingRiders->values()->all(),
            'counts' => [
                'stores' => Store::query()->where('status', 'pending')->count(),
                'riders' => Rider::query()->where('status', 'pending')->count(),
                'total' => Store::query()->where('status', 'pending')->count()
                    + Rider::query()->where('status', 'pending')->count(),
            ],
        ]);
    }
}
