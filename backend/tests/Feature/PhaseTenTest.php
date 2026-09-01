<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PhaseTenTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_analytics_and_campaigns(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        Store::factory()->create(['owner_id' => $seller->id]);
        Sanctum::actingAs($seller);

        $this->getJson('/api/seller/analytics?range=7days')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['revenue', 'orders', 'visitors', 'conversion', 'chartRevenue']]);

        $this->postJson('/api/seller/marketing/campaigns', [
            'name' => 'Summer Sale',
            'channel' => 'Meta Ads',
            'spend' => 5000,
            'conversions' => 20,
        ])->assertCreated()->assertJsonPath('data.name', 'Summer Sale');

        $this->getJson('/api/seller/marketing/campaigns')->assertOk()->assertJsonPath('data.0.channel', 'Meta Ads');
    }

    public function test_wishlist_add_and_remove(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $product = Product::factory()->create(['status' => 'active']);
        Sanctum::actingAs($buyer);

        $this->postJson('/api/wishlist', ['product_id' => $product->id])
            ->assertOk()
            ->assertJsonPath('data.0.id', (string) $product->id);

        $this->deleteJson('/api/wishlist/'.$product->id)
            ->assertOk()
            ->assertJsonPath('data', []);
    }

    public function test_search_matches_store_name(): void
    {
        $store = Store::factory()->create(['name' => 'Zebra Gadgets Hub', 'status' => 'approved']);
        Product::factory()->create([
            'store_id' => $store->id,
            'name' => 'Plain Cable',
            'status' => 'active',
        ]);

        $this->getJson('/api/search?q=Zebra')
            ->assertOk()
            ->assertJsonPath('data.data.0.store.name', 'Zebra Gadgets Hub');
    }

    public function test_rider_register_admin_assign(): void
    {
        $user = User::factory()->create(['role' => 'buyer']);
        Sanctum::actingAs($user);
        $created = $this->postJson('/api/rider/register', [
            'phone' => '08011112222',
            'vehicle_type' => 'bike',
            'city' => 'Kano',
        ])->assertCreated();

        $riderId = $created->json('data.rider.id');
        $this->assertSame('rider', $user->fresh()->role);

        $admin = User::factory()->create(['role' => 'admin']);
        $order = \App\Models\Order::factory()->create(['status' => 'confirmed']);
        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/riders')->assertOk();
        $this->patchJson('/api/admin/orders/'.$order->id.'/assign-rider', [
            'rider_id' => $riderId,
        ])->assertOk()->assertJsonPath('data.rider.id', (string) $riderId);
    }
}
