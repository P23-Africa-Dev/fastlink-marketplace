<?php

namespace App\Http\Resources;

use App\Support\SellerContext;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $store = in_array($this->role, ['seller', 'admin'], true)
            ? ($this->relationLoaded('store') ? $this->store : $this->store()->first())
            : null;

        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar_path,
            'role' => $this->role,
            'status' => $this->status,
            'phone' => $this->phone,
            'loyaltyPoints' => (int) ($this->loyalty_points ?? 0),
            'sellerAccess' => in_array($this->role, ['seller', 'admin'], true)
                ? SellerContext::accessPayload($this->resource)
                : null,
            'storeStatus' => $store?->status,
            'kycStatus' => $store?->kyc_status,
            'kycRejectionReason' => $store?->kyc_rejection_reason,
            'canSell' => $store?->canSell() ?? false,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
