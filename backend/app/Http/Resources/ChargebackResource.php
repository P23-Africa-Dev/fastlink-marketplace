<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Chargeback */
class ChargebackResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'amount' => (float) $this->amount,
            'providerReference' => $this->provider_reference,
            'reason' => $this->reason,
            'status' => $this->status,
            'displayStatus' => str_replace('_', ' ', ucfirst($this->status)),
            'adminNote' => $this->admin_note,
            'order' => $this->whenLoaded('order', fn () => $this->order ? [
                'id' => (string) $this->order->id,
                'reference' => $this->order->reference,
                'total' => (float) $this->order->total,
            ] : null),
            'store' => $this->whenLoaded('store', fn () => $this->store ? [
                'id' => (string) $this->store->id,
                'name' => $this->store->name,
            ] : null),
            'payment' => $this->whenLoaded('payment', fn () => $this->payment ? [
                'id' => (string) $this->payment->id,
                'reference' => $this->payment->reference,
                'amount' => (float) $this->payment->amount,
                'status' => $this->payment->status,
            ] : null),
            'createdAt' => $this->created_at?->toIso8601String(),
            'resolvedAt' => $this->resolved_at?->toIso8601String(),
        ];
    }
}
