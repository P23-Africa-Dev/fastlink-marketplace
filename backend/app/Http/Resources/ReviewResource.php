<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Review */
class ReviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'productId' => (string) $this->product_id,
            'productName' => $this->whenLoaded('product', fn () => $this->product?->name),
            'storeId' => (string) $this->store_id,
            'rating' => (int) $this->rating,
            'body' => $this->body,
            'status' => $this->status,
            'displayStatus' => $this->displayStatus(),
            'buyer' => [
                'id' => (string) $this->buyer_id,
                'name' => $this->whenLoaded('buyer', fn () => $this->buyer?->name) ?? 'Customer',
            ],
            'reply' => $this->seller_reply ? [
                'body' => $this->seller_reply,
                'createdAt' => $this->seller_replied_at?->toIso8601String(),
            ] : null,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
