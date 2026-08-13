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
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
