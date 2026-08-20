<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\StoreDocument;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class SellerDocumentController extends Controller
{
    private const MAX_DOCUMENTS = 20;

    private const ALLOWED_TYPES = ['cac', 'id_card', 'bank_statement', 'other'];
    public function index(Request $request): JsonResponse
    {
        $store = $request->user()->store;
        if (! $store) {
            return ApiResponse::error('No store found.', 404);
        }

        $docs = StoreDocument::query()
            ->where('store_id', $store->id)
            ->orderByDesc('id')
            ->get()
            ->map(fn (StoreDocument $doc) => $this->serialize($doc));

        return ApiResponse::success($docs);
    }

    public function store(Request $request): JsonResponse
    {
        $store = $request->user()->store;
        if (! $store) {
            return ApiResponse::error('No store found.', 404);
        }

        $validated = $request->validate([
            'type' => ['required', Rule::in(self::ALLOWED_TYPES)],
            'document' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:8192'],
        ]);

        $existingCount = StoreDocument::query()->where('store_id', $store->id)->count();
        if ($existingCount >= self::MAX_DOCUMENTS) {
            return ApiResponse::error('Document limit reached. Contact support to upload more.', 422);
        }

        $replaced = StoreDocument::query()
            ->where('store_id', $store->id)
            ->where('type', $validated['type'])
            ->where('status', 'pending')
            ->first();

        if ($replaced) {
            Storage::disk('public')->delete($replaced->file_path);
            $replaced->delete();
        }

        $path = $validated['document']->store('kyc/stores/'.$store->id, 'public');
        $doc = StoreDocument::query()->create([
            'store_id' => $store->id,
            'type' => $validated['type'],
            'file_path' => $path,
            'file_url' => Storage::disk('public')->url($path),
            'status' => 'pending',
        ]);

        AuditLog::record($request->user(), 'kyc.store_document', $store, [
            'documentId' => (string) $doc->id,
            'type' => $doc->type,
            'replacedPending' => $replaced !== null,
        ]);

        if (in_array($store->kyc_status, ['not_started', null, ''], true)) {
            $store->update(['kyc_status' => 'in_progress']);
        }

        return ApiResponse::success($this->serialize($doc), 'Document uploaded.', 201);
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(StoreDocument $doc): array
    {
        return [
            'id' => (string) $doc->id,
            'type' => $doc->type,
            'fileUrl' => $doc->file_url,
            'status' => $doc->status,
            'adminNote' => $doc->admin_note,
            'createdAt' => $doc->created_at?->toIso8601String(),
        ];
    }
}
