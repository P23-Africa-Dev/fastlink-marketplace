<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Rider */
class RiderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'status' => $this->status,
            'phone' => $this->phone,
            'vehicleType' => $this->vehicle_type,
            'city' => $this->city,
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => (string) $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
