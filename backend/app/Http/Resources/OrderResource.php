<?php

namespace App\Http\Resources;

use App\Models\Address;
use App\Services\DeliveryZoneService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Order */
class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $items = $this->whenLoaded('items', $this->items, collect());
        $deliveryWindow = $this->deliveryWindow();

        return [
            'id' => (string) $this->id,
            'reference' => $this->reference,
            'groupId' => $this->group_id,
            'status' => $this->status,
            'displayStatus' => $this->displayStatus(),
            'paymentStatus' => $this->payment_status,
            'paymentMethod' => $this->payment_method,
            'deliveryMethod' => $this->delivery_method,
            'trackingNumber' => $this->tracking_number,
            'subtotal' => (float) $this->subtotal,
            'shipping' => (float) $this->shipping,
            'tax' => (float) $this->tax,
            'discount' => (float) ($this->discount ?? 0),
            'promoCode' => $this->promo_code,
            'loyaltyPoints' => (int) ($this->loyalty_points ?? 0),
            'loyaltyDiscount' => (float) ($this->loyalty_discount ?? 0),
            'total' => (float) $this->total,
            'buyer' => [
                'id' => (string) $this->buyer_id,
                'name' => $this->buyer_name,
                'email' => $this->buyer_email,
                'phone' => $this->shipping_phone,
            ],
            'store' => $this->whenLoaded('store', fn () => $this->store ? [
                'id' => (string) $this->store->id,
                'name' => $this->store->name,
                'slug' => $this->store->slug,
            ] : null),
            'rider' => $this->whenLoaded('rider', fn () => $this->rider ? [
                'id' => (string) $this->rider->id,
                'name' => $this->rider->user?->name,
                'phone' => $this->rider->phone,
                'status' => $this->rider->status,
            ] : null),
            'shippingAddress' => [
                'street' => $this->shipping_street,
                'city' => $this->shipping_city,
                'state' => $this->shipping_state,
                'postalCode' => $this->shipping_postal_code,
                'country' => $this->shipping_country,
                'phone' => $this->shipping_phone,
            ],
            'items' => $items->map(fn ($item) => [
                'id' => (string) $item->id,
                'productId' => $item->product_id ? (string) $item->product_id : null,
                'productName' => $item->name_snapshot,
                'productImage' => $item->image_snapshot,
                'sku' => $item->sku_snapshot,
                'quantity' => (int) $item->quantity,
                'price' => (float) $item->unit_price,
                'variants' => $item->variants,
            ])->values()->all(),
            'events' => $this->whenLoaded('events', fn () => $this->events->map(fn ($event) => [
                'id' => (string) $event->id,
                'status' => $event->status,
                'title' => $event->title,
                'createdAt' => $event->created_at?->toIso8601String(),
            ])->values()->all()),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            'paidAt' => $this->paid_at?->toIso8601String(),
            'estimatedDelivery' => $deliveryWindow['estimatedDelivery'] ?? $this->created_at?->copy()->addDays(5)->toIso8601String(),
            'deliveryEstimate' => $deliveryWindow['estimate'] ?? null,
        ];
    }

    private function displayStatus(): string
    {
        return match ($this->status) {
            'pending' => 'Pending',
            'confirmed' => 'Successful',
            'shipped' => 'Shipped',
            'delivered' => 'Delivered',
            'cancelled' => 'Refunded',
            default => ucfirst($this->status),
        };
    }

    /**
     * @return array{estimatedDelivery?: string|null, estimate?: array<string, mixed>|null}
     */
    private function deliveryWindow(): array
    {
        try {
            $address = new Address([
                'state' => $this->shipping_state,
                'city' => $this->shipping_city,
            ]);
            $totals = app(DeliveryZoneService::class)->totals((float) $this->subtotal, $address);
            $estimate = $totals['eta'] ?? null;
            if (! is_array($estimate) || ! isset($estimate['maxDays'])) {
                return [];
            }

            return [
                'estimatedDelivery' => $this->created_at?->copy()->addDays((int) $estimate['maxDays'])->toIso8601String(),
                'estimate' => $estimate,
            ];
        } catch (\Throwable) {
            return [];
        }
    }
}
