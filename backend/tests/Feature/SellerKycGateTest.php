<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SellerKycGateTest extends TestCase
{
    use RefreshDatabase;

    public function test_auth_me_exposes_kyc_and_can_sell(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        Store::factory()->create([
            'owner_id' => $seller->id,
            'status' => 'pending',
            'kyc_status' => 'not_started',
            'kyc_verified_at' => null,
        ]);

        Sanctum::actingAs($seller);

        $this->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.kycStatus', 'not_started')
            ->assertJsonPath('data.storeStatus', 'pending')
            ->assertJsonPath('data.canSell', false);
    }

    public function test_pending_kyc_can_create_draft_but_not_publish(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        Store::factory()->create([
            'owner_id' => $seller->id,
            'status' => 'pending',
            'kyc_status' => 'not_started',
            'kyc_verified_at' => null,
        ]);
        Category::query()->create(['name' => 'Fashion', 'slug' => 'fashion']);

        Sanctum::actingAs($seller);

        $this->postJson('/api/seller/products', [
            'name' => 'Draft Tee',
            'price' => 5000,
            'stock' => 3,
            'category' => 'fashion',
            'status' => 'draft',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'draft');

        $this->postJson('/api/seller/products', [
            'name' => 'Live Tee',
            'price' => 5000,
            'stock' => 3,
            'category' => 'fashion',
            'status' => 'active',
        ])
            ->assertForbidden()
            ->assertJsonPath('code', 'KYC_REQUIRED');
    }

    public function test_default_status_is_draft_when_kyc_incomplete(): void
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
            'name' => 'Auto Draft',
            'price' => 2000,
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'draft');
    }

    public function test_cannot_submit_or_payout_before_kyc_approved(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create([
            'owner_id' => $seller->id,
            'status' => 'pending',
            'kyc_status' => 'under_review',
            'kyc_verified_at' => null,
            'bank_name' => 'GTBank',
            'bank_account_number' => '0123456789',
            'bank_account_name' => 'Demo Seller',
        ]);
        $product = Product::factory()->create([
            'store_id' => $store->id,
            'status' => 'draft',
        ]);

        Sanctum::actingAs($seller);

        $this->postJson('/api/seller/products/'.$product->id.'/submit')
            ->assertForbidden()
            ->assertJsonPath('code', 'KYC_REQUIRED');

        $this->postJson('/api/seller/payouts', ['amount' => 1000])
            ->assertForbidden()
            ->assertJsonPath('code', 'KYC_REQUIRED');
    }

    public function test_onboard_without_kyc_allows_limited_access(): void
    {
        $seller = User::factory()->create(['role' => 'buyer']);

        Sanctum::actingAs($seller);

        $this->postJson('/api/seller/onboard', [
            'business_name' => 'Soft Launch Store',
            'phone' => '08012345678',
            'type' => 'independent',
            'submit_kyc' => false,
        ])
            ->assertCreated()
            ->assertJsonPath('data.store.kycStatus', 'not_started')
            ->assertJsonPath('data.store.canSell', false);

        $this->assertDatabaseHas('stores', [
            'owner_id' => $seller->id,
            'kyc_status' => 'not_started',
            'status' => 'pending',
        ]);
    }

    public function test_submit_kyc_later_marks_under_review_or_approved_in_testing(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        Store::factory()->create([
            'owner_id' => $seller->id,
            'status' => 'pending',
            'kyc_status' => 'not_started',
            'kyc_verified_at' => null,
        ]);

        Sanctum::actingAs($seller);

        $this->postJson('/api/seller/kyc/submit', [
            'bank_name' => 'Access',
            'bank_account_number' => '1234567890',
            'bank_account_name' => 'Soft Launch',
        ])
            ->assertOk()
            ->assertJsonPath('data.store.kycStatus', 'approved')
            ->assertJsonPath('data.store.canSell', true);
    }
}
