<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Brand;
use App\Models\Category;
use App\Models\PageView;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\WishlistItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TierThreeGrowthTest extends TestCase
{
    use RefreshDatabase;

    public function test_paid_order_earns_loyalty_points(): void
    {
        [$buyer, $address, $product] = $this->checkoutSetup(price: 10000);

        Sanctum::actingAs($buyer);
        $placed = $this->postJson('/api/checkout', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();

        $this->postJson('/api/checkout/confirm', ['group_id' => $placed->json('data.groupId')])->assertOk();

        $buyer->refresh();
        $this->assertGreaterThan(0, (int) $buyer->loyalty_points);
        $this->getJson('/api/loyalty/me')
            ->assertOk()
            ->assertJsonPath('data.points', (int) $buyer->loyalty_points);
    }

    public function test_redeeming_points_reduces_checkout_total(): void
    {
        [$buyer, $address, $product] = $this->checkoutSetup(price: 8000);
        $buyer->update(['loyalty_points' => 500]);

        Sanctum::actingAs($buyer);
        $plain = $this->postJson('/api/checkout/quote', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertOk();

        $redeemed = $this->postJson('/api/checkout/quote', [
            'address_id' => $address->id,
            'redeem_points' => 400,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertOk()
            ->assertJsonPath('data.loyaltyPoints', 400);

        $this->assertEqualsWithDelta(400, (float) $redeemed->json('data.loyaltyDiscount'), 0.01);
        $this->assertLessThan((float) $plain->json('data.total'), (float) $redeemed->json('data.total'));

        $this->postJson('/api/checkout', [
            'address_id' => $address->id,
            'redeem_points' => 400,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();

        $this->assertSame(100, (int) $buyer->fresh()->loyalty_points);
    }

    public function test_search_suggest_returns_prefix_matches(): void
    {
        $store = Store::factory()->create(['status' => 'approved', 'name' => 'Gadget Hub']);
        Product::factory()->create([
            'store_id' => $store->id,
            'status' => 'active',
            'stock' => 4,
            'name' => 'Samsung Galaxy Tab',
        ]);
        Brand::query()->create(['name' => 'Samsung', 'slug' => 'samsung-brand', 'product_brand' => 'Samsung']);

        $this->getJson('/api/search/suggest?q=Sam')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Samsung Galaxy Tab'])
            ->assertJsonFragment(['name' => 'Samsung']);
    }

    public function test_recommendations_use_views_and_wishlist(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $category = Category::query()->create(['name' => 'Electronics', 'slug' => 'electronics-rec']);
        $store = Store::factory()->create(['status' => 'approved']);
        $viewed = Product::factory()->create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'status' => 'active',
            'stock' => 5,
            'name' => 'Viewed Phone',
        ]);
        $related = Product::factory()->create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'status' => 'active',
            'stock' => 5,
            'name' => 'Related Charger',
        ]);

        PageView::query()->create([
            'store_id' => $store->id,
            'product_id' => $viewed->id,
            'viewer_id' => $buyer->id,
            'path' => '/products/'.$viewed->slug,
        ]);
        WishlistItem::query()->create([
            'user_id' => $buyer->id,
            'product_id' => $viewed->id,
        ]);

        Sanctum::actingAs($buyer);
        $this->getJson('/api/recommendations')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Related Charger'])
            ->assertJsonFragment(['name' => 'Viewed Phone']);
    }

    /**
     * @return array{0: User, 1: Address, 2: Product}
     */
    private function checkoutSetup(int $price = 3000): array
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
