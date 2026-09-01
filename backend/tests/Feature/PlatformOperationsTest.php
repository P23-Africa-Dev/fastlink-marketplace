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

    public function test_pending_store_cannot_publish_active_product(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        Store::factory()->create([
            'owner_id' => $seller->id,
            'status' => 'pending',
            'kyc_status' => 'not_started',
            'kyc_verified_at' => null,
        ]);

        Sanctum::actingAs($seller);

        $this->postJson('/api/seller/products', [
            'name' => 'Blocked Product',
            'price' => 1000,
            'status' => 'active',
        ])
            ->assertForbidden()
            ->assertJsonPath('code', 'KYC_REQUIRED');
    }

    public function test_pending_store_can_create_draft_product(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        Store::factory()->create([
            'owner_id' => $seller->id,
            'status' => 'pending',
            'kyc_status' => 'in_progress',
            'kyc_verified_at' => null,
        ]);

        Sanctum::actingAs($seller);

        $this->postJson('/api/seller/products', [
            'name' => 'Allowed Draft',
            'price' => 1000,
            'status' => 'draft',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'draft');
    }

    public function test_admin_verification_queue_lists_pending_applications(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $seller = User::factory()->create(['role' => 'seller']);
        Store::factory()->create([
            'owner_id' => $seller->id,
            'status' => 'pending',
            'kyc_status' => 'under_review',
            'kyc_verified_at' => null,
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/verification')
            ->assertOk()
            ->assertJsonPath('data.counts.stores', 1);
    }
}
