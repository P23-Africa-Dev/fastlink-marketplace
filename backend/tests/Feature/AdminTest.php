<?php

namespace Tests\Feature;

use App\Models\Mall;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_cannot_access_admin_routes(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        Sanctum::actingAs($seller);

        $this->getJson('/api/admin/dashboard')->assertForbidden();
        $this->getJson('/api/admin/users')->assertForbidden();
    }

    public function test_admin_can_approve_pending_store_and_it_appears_on_mall(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $mall = Mall::query()->create([
            'name' => 'Kano City Mall',
            'slug' => 'kano-city-mall-admin',
            'city' => 'Kano',
            'location' => 'Kano',
        ]);
        $store = Store::factory()->create([
            'status' => 'pending',
            'mall_id' => $mall->id,
            'name' => 'Pending Spice Shop',
        ]);

        $this->getJson('/api/malls/'.$mall->slug.'/stores')
            ->assertOk()
            ->assertJsonMissing(['slug' => $store->slug]);

        Sanctum::actingAs($admin);
        $this->postJson('/api/admin/stores/'.$store->id.'/approve')
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->getJson('/api/malls/'.$mall->slug.'/stores')
            ->assertOk()
            ->assertJsonFragment(['slug' => $store->slug]);

        $this->getJson('/api/admin/audit-logs')
            ->assertOk()
            ->assertJsonPath('data.data.0.action', 'store.approved');
    }

    public function test_admin_can_suspend_user_and_they_cannot_log_in(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create([
            'email' => 'hold@fastlink.test',
            'status' => 'active',
        ]);

        Sanctum::actingAs($admin);
        $this->patchJson('/api/admin/users/'.$user->id, ['status' => 'suspended'])
            ->assertOk()
            ->assertJsonPath('data.status', 'suspended');

        $this->postJson('/api/auth/login', [
            'email' => 'hold@fastlink.test',
            'password' => 'password',
        ])->assertStatus(403);
    }

    public function test_admin_can_unpublish_product_from_catalog(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create(['status' => 'active']);

        $this->getJson('/api/products/'.$product->slug)->assertOk();

        Sanctum::actingAs($admin);
        $this->patchJson('/api/admin/products/'.$product->id.'/unpublish')
            ->assertOk()
            ->assertJsonPath('data.status', 'archived');

        $this->getJson('/api/products/'.$product->slug)->assertNotFound();
    }

    public function test_admin_can_update_commission_rate(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $this->patchJson('/api/admin/settings/commission', ['rate' => 12.5])
            ->assertOk()
            ->assertJsonPath('data.rate', 12.5);
    }
}
