<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Product;
use App\Models\PromoCode;
use App\Models\ReferralAttribution;
use App\Models\Store;
use App\Models\User;
use App\Models\UserNotification;
use App\Services\CartRecoveryService;
use App\Services\ReferralService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TierThreeTest extends TestCase
{
    use RefreshDatabase;

    public function test_fastlink10_reduces_quote_and_checkout_total(): void
    {
        [$buyer, $address, $product] = $this->singleProductSetup(price: 4000);

        Sanctum::actingAs($buyer);

        $plain = $this->postJson('/api/checkout/quote', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertOk();

        $discounted = $this->postJson('/api/checkout/quote', [
            'address_id' => $address->id,
            'coupon_code' => 'FASTLINK10',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertOk()
            ->assertJsonPath('data.promoCode', 'FASTLINK10');

        $this->assertEqualsWithDelta(400.0, (float) $discounted->json('data.discount'), 0.01);
        $this->assertLessThan((float) $plain->json('data.total'), (float) $discounted->json('data.total'));

        $this->postJson('/api/checkout', [
            'address_id' => $address->id,
            'coupon_code' => 'fastlink10',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated()
            ->assertJsonPath('data.orders.0.promoCode', 'FASTLINK10');

        $this->assertDatabaseHas('orders', [
            'buyer_id' => $buyer->id,
            'promo_code' => 'FASTLINK10',
        ]);
        $this->assertDatabaseHas('promo_redemptions', [
            'user_id' => $buyer->id,
        ]);
    }

    public function test_seller_promo_only_applies_to_that_store(): void
    {
        [$buyer, $address, $productA, $productB] = $this->multiStoreCartSetup();

        PromoCode::query()->create([
            'store_id' => $productA->store_id,
            'code' => 'ALPHA20',
            'type' => 'percent',
            'value' => 20,
            'min_subtotal' => 0,
            'per_user_limit' => 5,
            'is_active' => true,
            'starts_at' => now()->subMinute(),
        ]);

        Sanctum::actingAs($buyer);
        $this->postJson('/api/checkout/quote', [
            'address_id' => $address->id,
            'coupon_code' => 'ALPHA20',
            'items' => [
                ['product_id' => $productA->id, 'quantity' => 1],
                ['product_id' => $productB->id, 'quantity' => 1],
            ],
        ])->assertOk()
            ->assertJsonPath('data.discount', 1000);

        $stores = collect($this->postJson('/api/checkout/quote', [
            'address_id' => $address->id,
            'coupon_code' => 'ALPHA20',
            'items' => [
                ['product_id' => $productA->id, 'quantity' => 1],
                ['product_id' => $productB->id, 'quantity' => 1],
            ],
        ])->json('data.stores'));

        $this->assertEqualsWithDelta(1000, (float) $stores->firstWhere('storeId', (string) $productA->store_id)['discount'], 0.01);
        $this->assertEqualsWithDelta(0, (float) $stores->firstWhere('storeId', (string) $productB->store_id)['discount'], 0.01);
    }

    public function test_invalid_expired_and_over_limit_codes_fail(): void
    {
        [$buyer, $address, $product] = $this->singleProductSetup();
        Sanctum::actingAs($buyer);
        $payload = [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ];

        $this->postJson('/api/checkout/quote', $payload + ['coupon_code' => 'NOPE'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['coupon_code']);

        PromoCode::query()->create([
            'code' => 'EXPIRED1',
            'type' => 'fixed',
            'value' => 500,
            'is_active' => true,
            'starts_at' => now()->subDays(10),
            'ends_at' => now()->subDay(),
            'per_user_limit' => 5,
        ]);

        $this->postJson('/api/checkout/quote', $payload + ['coupon_code' => 'EXPIRED1'])
            ->assertStatus(422);

        PromoCode::query()->create([
            'code' => 'ONCEONLY',
            'type' => 'fixed',
            'value' => 100,
            'is_active' => true,
            'starts_at' => now()->subMinute(),
            'per_user_limit' => 1,
        ]);

        $this->postJson('/api/checkout', $payload + ['coupon_code' => 'ONCEONLY'])->assertCreated();
        $this->postJson('/api/checkout', $payload + ['coupon_code' => 'ONCEONLY'])->assertStatus(422);
    }

    public function test_cart_sync_and_stale_reminder_creates_notification(): void
    {
        [$buyer, , $product] = $this->singleProductSetup();
        Sanctum::actingAs($buyer);

        $this->postJson('/api/cart/sync', [
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
            'coupon_code' => 'FASTLINK10',
        ])->assertOk()
            ->assertJsonPath('data.itemCount', 1);

        $count = app(CartRecoveryService::class)->remindStale(0);
        $this->assertSame(1, $count);
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $buyer->id,
            'type' => 'cart.abandoned',
        ]);
        $this->assertNotNull(UserNotification::query()->where('user_id', $buyer->id)->first());
    }

    public function test_register_with_referral_code_creates_attribution(): void
    {
        $referrer = User::factory()->create(['role' => 'buyer', 'name' => 'Ada Referrer']);
        $code = app(ReferralService::class)->ensureCode($referrer)->code;

        $this->postJson('/api/auth/register', [
            'name' => 'New Buyer',
            'email' => 'referred@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'referral_code' => $code,
        ])->assertCreated();

        $referred = User::query()->where('email', 'referred@example.com')->firstOrFail();
        $this->assertDatabaseHas('referral_attributions', [
            'referrer_id' => $referrer->id,
            'referred_user_id' => $referred->id,
        ]);
        $this->assertSame(1, ReferralAttribution::query()->where('referrer_id', $referrer->id)->count());

        Sanctum::actingAs($referrer);
        $this->getJson('/api/referrals/me')
            ->assertOk()
            ->assertJsonPath('data.code', $code)
            ->assertJsonPath('data.signups', 1);
    }

    public function test_self_referral_is_rejected(): void
    {
        $user = User::factory()->create(['role' => 'buyer']);
        $code = app(ReferralService::class)->ensureCode($user)->code;

        try {
            app(ReferralService::class)->attribute($user, $code);
            $this->fail('Expected self-referral to fail.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('referral_code', $e->errors());
        }
    }

    public function test_seller_growth_returns_restock_insight_for_low_stock(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $seller->id, 'status' => 'approved']);
        $product = Product::factory()->create([
            'store_id' => $store->id,
            'status' => 'active',
            'stock' => 3,
            'name' => 'Low Stock Lamp',
        ]);

        Sanctum::actingAs($seller);
        $this->getJson('/api/seller/growth')
            ->assertOk()
            ->assertJsonFragment([
                'type' => 'restock',
                'productId' => (string) $product->id,
            ]);
    }

    public function test_admin_and_seller_can_manage_promo_codes(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $seller = User::factory()->create(['role' => 'seller']);
        Store::factory()->create(['owner_id' => $seller->id, 'status' => 'approved']);

        Sanctum::actingAs($admin);
        $this->postJson('/api/admin/promo-codes', [
            'code' => 'PLATFORM5',
            'type' => 'percent',
            'value' => 5,
        ])->assertCreated()
            ->assertJsonPath('data.code', 'PLATFORM5');

        Sanctum::actingAs($seller);
        $created = $this->postJson('/api/seller/promo-codes', [
            'code' => 'SHOP15',
            'type' => 'percent',
            'value' => 15,
        ])->assertCreated();

        $id = $created->json('data.id');
        $this->patchJson("/api/seller/promo-codes/{$id}", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.isActive', false);
    }

    /**
     * @return array{0: User, 1: Address, 2: Product, 3: Product}
     */
    private function multiStoreCartSetup(): array
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $storeA = Store::factory()->create(['status' => 'approved', 'name' => 'Store Alpha']);
        $storeB = Store::factory()->create(['status' => 'approved', 'name' => 'Store Beta']);
        $productA = Product::factory()->create(['store_id' => $storeA->id, 'status' => 'active', 'stock' => 5, 'price' => 5000]);
        $productB = Product::factory()->create(['store_id' => $storeB->id, 'status' => 'active', 'stock' => 5, 'price' => 7000]);
        $address = Address::query()->create([
            'user_id' => $buyer->id,
            'label' => 'Home',
            'street' => '1 Test St',
            'city' => 'Lagos',
            'state' => 'Lagos',
            'postal_code' => '100001',
            'country' => 'Nigeria',
            'is_default' => true,
        ]);

        return [$buyer, $address, $productA, $productB];
    }

    /**
     * @return array{0: User, 1: Address, 2: Product}
     */
    private function singleProductSetup(int $price = 3000): array
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $store = Store::factory()->create(['status' => 'approved']);
        $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'active', 'stock' => 8, 'price' => $price]);
        $address = Address::query()->create([
            'user_id' => $buyer->id,
            'label' => 'Home',
            'street' => '1 Test St',
            'city' => 'Kano',
            'state' => 'Kano',
            'postal_code' => '700213',
            'country' => 'Nigeria',
            'is_default' => true,
        ]);

        return [$buyer, $address, $product];
    }
}
