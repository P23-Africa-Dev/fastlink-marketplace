<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Payment */
class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $order = $this->whenLoaded('order', $this->order);
        $store = $this->whenLoaded('store', $this->store);

        return [
            'id' => (string) $this->id,
            'reference' => $this->reference,
            'orderId' => (string) $this->order_id,
            'orderReference' => $order?->reference,
            'store' => $store ? [
                'id' => (string) $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
            ] : null,
            'buyer' => $order ? [
                'id' => (string) $order->buyer_id,
                'name' => $order->buyer_name,
                'email' => $order->buyer_email,
            ] : null,
            'provider' => $this->provider,
            'gateway' => $this->provider === 'demo' ? 'Demo' : 'Paystack',
            'amount' => (float) $this->amount,
            'fees' => (float) $this->fees,
            'net' => (float) $this->net,
            'status' => $this->status,
            'displayStatus' => match ($this->status) {
                'paid' => 'Successful',
                'failed' => 'Failed',
                'refunded' => 'Refunded',
                default => 'Pending',
            },
            'paidAt' => $this->paid_at?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
