<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_initialize_and_verify_marks_order_paid_with_commission(): void
    {
        config(['services.paystack.secret' => null]);

        [$buyer, $address, $product, $seller] = $this->checkoutSetup();
        Sanctum::actingAs($buyer);

        $placed = $this->postJson('/api/checkout', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();

        $groupId = $placed->json('data.groupId');

        $init = $this->postJson('/api/checkout/initialize', ['group_id' => $groupId])
            ->assertOk()
            ->assertJsonPath('data.mode', 'demo');

        $this->assertStringContainsString('/checkout/callback', $init->json('data.authorizationUrl'));
        $reference = $init->json('data.reference');

        $this->postJson('/api/checkout/verify', ['reference' => $reference])
            ->assertOk()
            ->assertJsonPath('data.orders.0.paymentStatus', 'paid')
            ->assertJsonPath('data.orders.0.status', 'confirmed');

        $payment = Payment::query()->where('reference', $reference)->first();
        $this->assertNotNull($payment);
        $this->assertSame('paid', $payment->status);
        $this->assertGreaterThan(0, (float) $payment->fees);
        $this->assertEqualsWithDelta((float) $payment->amount - (float) $payment->fees, (float) $payment->net, 0.01);

        Sanctum::actingAs($seller);
        $this->getJson('/api/seller/payments')
            ->assertOk()
            ->assertJsonPath('data.data.0.reference', $reference)
            ->assertJsonPath('data.data.0.gateway', 'Demo');
    }

    public function test_demo_confirm_still_marks_paid(): void
    {
        config(['services.paystack.secret' => null]);

        [$buyer, $address, $product] = $this->checkoutSetup();
        Sanctum::actingAs($buyer);

        $placed = $this->postJson('/api/checkout', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();

        $this->postJson('/api/checkout/confirm', ['group_id' => $placed->json('data.groupId')])
            ->assertOk()
            ->assertJsonPath('data.orders.0.paymentStatus', 'paid');

        $this->assertDatabaseHas('payments', [
            'order_id' => $placed->json('data.orders.0.id'),
            'status' => 'paid',
            'provider' => 'demo',
        ]);
    }

    public function test_paystack_webhook_with_valid_signature_marks_paid(): void
    {
        config(['services.paystack.secret' => 'sk_test_secret']);

        [$buyer, $address, $product] = $this->checkoutSetup();
        Sanctum::actingAs($buyer);

        $placed = $this->postJson('/api/checkout', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();

        config(['services.paystack.secret' => null]);
        $init = $this->postJson('/api/checkout/initialize', [
            'group_id' => $placed->json('data.groupId'),
        ])->assertOk();
        $reference = $init->json('data.reference');

        config(['services.paystack.secret' => 'sk_test_secret']);
        $payload = json_encode([
            'event' => 'charge.success',
            'data' => ['reference' => $reference, 'status' => 'success'],
        ], JSON_THROW_ON_ERROR);

        $this->call(
            'POST',
            '/api/webhooks/paystack',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_ACCEPT' => 'application/json',
                'HTTP_X_PAYSTACK_SIGNATURE' => hash_hmac('sha512', $payload, 'sk_test_secret'),
            ],
            $payload,
        )->assertOk();

        $this->assertDatabaseHas('payments', [
            'reference' => $reference,
            'status' => 'paid',
            'provider' => 'paystack',
        ]);
    }

    public function test_paystack_webhook_rejects_invalid_signature(): void
    {
        config(['services.paystack.secret' => 'sk_test_secret']);

        $payload = json_encode(['event' => 'charge.success', 'data' => ['reference' => 'x']], JSON_THROW_ON_ERROR);

        $this->call(
            'POST',
            '/api/webhooks/paystack',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_ACCEPT' => 'application/json',
                'HTTP_X_PAYSTACK_SIGNATURE' => 'invalid',
            ],
            $payload,
        )->assertStatus(401);
    }

    public function test_seller_payout_stays_pending_until_admin_approves(): void
    {
        config(['services.paystack.secret' => null]);

        [$buyer, $address, $product, $seller, $store] = $this->checkoutSetup();
        $store->update([
            'bank_name' => 'GTBank',
            'bank_account_number' => '0123456789',
            'bank_account_name' => 'Demo Seller',
        ]);

        Sanctum::actingAs($buyer);
        $placed = $this->postJson('/api/checkout', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();
        $this->postJson('/api/checkout/confirm', ['group_id' => $placed->json('data.groupId')])->assertOk();

        $net = (float) Payment::query()->where('store_id', $store->id)->value('net');
        Sanctum::actingAs($seller);

        $created = $this->postJson('/api/seller/payouts', ['amount' => $net])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);
        $this->postJson('/api/admin/payouts/'.$created->json('data.id').'/approve')
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('payouts', [
            'id' => $created->json('data.id'),
            'status' => 'approved',
        ]);
        $this->assertTrue(Payout::query()->find($created->json('data.id'))->status !== 'transferred');
    }

    /**
     * @return array{0: User, 1: Address, 2: Product, 3: User, 4: Store}
     */
    private function checkoutSetup(): array
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create([
            'owner_id' => $seller->id,
            'status' => 'approved',
        ]);
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
            'store_id' => $store->id,
            'price' => 40,
            'stock' => 5,
            'status' => 'active',
        ]);

        return [$buyer, $address, $product, $seller, $store];
    }
}
