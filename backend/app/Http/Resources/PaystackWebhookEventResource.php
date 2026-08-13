<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\PaystackWebhookEvent */
class PaystackWebhookEventResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'event' => $this->event,
            'reference' => $this->reference,
            'status' => $this->status,
            'error' => $this->error,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
