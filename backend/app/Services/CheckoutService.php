<?php

namespace App\Services;

use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public function __construct(
        private DeliveryZoneService $delivery,
        private InventoryService $inventory,
        private PromotionService $promos,
    ) {}

    /**
     * @param  list<array{product_id: int|string, quantity: int, variants?: array<string, mixed>}>  $items
     * @return array{
     *     groupPreview: bool,
     *     orderCount: int,
     *     stores: list<array<string, mixed>>,
     *     subtotal: float,
     *     shipping: float,
     *     tax: float,
     *     total: float,
     *     discount: float,
     *     promoCode: string|null,
     *     deliveryZone: array<string, mixed>|null
     * }
     */
    public function quote(User $buyer, Address $address, array $items, ?string $couponCode = null): array
    {
        if ($address->user_id !== $buyer->id) {
            throw ValidationException::withMessages(['address_id' => 'Address not found.']);
        }

        $grouped = $this->groupItems($items);
        $priced = $this->priceGrouped($buyer, $address, $grouped, $couponCode);

        return [
            'groupPreview' => count($priced['stores']) > 1,
            'orderCount' => count($priced['stores']),
            'stores' => $priced['stores'],
            'subtotal' => $priced['subtotal'],
            'shipping' => $priced['shipping'],
            'tax' => $priced['tax'],
            'discount' => $priced['discount'],
            'promoCode' => $priced['promoCode'],
            'total' => $priced['total'],
            'deliveryZone' => $priced['deliveryZone'],
        ];
    }

    /**
     * @param  list<array{product_id: int|string, quantity: int, variants?: array<string, mixed>}>  $items
     * @return Collection<int, Order>
     */
    public function checkout(User $buyer, Address $address, array $items, string $deliveryMethod = 'standard', ?string $paymentMethod = 'demo', ?string $couponCode = null): Collection
    {
        if ($address->user_id !== $buyer->id) {
            throw ValidationException::withMessages(['address_id' => 'Address not found.']);
        }

        return DB::transaction(function () use ($buyer, $address, $items, $deliveryMethod, $paymentMethod, $couponCode) {
            $groupId = (string) Str::uuid();
            $grouped = $this->groupItems($items, lock: true);
            $priced = $this->priceGrouped($buyer, $address, $grouped, $couponCode);
            $orders = collect();
            $promo = $priced['promo'];

            foreach ($grouped as $storeId => $storeItems) {
                $storeQuote = collect($priced['stores'])->firstWhere('storeId', (string) $storeId);
                $totals = $storeQuote ?? [
                    'subtotal' => 0,
                    'shipping' => 0,
                    'tax' => 0,
                    'discount' => 0,
                    'total' => 0,
                ];

                $order = Order::query()->create([
                    'reference' => Order::uniqueReference(),
                    'group_id' => $groupId,
                    'buyer_id' => $buyer->id,
                    'store_id' => $storeId,
                    'address_id' => $address->id,
                    'status' => 'pending',
                    'payment_status' => 'pending',
                    'payment_method' => $paymentMethod,
                    'delivery_method' => $deliveryMethod,
                    'tracking_number' => Order::uniqueTrackingNumber(),
                    'subtotal' => $totals['subtotal'],
                    'shipping' => $totals['shipping'],
                    'tax' => $totals['tax'],
                    'discount' => $totals['discount'] ?? 0,
                    'promo_code' => ($totals['discount'] ?? 0) > 0 ? $priced['promoCode'] : null,
                    'total' => $totals['total'],
                    'buyer_email' => $buyer->email,
                    'buyer_name' => $buyer->name,
                    'shipping_street' => $address->street,
                    'shipping_city' => $address->city,
                    'shipping_state' => $address->state,
                    'shipping_postal_code' => $address->postal_code,
                    'shipping_country' => $address->country,
                    'shipping_phone' => $address->phone,
                ]);

                foreach ($storeItems as $row) {
                    /** @var Product $product */
                    $product = $row['product'];
                    $image = $product->images->firstWhere('is_primary', true) ?? $product->images->first();

                    $order->items()->create([
                        'product_id' => $product->id,
                        'name_snapshot' => $product->name,
                        'image_snapshot' => $image?->url,
                        'sku_snapshot' => $product->sku,
                        'quantity' => $row['quantity'],
                        'unit_price' => $product->price,
                        'variants' => $row['variants'],
                    ]);

                    $product->decrement('stock', $row['quantity']);
                    $this->inventory->record(
                        $product->fresh(),
                        'sale',
                        -$row['quantity'],
                        (int) $product->fresh()->stock,
                        'order',
                        (int) $order->id,
                        'Checkout reservation',
                    );
                }

                $order->addEvent('pending', 'Your order has been placed and is awaiting payment.');
                app(NotificationService::class)->notifyOrderEvent(
                    $order,
                    'order.placed',
                    'Order placed',
                    'We received your order '.$order->reference.'. Complete payment to confirm.',
                );
                $orders->push($order->load(['items', 'store', 'events']));
            }

            if ($promo && $priced['discount'] > 0 && $orders->isNotEmpty()) {
                $this->promos->redeem(
                    $buyer,
                    $promo,
                    $priced['discount'],
                    (int) $orders->first()->id,
                );
            }

            return $orders;
        });
    }

    /**
     * @return Collection<int, Order>
     */
    public function confirm(User $buyer, string $groupId): Collection
    {
        return app(PaymentService::class)->confirmDemo($buyer, $groupId);
    }

    public function restoreStock(Order $order): void
    {
        $order->loadMissing('items');
        foreach ($order->items as $item) {
            if (! $item->product_id) {
                continue;
            }

            $product = Product::query()->find($item->product_id);
            if (! $product) {
                continue;
            }

            $product->increment('stock', $item->quantity);
            $this->inventory->record(
                $product->fresh(),
                'return',
                (int) $item->quantity,
                (int) $product->fresh()->stock,
                'order',
                (int) $order->id,
                'Stock restored from return/cancel',
            );
        }
    }

    /**
     * @param  list<array{product_id: int|string, quantity: int, variants?: array<string, mixed>}>  $items
     * @return array<int, list<array{product: Product, quantity: int, variants: mixed}>>
     */
    private function groupItems(array $items, bool $lock = false): array
    {
        $grouped = [];

        foreach ($items as $item) {
            $query = Product::query()->with(['images', 'store']);
            if ($lock) {
                $query->whereKey($item['product_id'])->lockForUpdate();
            } else {
                $query->whereKey($item['product_id']);
            }

            $product = $query->first();

            if (! $product || ! Product::isPublicStatus($product->status)) {
                throw ValidationException::withMessages([
                    'items' => 'One or more products are unavailable.',
                ]);
            }

            $qty = (int) $item['quantity'];
            if ($qty < 1) {
                throw ValidationException::withMessages(['items' => 'Quantity must be at least 1.']);
            }

            if ($product->stock < $qty) {
                throw ValidationException::withMessages([
                    'items' => $product->name.' is out of stock.',
                ]);
            }

            $grouped[$product->store_id][] = [
                'product' => $product,
                'quantity' => $qty,
                'variants' => $item['variants'] ?? null,
            ];
        }

        return $grouped;
    }

    /**
     * @param  array<int, list<array{product: Product, quantity: int, variants: mixed}>>  $grouped
     * @return array{
     *     stores: list<array<string, mixed>>,
     *     subtotal: float,
     *     shipping: float,
     *     tax: float,
     *     discount: float,
     *     total: float,
     *     promoCode: string|null,
     *     promo: \App\Models\PromoCode|null,
     *     deliveryZone: array<string, mixed>|null
     * }
     */
    private function priceGrouped(User $buyer, Address $address, array $grouped, ?string $couponCode): array
    {
        $storeSubtotals = [];
        $storeLines = [];

        foreach ($grouped as $storeId => $storeItems) {
            $storeSubtotal = 0.0;
            $lineItems = [];

            foreach ($storeItems as $row) {
                /** @var Product $product */
                $product = $row['product'];
                $storeSubtotal += ((float) $product->price) * $row['quantity'];
                $lineItems[] = [
                    'productId' => (string) $product->id,
                    'name' => $product->name,
                    'quantity' => $row['quantity'],
                    'unitPrice' => (float) $product->price,
                    'lineTotal' => round((float) $product->price * $row['quantity'], 2),
                ];
            }

            $id = (int) $storeId;
            $storeSubtotals[$id] = round($storeSubtotal, 2);
            $storeLines[$id] = [
                'items' => $lineItems,
                'storeName' => $storeItems[0]['product']->store?->name ?? 'Store',
                'subtotal' => round($storeSubtotal, 2),
            ];
        }

        $promo = null;
        $allocations = [];
        $promoCode = null;

        if ($couponCode !== null && trim($couponCode) !== '') {
            $quoted = $this->promos->quote($buyer, $storeSubtotals, $couponCode);
            $promo = $quoted['promo'];
            $allocations = $quoted['allocations'];
            $promoCode = $promo->code;
        }

        $stores = [];
        $subtotal = 0.0;
        $shipping = 0.0;
        $tax = 0.0;
        $discount = 0.0;
        $zone = null;

        foreach ($storeLines as $storeId => $meta) {
            $raw = $meta['subtotal'];
            $storeDiscount = (float) ($allocations[$storeId] ?? 0);
            $discounted = max(0, round($raw - $storeDiscount, 2));
            $totals = $this->delivery->totals($discounted, $address);
            $zone ??= $totals['zone'];

            $stores[] = [
                'storeId' => (string) $storeId,
                'storeName' => $meta['storeName'],
                'items' => $meta['items'],
                'subtotal' => $raw,
                'discount' => round($storeDiscount, 2),
                'shipping' => $totals['shipping'],
                'tax' => $totals['tax'],
                'total' => $totals['total'],
            ];

            $subtotal += $raw;
            $shipping += $totals['shipping'];
            $tax += $totals['tax'];
            $discount += $storeDiscount;
        }

        $discount = round($discount, 2);

        return [
            'stores' => $stores,
            'subtotal' => round($subtotal, 2),
            'shipping' => round($shipping, 2),
            'tax' => round($tax, 2),
            'discount' => $discount,
            'total' => round($subtotal - $discount + $shipping + $tax, 2),
            'promoCode' => $discount > 0 ? $promoCode : null,
            'promo' => $promo,
            'deliveryZone' => $zone,
        ];
    }
}
