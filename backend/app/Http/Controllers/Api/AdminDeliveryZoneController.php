<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZone;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDeliveryZoneController extends Controller
{
    public function index(): JsonResponse
    {
        $zones = DeliveryZone::query()->orderBy('sort_order')->get()->map(fn (DeliveryZone $zone) => [
            'id' => (string) $zone->id,
            'name' => $zone->name,
            'state' => $zone->state,
            'city' => $zone->city,
            'fee' => (float) $zone->fee,
            'freeAbove' => $zone->free_above !== null ? (float) $zone->free_above : null,
            'isActive' => (bool) $zone->is_active,
            'sortOrder' => (int) $zone->sort_order,
        ]);

        return ApiResponse::success($zones);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'state' => ['nullable', 'string', 'max:80'],
            'city' => ['nullable', 'string', 'max:80'],
            'fee' => ['required', 'numeric', 'min:0'],
            'free_above' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $zone = DeliveryZone::query()->create([
            'name' => $validated['name'],
            'state' => $validated['state'] ?? null,
            'city' => $validated['city'] ?? null,
            'fee' => $validated['fee'],
            'free_above' => $validated['free_above'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 50,
        ]);

        return ApiResponse::success(['id' => (string) $zone->id], 'Delivery zone created.', 201);
    }

    public function update(Request $request, DeliveryZone $zone): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'state' => ['nullable', 'string', 'max:80'],
            'city' => ['nullable', 'string', 'max:80'],
            'fee' => ['sometimes', 'numeric', 'min:0'],
            'free_above' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $zone->update($validated);

        return ApiResponse::success(null, 'Delivery zone updated.');
    }
}
