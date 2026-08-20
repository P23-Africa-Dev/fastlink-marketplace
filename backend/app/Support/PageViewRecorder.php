<?php

namespace App\Support;

use App\Models\PageView;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;

class PageViewRecorder
{
    /**
     * @param  array<string, mixed>|null  $meta
     */
    public static function record(
        ?User $viewer,
        ?Store $store,
        ?Product $product,
        ?string $path = null,
        string $eventType = 'page_view',
        ?array $meta = null,
    ): void
    {
        try {
            PageView::query()->create([
                'store_id' => $store?->id ?? $product?->store_id,
                'product_id' => $product?->id,
                'viewer_id' => $viewer?->id,
                'event_type' => $eventType,
                'path' => $path,
                'meta' => $meta,
            ]);
        } catch (\Throwable) {
            // Activity logging must never block checkout or other core flows.
        }
    }
}
