<?php

namespace App\Http\Resources;

use App\Models\Payout;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Payout */
class PayoutResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $store = $this->whenLoaded('store', $this->store);

        return [
            'id' => (string) $this->id,
            'store' => $store ? [
                'id' => (string) $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
            ] : null,
            'amount' => (float) $this->amount,
            'bankName' => $this->bank_name,
            'bankCode' => $this->bank_code,
            'accountNumber' => Payout::maskAccount($this->account_number),
            'accountName' => $this->account_name,
            'status' => $this->status,
            'displayStatus' => match ($this->status) {
                'transferred' => 'Transferred',
                'rejected' => 'Failed',
                'approved' => 'Processing',
                default => 'Processing',
            },
            'providerReference' => $this->provider_reference,
            'rejectionReason' => $this->rejection_reason,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
