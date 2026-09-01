<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\RiderDocument;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class RiderDocumentController extends Controller
{
    private const MAX_DOCUMENTS = 20;

    private const ALLOWED_TYPES = ['id_card', 'license', 'vehicle_registration', 'other'];
    public function index(Request $request): JsonResponse
    {
        $rider = $request->user()->rider;
        if (! $rider) {
            return ApiResponse::error('No rider profile found.', 404);
        }

        $docs = RiderDocument::query()
            ->where('rider_id', $rider->id)
            ->orderByDesc('id')
            ->get()
            ->map(fn (RiderDocument $doc) => $this->serialize($doc));

        return ApiResponse::success($docs);
    }

    public function store(Request $request): JsonResponse
    {
        $rider = $request->user()->rider;
        if (! $rider) {
            return ApiResponse::error('No rider profile found.', 404);
        }

        $validated = $request->validate([
            'type' => ['required', Rule::in(self::ALLOWED_TYPES)],
            'document' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:8192'],
        ]);

        $existingCount = RiderDocument::query()->where('rider_id', $rider->id)->count();
        if ($existingCount >= self::MAX_DOCUMENTS) {
            return ApiResponse::error('Document limit reached. Contact support to upload more.', 422);
        }

        $replaced = RiderDocument::query()
            ->where('rider_id', $rider->id)
            ->where('type', $validated['type'])
            ->where('status', 'pending')
            ->first();

        if ($replaced) {
            Storage::disk('public')->delete($replaced->file_path);
            $replaced->delete();
        }

        $path = $validated['document']->store('kyc/riders/'.$rider->id, 'public');
        $doc = RiderDocument::query()->create([
            'rider_id' => $rider->id,
            'type' => $validated['type'],
            'file_path' => $path,
            'file_url' => Storage::disk('public')->url($path),
            'status' => 'pending',
        ]);

        AuditLog::record($request->user(), 'kyc.rider_document', $rider, [
            'documentId' => (string) $doc->id,
            'type' => $doc->type,
            'replacedPending' => $replaced !== null,
        ]);

        return ApiResponse::success($this->serialize($doc), 'Document uploaded.', 201);
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(RiderDocument $doc): array
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
