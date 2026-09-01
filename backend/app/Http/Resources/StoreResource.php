<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Store */
class StoreResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $category = $this->whenLoaded('category', $this->category);

        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'mallId' => $this->mall_id ? (string) $this->mall_id : null,
            'categorySlug' => $category?->slug ?? '',
            'category' => $category?->name ?? ($this->headline ?: ''),
            'location' => $this->location ?? '',
            'deliveryTag' => $this->delivery_tag ?? '',
            'image' => $this->logo ?? $this->banner,
            'type' => $this->type,
            'status' => $this->status,
            'headline' => $this->headline,
            'tagline' => $this->headline ?: $this->delivery_tag,
            'href' => '/stores/'.$this->slug,
            'mall' => $this->whenLoaded('mall', fn () => $this->mall ? new MallResource($this->mall) : null),
        ];
    }
}
