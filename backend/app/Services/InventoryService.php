<?php

namespace App\Services;

use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Store;

class InventoryService
{
    public const LOW_STOCK_THRESHOLD = 5;

    public function __construct(private NotificationService $notifications) {}

    public function record(
        Product $product,
        string $type,
        int $quantityDelta,
        int $quantityAfter,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $note = null,
    ): InventoryMovement {
        $movement = InventoryMovement::query()->create([
            'product_id' => $product->id,
            'store_id' => $product->store_id,
            'type' => $type,
            'quantity_delta' => $quantityDelta,
            'quantity_after' => max(0, $quantityAfter),
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'note' => $note,
            'created_at' => now(),
        ]);

        if ($quantityAfter <= self::LOW_STOCK_THRESHOLD && $quantityAfter >= 0) {
            $this->notifyLowStock($product->fresh(['store.owner']));
        }

        return $movement;
    }

    public function adjustStock(
        Product $product,
        int $newStock,
        string $type,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $note = null,
    ): Product {
        $delta = $newStock - (int) $product->stock;
        $product->update(['stock' => max(0, $newStock)]);
        $this->record($product, $type, $delta, (int) $product->fresh()->stock, $referenceType, $referenceId, $note);

        return $product->fresh();
    }

    public function applyDelta(
        Product $product,
        int $quantityDelta,
        string $type,
        ?string $note = null,
    ): Product {
        $newStock = max(0, (int) $product->stock + $quantityDelta);

        return $this->adjustStock($product, $newStock, $type, note: $note);
    }

    private function notifyLowStock(Product $product): void
    {
        $owner = $product->store?->owner;
        if (! $owner) {
            return;
        }

        $this->notifications->notify(
            $owner,
            'inventory.low_stock',
            'Low stock: '.$product->name,
            $product->name.' has '.$product->stock.' units left. Consider restocking.',
            [
                'productId' => (string) $product->id,
                'storeId' => (string) $product->store_id,
                'productName' => $product->name,
                'stock' => (int) $product->stock,
                'ctaUrl' => rtrim((string) config('app.frontend_url'), '/').'/inventory',
                'ctaLabel' => 'Manage inventory',
            ],
        );
    }
}
