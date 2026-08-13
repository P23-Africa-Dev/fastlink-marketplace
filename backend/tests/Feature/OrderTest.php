<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_uses_server_price_not_client_price(): void
    {
        [$buyer, $address, $product] = $this->checkoutSetup(price: 80, stock: 5);
        Sanctum::actingAs($buyer);

        $response = $this->postJson('/api/checkout', [
            'address_id' => $address->id,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1, 'price' => 1],
            ],
        ])->assertCreated();

        $this->assertEquals(80, $response->json('data.orders.0.subtotal'));
        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'unit_price' => 80,
        ]);
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 4,
        ]);
    }

    public function test_checkout_fails_when_out_of_stock(): void
    {
        [$buyer, $address, $product] = $this->checkoutSetup(price: 50, stock: 0);
        Sanctum::actingAs($buyer);

        $this->postJson('/api/checkout', [
            'address_id' => $address->id,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_invalid_status_transition_fails(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $seller->id]);
        $order = Order::factory()->create([
            'store_id' => $store->id,
            'status' => 'delivered',
        ]);

        Sanctum::actingAs($seller);

        $this->patchJson('/api/seller/orders/'.$order->id.'/status', [
            'status' => 'pending',
        ])
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_seller_can_confirm_then_ship_order(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $seller->id]);
        $order = Order::factory()->create([
            'store_id' => $store->id,
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);

        Sanctum::actingAs($seller);

        $this->patchJson('/api/seller/orders/'.$order->id.'/status', [
            'status' => 'shipped',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'shipped')
            ->assertJsonPath('data.displayStatus', 'Shipped');
    }

    public function test_buyer_cannot_list_seller_orders(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        Sanctum::actingAs($buyer);

        $this->getJson('/api/seller/orders')->assertForbidden();
    }

    public function test_tracking_requires_matching_email(): void
    {
        $order = Order::factory()->create([
            'buyer_email' => 'buyer@fastlink.test',
            'status' => 'confirmed',
        ]);

        $this->getJson('/api/orders/'.$order->reference.'/track')
            ->assertNotFound();

        $this->getJson('/api/orders/'.$order->reference.'/track?email=buyer@fastlink.test')
            ->assertOk()
            ->assertJsonPath('data.reference', $order->reference);
    }

    public function test_demo_confirm_marks_order_paid(): void
    {
        [$buyer, $address, $product] = $this->checkoutSetup(price: 40, stock: 3);
        Sanctum::actingAs($buyer);

        $placed = $this->postJson('/api/checkout', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();

        $groupId = $placed->json('data.groupId');

        $this->postJson('/api/checkout/confirm', ['group_id' => $groupId])
            ->assertOk()
            ->assertJsonPath('data.orders.0.paymentStatus', 'paid')
            ->assertJsonPath('data.orders.0.status', 'confirmed');
    }

    /**
     * @return array{0: User, 1: Address, 2: Product}
     */
    private function checkoutSetup(float $price, int $stock): array
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $address = Address::query()->create([
            'user_id' => $buyer->id,
            'label' => 'Home',
            'street' => '15 Zoo Road',
            'city' => 'Kano',
            'state' => 'Kano',
            'postal_code' => '700213',
            'country' => 'Nigeria',
            'is_default' => true,
        ]);
        $product = Product::factory()->create([
            'price' => $price,
            'stock' => $stock,
            'status' => 'active',
        ]);

        return [$buyer, $address, $product];
    }
}
