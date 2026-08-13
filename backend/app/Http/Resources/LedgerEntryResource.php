<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\LedgerEntry */
class LedgerEntryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'type' => $this->type,
            'direction' => $this->direction,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'referenceType' => $this->reference_type,
            'referenceId' => $this->reference_id ? (string) $this->reference_id : null,
            'storeId' => $this->store_id ? (string) $this->store_id : null,
            'orderId' => $this->order_id ? (string) $this->order_id : null,
            'meta' => $this->meta,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
