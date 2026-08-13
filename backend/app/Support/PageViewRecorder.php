<?php

namespace App\Support;

use App\Models\PageView;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;

class PageViewRecorder
{
    public static function record(?User $viewer, ?Store $store, ?Product $product, ?string $path = null): void
    {
        PageView::query()->create([
            'store_id' => $store?->id ?? $product?->store_id,
            'product_id' => $product?->id,
            'viewer_id' => $viewer?->id,
            'path' => $path,
        ]);
    }
}
