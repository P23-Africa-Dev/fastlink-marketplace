<?php

namespace Tests\Feature;

use App\Models\Dispute;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TierOneTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_open_dispute_and_admin_can_resolve_refund(): void
    {
        [$buyer, $order, $seller, $admin] = $this->paidOrderSetup();
        Sanctum::actingAs($buyer);

        $this->postJson("/api/orders/{$order->id}/disputes", [
            'reason' => 'Item never arrived',
            'buyer_evidence' => 'Tracking shows no delivery',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'open');

        Sanctum::actingAs($seller);
        $dispute = Dispute::query()->first();
        $this->postJson("/api/seller/disputes/{$dispute->id}/respond", [
            'response' => 'We shipped on time; courier delay.',
        ])->assertOk()
            ->assertJsonPath('data.status', 'seller_responded');

        Sanctum::actingAs($admin);
        $this->patchJson("/api/admin/disputes/{$dispute->id}", [
            'action' => 'resolve',
            'resolution' => 'refund',
            'admin_note' => 'Buyer evidence accepted.',
        ])->assertOk()
            ->assertJsonPath('data.status', 'resolved_refund');

        $this->assertSame('refunded', $order->fresh()->payment_status);
    }

    public function test_admin_can_resolve_dispute_with_partial_refund(): void
    {
        [$buyer, $order, , $admin] = $this->paidOrderSetup();
        Sanctum::actingAs($buyer);

        $this->postJson("/api/orders/{$order->id}/disputes", [
            'reason' => 'Item damaged but usable',
        ])->assertCreated();

        $dispute = Dispute::query()->firstOrFail();
        Sanctum::actingAs($admin);

        $partial = round((float) $order->total / 2, 2);
        $this->patchJson("/api/admin/disputes/{$dispute->id}", [
            'action' => 'resolve',
            'resolution' => 'refund',
            'refund_amount' => $partial,
            'admin_note' => 'Partial goodwill refund.',
        ])->assertOk();

        $dispute->refresh();
        $this->assertEqualsWithDelta($partial, (float) $dispute->refund_amount, 0.01);

        $this->assertSame('partially_refunded', $order->fresh()->payment_status);
        $this->assertDatabaseHas('ledger_entries', ['type' => 'order_refund_partial']);
    }

    public function test_admin_can_record_chargeback_linked_to_ledger(): void
    {
        [, $order, , $admin] = $this->paidOrderSetup();
        $payment = \App\Models\Payment::query()->where('order_id', $order->id)->firstOrFail();

        Sanctum::actingAs($admin);
        $this->postJson('/api/admin/chargebacks', [
            'payment_id' => $payment->id,
            'amount' => (float) $payment->amount,
            'reason' => 'Paystack chargeback received',
            'provider_reference' => 'CB-12345',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'open');

        $this->assertSame('chargeback', $order->fresh()->payment_status);
        $this->assertDatabaseHas('ledger_entries', ['type' => 'chargeback']);
        $this->assertDatabaseHas('chargebacks', ['provider_reference' => 'CB-12345']);
    }

    public function test_seller_can_submit_product_for_moderation_and_admin_approves(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $admin = User::factory()->create(['role' => 'admin']);
        $store = Store::factory()->create(['owner_id' => $seller->id, 'status' => 'approved']);
        $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'draft']);

        Sanctum::actingAs($seller);
        $this->postJson("/api/seller/products/{$product->id}/submit")
            ->assertOk()
            ->assertJsonPath('data.status', 'submitted');

        Sanctum::actingAs($admin);
        $this->getJson('/api/admin/products/moderation')
            ->assertOk()
            ->assertJsonPath('data.pendingCount', 1);

        $this->postJson("/api/admin/products/{$product->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'published');

        $this->getJson('/api/products/'.$product->slug)
            ->assertOk();
    }

    public function test_store_reputation_is_included_on_product_detail(): void
    {
        $store = Store::factory()->create(['status' => 'approved']);
        $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'active']);

        $this->getJson('/api/products/'.$product->slug)
            ->assertOk()
            ->assertJsonStructure(['data' => ['storeReputation' => ['score', 'badge', 'metrics']]]);
    }

    /**
     * @return array{0: User, 1: Order, 2: User, 3: User}
     */
    private function paidOrderSetup(): array
    {
        config(['services.paystack.secret' => null]);

        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $seller->id, 'status' => 'approved']);
        $buyer = User::factory()->create(['role' => 'buyer']);
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'active', 'stock' => 5, 'price' => 3000]);
        $address = \App\Models\Address::query()->create([
            'user_id' => $buyer->id,
            'label' => 'Home',
            'street' => '1 Test St',
            'city' => 'Kano',
            'state' => 'Kano',
            'postal_code' => '700213',
            'country' => 'Nigeria',
            'is_default' => true,
        ]);

        Sanctum::actingAs($buyer);
        $placed = $this->postJson('/api/checkout', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();

        $this->postJson('/api/checkout/confirm', ['group_id' => $placed->json('data.groupId')])->assertOk();
        $order = Order::query()->firstOrFail();

        return [$buyer, $order, $seller, $admin];
    }
}
