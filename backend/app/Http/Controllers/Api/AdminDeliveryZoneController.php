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
            'etaMinDays' => (int) $zone->eta_min_days,
            'etaMaxDays' => (int) $zone->eta_max_days,
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
            'eta_min_days' => ['sometimes', 'integer', 'min:0', 'max:60'],
            'eta_max_days' => ['sometimes', 'integer', 'min:0', 'max:90'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $zone = DeliveryZone::query()->create([
            'name' => $validated['name'],
            'state' => $validated['state'] ?? null,
            'city' => $validated['city'] ?? null,
            'fee' => $validated['fee'],
            'free_above' => $validated['free_above'] ?? null,
            'eta_min_days' => $validated['eta_min_days'] ?? 2,
            'eta_max_days' => max(
                (int) ($validated['eta_max_days'] ?? 5),
                (int) ($validated['eta_min_days'] ?? 2),
            ),
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
            'eta_min_days' => ['sometimes', 'integer', 'min:0', 'max:60'],
            'eta_max_days' => ['sometimes', 'integer', 'min:0', 'max:90'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        if (array_key_exists('eta_min_days', $validated) && ! array_key_exists('eta_max_days', $validated)) {
            $validated['eta_max_days'] = max((int) ($zone->eta_max_days ?? 0), (int) $validated['eta_min_days']);
        }
        if (array_key_exists('eta_max_days', $validated) && ! array_key_exists('eta_min_days', $validated)) {
            $validated['eta_min_days'] = min((int) ($zone->eta_min_days ?? 0), (int) $validated['eta_max_days']);
        }
        if (array_key_exists('eta_min_days', $validated) && array_key_exists('eta_max_days', $validated)) {
            $validated['eta_max_days'] = max((int) $validated['eta_max_days'], (int) $validated['eta_min_days']);
        }

        $zone->update($validated);

        return ApiResponse::success(null, 'Delivery zone updated.');
    }
}
