<?php

namespace App\Services;

use App\Models\Address;
use App\Models\DeliveryZone;
use App\Models\PlatformSetting;

class DeliveryZoneService
{
    public const TAX_RATE = 0.075;

    public function resolveZone(?Address $address): DeliveryZone
    {
        $state = $this->normalize($address?->state);
        $city = $this->normalize($address?->city);

        if ($state) {
            $match = DeliveryZone::query()
                ->where('is_active', true)
                ->whereNotNull('state')
                ->whereRaw('LOWER(state) = ?', [$state])
                ->when($city, function ($query) use ($city) {
                    $query->where(function ($inner) use ($city) {
                        $inner->whereNull('city')->orWhereRaw('LOWER(city) = ?', [$city]);
                    });
                })
                ->orderByRaw('city IS NULL')
                ->orderBy('sort_order')
                ->first();

            if ($match) {
                return $match;
            }
        }

        return DeliveryZone::query()
            ->where('is_active', true)
            ->whereNull('state')
            ->orderBy('sort_order')
            ->firstOrFail();
    }

    public function shippingFee(?Address $address, float $subtotal): float
    {
        if ($subtotal <= 0) {
            return 0.0;
        }

        try {
            $zone = $this->resolveZone($address);
            $fee = (float) $zone->fee;

            if ($zone->free_above !== null && $subtotal >= (float) $zone->free_above) {
                return 0.0;
            }

            return round($fee, 2);
        } catch (\Throwable) {
            return round(PlatformSetting::defaultShippingFee(), 2);
        }
    }

    /**
     * @return array{subtotal: float, shipping: float, tax: float, total: float, zone: array<string, mixed>|null}
     */
    public function totals(float $subtotal, ?Address $address = null): array
    {
        $shipping = $this->shippingFee($address, $subtotal);
        $tax = round($subtotal * self::TAX_RATE, 2);
        $zone = null;
        $eta = null;

        try {
            $resolved = $this->resolveZone($address);
            $zone = [
                'id' => (string) $resolved->id,
                'name' => $resolved->name,
                'fee' => (float) $resolved->fee,
            ];
            $etaMin = max(0, (int) ($resolved->eta_min_days ?? 2));
            $etaMax = max($etaMin, (int) ($resolved->eta_max_days ?? 5));
            $eta = [
                'minDays' => $etaMin,
                'maxDays' => $etaMax,
                'label' => $etaMin === $etaMax ? $etaMin.' day'.($etaMin === 1 ? '' : 's') : "{$etaMin}-{$etaMax} days",
            ];
        } catch (\Throwable) {
            $zone = null;
            $eta = null;
        }

        return [
            'subtotal' => round($subtotal, 2),
            'shipping' => $shipping,
            'tax' => $tax,
            'total' => round($subtotal + $shipping + $tax, 2),
            'zone' => $zone,
            'eta' => $eta,
        ];
    }

    private function normalize(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $normalized = strtolower(trim($value));
        $normalized = str_replace(' state', '', $normalized);

        return $normalized;
    }
}
