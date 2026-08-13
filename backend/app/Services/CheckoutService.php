<?php

namespace App\Services;

use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Support\CheckoutPricing;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    /**
     * @param  list<array{product_id: int|string, quantity: int, variants?: array<string, mixed>}>  $items
     * @return Collection<int, Order>
     */
    public function checkout(User $buyer, Address $address, array $items, string $deliveryMethod = 'standard', ?string $paymentMethod = 'demo'): Collection
    {
        if ($address->user_id !== $buyer->id) {
            throw ValidationException::withMessages(['address_id' => 'Address not found.']);
        }

        return DB::transaction(function () use ($buyer, $address, $items, $deliveryMethod, $paymentMethod) {
            $groupId = (string) Str::uuid();
            $grouped = [];

            foreach ($items as $item) {
                $product = Product::query()
                    ->with(['images', 'store'])
                    ->whereKey($item['product_id'])
                    ->lockForUpdate()
                    ->first();

                if (! $product || $product->status !== 'active') {
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

            $orders = collect();

            foreach ($grouped as $storeId => $storeItems) {
                $subtotal = 0.0;
                foreach ($storeItems as $row) {
                    $subtotal += ((float) $row['product']->price) * $row['quantity'];
                }

                $totals = CheckoutPricing::totals($subtotal);

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
                }

                $order->addEvent('pending', 'Your order has been placed and is awaiting demo payment.');
                $orders->push($order->load(['items', 'store', 'events']));
            }

            return $orders;
        });
    }

    /**
     * @return Collection<int, Order>
     */
    public function confirm(User $buyer, string $groupId): Collection
    {
        $orders = Order::query()
            ->with(['items', 'store', 'events'])
            ->where('buyer_id', $buyer->id)
            ->where('group_id', $groupId)
            ->get();

        if ($orders->isEmpty()) {
            abort(404);
        }

        foreach ($orders as $order) {
            if ($order->payment_status === 'paid') {
                continue;
            }

            $order->update([
                'payment_status' => 'paid',
                'status' => 'confirmed',
                'paid_at' => now(),
                'payment_method' => $order->payment_method ?: 'demo',
            ]);
            $order->addEvent('confirmed', 'Demo payment received. Your order has been confirmed.');
        }

        return Order::query()
            ->with(['items', 'store', 'events'])
            ->where('buyer_id', $buyer->id)
            ->where('group_id', $groupId)
            ->get();
    }

    public function restoreStock(Order $order): void
    {
        $order->loadMissing('items');
        foreach ($order->items as $item) {
            if ($item->product_id) {
                Product::query()->whereKey($item->product_id)->increment('stock', $item->quantity);
            }
        }
    }
}
