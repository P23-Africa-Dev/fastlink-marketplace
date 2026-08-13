<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SellerDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_stats_match_paid_orders(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $seller->id]);
        $buyer = User::factory()->create(['role' => 'buyer']);
        $product = Product::factory()->create(['store_id' => $store->id, 'stock' => 10]);

        $order = Order::factory()->create([
            'buyer_id' => $buyer->id,
            'store_id' => $store->id,
            'status' => 'confirmed',
            'payment_status' => 'paid',
            'buyer_name' => $buyer->name,
            'buyer_email' => $buyer->email,
            'total' => 250,
            'subtotal' => 220,
        ]);
        $order->items()->create([
            'product_id' => $product->id,
            'name_snapshot' => $product->name,
            'quantity' => 1,
            'unit_price' => 220,
        ]);

        Sanctum::actingAs($seller);

        $this->getJson('/api/seller/dashboard')
            ->assertOk()
            ->assertJsonPath('data.totalOrders', 1)
            ->assertJsonPath('data.totalRevenue', 250)
            ->assertJsonPath('data.totalCustomers', 1)
            ->assertJsonPath('data.totalProducts', 1);
    }

    public function test_customers_are_derived_from_orders(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $seller->id]);
        $buyer = User::factory()->create(['role' => 'buyer', 'name' => 'Amina Bello']);

        Order::factory()->create([
            'buyer_id' => $buyer->id,
            'store_id' => $store->id,
            'buyer_name' => 'Amina Bello',
            'buyer_email' => $buyer->email,
            'total' => 80,
            'status' => 'confirmed',
        ]);

        Sanctum::actingAs($seller);

        $this->getJson('/api/seller/customers')
            ->assertOk()
            ->assertJsonPath('data.data.0.name', 'Amina Bello')
            ->assertJsonPath('data.data.0.orders', 1);

        $this->getJson('/api/seller/customers/'.$buyer->id)
            ->assertOk()
            ->assertJsonPath('data.email', $buyer->email);
    }

    public function test_seller_can_update_store_and_settings(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        Store::factory()->create(['owner_id' => $seller->id, 'name' => 'Old Name']);
        Sanctum::actingAs($seller);

        $this->patchJson('/api/seller/store', [
            'name' => 'Kano Gadgets',
            'description' => 'Phones and accessories',
            'location' => 'Kano Municipal',
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Kano Gadgets');

        $this->patchJson('/api/seller/settings', [
            'bank_name' => 'Access Bank',
            'bank_account_number' => '1234567890',
            'bank_account_name' => 'Kano Gadgets',
            'notifications' => [
                'sale' => ['email' => false, 'push' => true],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.store.bankName', 'Access Bank')
            ->assertJsonPath('data.notifications.sale.email', false);

        $this->getJson('/api/seller/settings')
            ->assertOk()
            ->assertJsonPath('data.notifications.order.email', true);
    }

    public function test_buyer_cannot_view_seller_dashboard(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        Sanctum::actingAs($buyer);

        $this->getJson('/api/seller/dashboard')->assertForbidden();
    }
}
