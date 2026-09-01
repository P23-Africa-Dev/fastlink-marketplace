<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Product */
class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $price = (float) $this->price;
        $compare = $this->compare_at_price !== null ? (float) $this->compare_at_price : null;
        $discount = null;
        if ($compare && $compare > $price) {
            $discount = (int) round((($compare - $price) / $compare) * 100);
        }

        $store = $this->whenLoaded('store', $this->store);
        $images = $this->whenLoaded('images', $this->images, collect());
        $canSeeModerationMeta = in_array($request->user()?->role, ['seller', 'admin'], true);

        return [
            'id' => (string) $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'description' => $this->description ?? '',
            'longDescription' => $this->long_description,
            'price' => $price,
            'compareAtPrice' => $compare,
            'discountPercentage' => $discount,
            'sku' => $this->sku,
            'stock' => (int) $this->stock,
            'category' => $this->whenLoaded('category', fn () => $this->category?->name) ?? '',
            'subcategory' => $this->subcategory,
            'brand' => $this->whenLoaded('brand', fn () => $this->brand?->product_brand ?: $this->brand?->name),
            'images' => $images->map(fn ($image) => [
                'id' => (string) $image->id,
                'url' => $image->url,
                'alt' => $image->alt ?: $this->name,
                'isPrimary' => (bool) $image->is_primary,
            ])->values()->all(),
            'variants' => $this->groupedVariants(),
            'store' => $store ? [
                'id' => (string) $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
            ] : null,
            'storeId' => $store ? (string) $store->id : (string) $this->store_id,
            'seller' => $store ? [
                'id' => (string) $store->id,
                'name' => $store->name,
                'avatar' => $store->logo,
                'rating' => (float) $this->rating,
                'totalSales' => 0,
            ] : [
                'id' => (string) $this->store_id,
                'name' => '',
                'rating' => (float) $this->rating,
                'totalSales' => 0,
            ],
            'tags' => $this->tags ?? [],
            'isFeatured' => (bool) $this->is_featured,
            'isNew' => (bool) $this->is_new,
            'isBestseller' => (bool) $this->is_bestseller,
            'rating' => (float) $this->rating,
            'reviewCount' => (int) $this->review_count,
            'status' => $this->status,
            'submittedAt' => $this->when($canSeeModerationMeta, $this->submitted_at?->toIso8601String()),
            'moderatedAt' => $this->when($canSeeModerationMeta, $this->moderated_at?->toIso8601String()),
            'moderatedBy' => $this->when($canSeeModerationMeta, $this->moderated_by ? (string) $this->moderated_by : null),
            'moderationNote' => $this->when($canSeeModerationMeta, $this->moderation_note),
            'costPrice' => $this->when($request->user()?->role === 'seller' || $request->user()?->role === 'admin', $this->cost_price !== null ? (float) $this->cost_price : null),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, list<array<string, mixed>>>
     */
    private function groupedVariants(): array
    {
        if (! $this->relationLoaded('variants')) {
            return [];
        }

        $groups = [];
        foreach ($this->variants as $variant) {
            $key = match (strtolower($variant->name)) {
                'color', 'colors' => 'colors',
                'size', 'sizes' => 'sizes',
                'memory' => 'memory',
                'storage' => 'storage',
                default => strtolower($variant->name).'s',
            };

            $groups[$key][] = [
                'id' => (string) $variant->id,
                'name' => $variant->name,
                'value' => $variant->value,
                'stock' => (int) $variant->stock,
                'priceModifier' => (float) $variant->price_modifier,
            ];
        }

        return $groups;
    }
}
