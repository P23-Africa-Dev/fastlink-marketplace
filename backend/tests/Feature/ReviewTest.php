<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_review_purchased_product(): void
    {
        [$buyer, $seller, $product] = $this->purchasedProduct();
        Sanctum::actingAs($buyer);

        $this->postJson('/api/reviews', [
            'product_id' => $product->id,
            'rating' => 5,
            'body' => 'Great product.',
        ])
            ->assertCreated()
            ->assertJsonPath('data.rating', 5);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'review_count' => 1,
            'rating' => 5,
        ]);

        $this->getJson('/api/products/'.$product->id.'/reviews')
            ->assertOk()
            ->assertJsonPath('data.0.body', 'Great product.');
    }

    public function test_buyer_cannot_review_without_purchase(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $product = Product::factory()->create();
        Sanctum::actingAs($buyer);

        $this->postJson('/api/reviews', [
            'product_id' => $product->id,
            'rating' => 4,
        ])->assertStatus(422);
    }

    public function test_seller_can_reply_and_flag_review(): void
    {
        [$buyer, $seller, $product] = $this->purchasedProduct();
        $review = Review::query()->create([
            'product_id' => $product->id,
            'store_id' => $product->store_id,
            'buyer_id' => $buyer->id,
            'rating' => 4,
            'body' => 'Nice.',
            'status' => 'approved',
        ]);

        Sanctum::actingAs($seller);

        $this->postJson('/api/seller/reviews/'.$review->id.'/reply', [
            'body' => 'Thank you for shopping with us.',
        ])
            ->assertOk()
            ->assertJsonPath('data.reply.body', 'Thank you for shopping with us.');

        $this->patchJson('/api/seller/reviews/'.$review->id, [
            'status' => 'flagged',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'flagged');

        $this->getJson('/api/products/'.$product->id.'/reviews')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    /**
     * @return array{0: User, 1: User, 2: Product}
     */
    private function purchasedProduct(): array
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $seller->id]);
        $buyer = User::factory()->create(['role' => 'buyer']);
        $product = Product::factory()->create(['store_id' => $store->id, 'rating' => 0, 'review_count' => 0]);

        $order = Order::factory()->create([
            'buyer_id' => $buyer->id,
            'store_id' => $store->id,
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);
        $order->items()->create([
            'product_id' => $product->id,
            'name_snapshot' => $product->name,
            'quantity' => 1,
            'unit_price' => $product->price,
        ]);

        return [$buyer, $seller, $product];
    }
}
