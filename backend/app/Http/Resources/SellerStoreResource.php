<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Store */
class SellerStoreResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo' => $this->logo,
            'banner' => $this->banner,
            'location' => $this->location,
            'deliveryTag' => $this->delivery_tag,
            'headline' => $this->headline,
            'phone' => $this->phone,
            'type' => $this->type,
            'status' => $this->status,
            'kycStatus' => $this->kyc_status,
            'kycRejectionReason' => $this->kyc_rejection_reason,
            'kycSubmittedAt' => $this->kyc_submitted_at?->toIso8601String(),
            'kycVerifiedAt' => $this->kyc_verified_at?->toIso8601String(),
            'canSell' => $this->canSell(),
            'bankName' => $this->bank_name,
            'bankAccountNumber' => $this->bank_account_number,
            'bankAccountName' => $this->bank_account_name,
        ];
    }
}
