<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Dispute */
class DisputeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'type' => $this->type,
            'status' => $this->status,
            'displayStatus' => str_replace('_', ' ', ucfirst($this->status)),
            'reason' => $this->reason,
            'buyerEvidence' => $this->buyer_evidence,
            'sellerResponse' => $this->seller_response,
            'resolution' => $this->resolution,
            'adminNote' => $this->admin_note,
            'refundAmount' => $this->refund_amount !== null ? (float) $this->refund_amount : null,
            'order' => $this->whenLoaded('order', fn () => $this->order ? [
                'id' => (string) $this->order->id,
                'reference' => $this->order->reference,
                'total' => (float) $this->order->total,
                'status' => $this->order->status,
            ] : null),
            'store' => $this->whenLoaded('store', fn () => $this->store ? [
                'id' => (string) $this->store->id,
                'name' => $this->store->name,
            ] : null),
            'buyer' => $this->whenLoaded('buyer', fn () => $this->buyer ? [
                'id' => (string) $this->buyer->id,
                'name' => $this->buyer->name,
                'email' => $this->buyer->email,
            ] : null),
            'createdAt' => $this->created_at?->toIso8601String(),
            'resolvedAt' => $this->resolved_at?->toIso8601String(),
        ];
    }
}
