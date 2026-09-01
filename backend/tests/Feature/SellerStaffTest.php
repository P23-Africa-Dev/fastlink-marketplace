<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Store;
use App\Models\StoreStaff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SellerStaffTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_invite_existing_user_as_staff(): void
    {
        $owner = User::factory()->create(['role' => 'seller']);
        Store::factory()->create(['owner_id' => $owner->id]);
        $invitee = User::factory()->create(['role' => 'buyer', 'email' => 'picker@example.com']);

        Sanctum::actingAs($owner);
        $this->postJson('/api/seller/staff', [
            'email' => 'picker@example.com',
            'role' => 'inventory',
        ])
            ->assertCreated()
            ->assertJsonPath('data.email', 'picker@example.com')
            ->assertJsonPath('data.role', 'inventory');

        $this->assertSame('seller', $invitee->fresh()->role);
        $this->getJson('/api/seller/staff')
            ->assertOk()
            ->assertJsonPath('data.staff.0.email', 'picker@example.com');
    }

    public function test_inventory_staff_can_list_products_but_not_payouts(): void
    {
        [$store, $staff] = $this->staffedStore('inventory');
        Product::factory()->create(['store_id' => $store->id, 'status' => 'active', 'stock' => 4]);

        Sanctum::actingAs($staff);
        $this->getJson('/api/seller/products')
            ->assertOk()
            ->assertJsonPath('data.total', 1);
        $this->getJson('/api/seller/payouts')->assertForbidden();
        $this->postJson('/api/seller/payouts', ['amount' => 10])->assertForbidden();
        $this->getJson('/api/seller/staff')->assertForbidden();
    }

    public function test_orders_staff_can_list_orders_but_not_products(): void
    {
        [$store, $staff] = $this->staffedStore('orders');

        Sanctum::actingAs($staff);
        $this->getJson('/api/seller/orders')->assertOk();
        $this->getJson('/api/seller/products')->assertForbidden();
        $this->patchJson('/api/seller/store', ['name' => 'Hijack'])->assertForbidden();
    }

    public function test_finance_staff_can_view_payouts_but_not_change_bank_account(): void
    {
        [, $staff] = $this->staffedStore('finance');

        Sanctum::actingAs($staff);
        $this->getJson('/api/seller/payouts')->assertOk();
        $this->getJson('/api/seller/payments')->assertOk();
        $this->postJson('/api/seller/payout-accounts', [
            'bank_name' => 'Access Bank',
            'bank_account_number' => '1234567890',
            'bank_account_name' => 'Nope',
        ])->assertForbidden();
    }

    public function test_staff_cannot_invite_others(): void
    {
        [, $staff] = $this->staffedStore('support');
        $other = User::factory()->create(['email' => 'other@example.com']);

        Sanctum::actingAs($staff);
        $this->postJson('/api/seller/staff', [
            'email' => $other->email,
            'role' => 'orders',
        ])->assertForbidden();
    }

    public function test_me_includes_staff_permissions(): void
    {
        [, $staff] = $this->staffedStore('support');
        Sanctum::actingAs($staff);

        $this->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.sellerAccess.isOwner', false)
            ->assertJsonPath('data.sellerAccess.staffRole', 'support')
            ->assertJsonPath('data.sellerAccess.permissions', ['support']);
    }

    public function test_owner_can_remove_staff(): void
    {
        $owner = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $owner->id]);
        $invitee = User::factory()->create(['role' => 'seller']);
        $member = StoreStaff::query()->create([
            'store_id' => $store->id,
            'user_id' => $invitee->id,
            'invited_by' => $owner->id,
            'role' => 'orders',
            'status' => 'active',
        ]);

        Sanctum::actingAs($owner);
        $this->deleteJson('/api/seller/staff/'.$member->id)->assertOk();
        $this->assertDatabaseMissing('store_staff', ['id' => $member->id]);
        $this->assertSame('buyer', $invitee->fresh()->role);
    }

    /**
     * @return array{0: Store, 1: User}
     */
    private function staffedStore(string $role): array
    {
        $owner = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $owner->id, 'status' => 'approved']);
        $staff = User::factory()->create(['role' => 'seller']);
        StoreStaff::query()->create([
            'store_id' => $store->id,
            'user_id' => $staff->id,
            'invited_by' => $owner->id,
            'role' => $role,
            'status' => 'active',
        ]);

        return [$store, $staff];
    }
}
