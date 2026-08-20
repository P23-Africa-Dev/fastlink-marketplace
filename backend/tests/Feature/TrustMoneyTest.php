<?php

namespace Tests\Feature;

use App\Models\LedgerEntry;
use App\Models\Payment;
use App\Models\PlatformSetting;
use App\Models\Product;
use App\Models\Store;
use App\Models\TrustReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TrustMoneyTest extends TestCase
{
    use RefreshDatabase;

    public function test_payment_creates_ledger_entries(): void
    {
        config(['services.paystack.secret' => null]);

        [$buyer, $address, $product] = $this->checkoutSetup();
        Sanctum::actingAs($buyer);

        $placed = $this->postJson('/api/checkout', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();

        $groupId = $placed->json('data.groupId');
        $this->postJson('/api/checkout/confirm', ['group_id' => $groupId])->assertOk();

        $payment = Payment::query()->first();
        $this->assertNotNull($payment);

        $this->assertDatabaseHas('ledger_entries', [
            'type' => 'order_payment',
            'reference_type' => 'payment',
            'reference_id' => $payment->id,
        ]);
        $this->assertDatabaseHas('ledger_entries', ['type' => 'platform_fee']);
        $this->assertDatabaseHas('ledger_entries', ['type' => 'seller_earnings']);
        $this->assertSame(3, LedgerEntry::query()->count());
    }

    public function test_buyer_can_submit_trust_report_and_admin_can_resolve(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $admin = User::factory()->create(['role' => 'admin']);
        $store = Store::factory()->create();
        $product = Product::factory()->create(['store_id' => $store->id]);

        Sanctum::actingAs($buyer);
        $this->postJson('/api/trust-reports', [
            'subject_type' => 'product',
            'subject_id' => $product->id,
            'reason' => 'Counterfeit item',
            'details' => 'Looks fake compared to official packaging.',
        ])->assertCreated()
            ->assertJsonPath('data.reason', 'Counterfeit item');

        $this->assertDatabaseHas('trust_reports', [
            'subject_type' => 'product',
            'subject_id' => $product->id,
            'status' => 'open',
        ]);

        Sanctum::actingAs($admin);
        $report = TrustReport::query()->first();

        $this->getJson('/api/admin/trust-reports')
            ->assertOk()
            ->assertJsonPath('data.openCount', 1);

        $this->patchJson("/api/admin/trust-reports/{$report->id}", [
            'status' => 'resolved',
            'admin_note' => 'Product unpublished pending investigation.',
        ])->assertOk()
            ->assertJsonPath('data.status', 'resolved');
    }

    public function test_duplicate_open_trust_report_is_blocked(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $store = Store::factory()->create();
        $product = Product::factory()->create(['store_id' => $store->id]);

        Sanctum::actingAs($buyer);
        $payload = [
            'subject_type' => 'product',
            'subject_id' => $product->id,
            'reason' => 'Fraud concern',
            'details' => 'Listing appears deceptive.',
        ];

        $this->postJson('/api/trust-reports', $payload)->assertCreated();
        $this->postJson('/api/trust-reports', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['subject_id']);
    }

    public function test_admin_can_update_marketplace_settings(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/settings')
            ->assertOk()
            ->assertJsonStructure(['data' => ['commissionRate', 'returnWindowDays', 'maintenanceMode']]);

        $this->patchJson('/api/admin/settings', [
            'returnWindowDays' => 21,
            'maintenanceMode' => true,
        ])->assertOk()
            ->assertJsonPath('data.returnWindowDays', 21)
            ->assertJsonPath('data.maintenanceMode', true);
    }

    public function test_checkout_rejects_below_minimum_order_amount(): void
    {
        PlatformSetting::setValue('min_order_amount', '10000');
        [$buyer, $address, $product] = $this->checkoutSetup();
        Sanctum::actingAs($buyer);

        $this->postJson('/api/checkout/quote', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['items']);
    }

    /**
     * @return array{0: User, 1: \App\Models\Address, 2: Product}
     */
    private function checkoutSetup(): array
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create([
            'owner_id' => $seller->id,
            'status' => 'approved',
        ]);
        $buyer = User::factory()->create(['role' => 'buyer']);
        $address = \App\Models\Address::query()->create([
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
            'store_id' => $store->id,
            'status' => 'active',
            'stock' => 10,
            'price' => 5000,
        ]);

        return [$buyer, $address, $product];
    }
}
