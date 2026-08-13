<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PlatformOperationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_pending_store_cannot_create_product(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        Store::factory()->create(['owner_id' => $seller->id, 'status' => 'pending']);

        Sanctum::actingAs($seller);

        $this->postJson('/api/seller/products', [
            'name' => 'Blocked Product',
            'price' => 1000,
            'status' => 'active',
        ])->assertForbidden();
    }

    public function test_admin_verification_queue_lists_pending_applications(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $seller = User::factory()->create(['role' => 'seller']);
        Store::factory()->create(['owner_id' => $seller->id, 'status' => 'pending']);

        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/verification')
            ->assertOk()
            ->assertJsonPath('data.counts.stores', 1);
    }
}
