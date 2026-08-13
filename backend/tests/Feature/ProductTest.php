<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_products_list_is_paginated(): void
    {
        $category = Category::query()->create(['name' => 'Electronics', 'slug' => 'electronics']);
        $store = Store::factory()->create();

        Product::factory()->count(3)->create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'status' => 'active',
            'is_featured' => true,
        ]);
        Product::factory()->create([
            'store_id' => $store->id,
            'status' => 'draft',
        ]);

        $this->getJson('/api/products?featured=1')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 3)
            ->assertJsonCount(3, 'data.data');
    }

    public function test_product_detail_by_slug(): void
    {
        $product = Product::factory()->create([
            'slug' => 'nike-air-sneakers',
            'name' => 'Nike Air Max',
            'status' => 'active',
        ]);
        $product->images()->create([
            'url' => 'https://example.com/nike.jpg',
            'alt' => 'Nike',
            'is_primary' => true,
            'sort_order' => 0,
        ]);

        $this->getJson('/api/products/nike-air-sneakers')
            ->assertOk()
            ->assertJsonPath('data.slug', 'nike-air-sneakers')
            ->assertJsonPath('data.store.slug', $product->store->slug)
            ->assertJsonPath('data.images.0.isPrimary', true);
    }

    public function test_seller_can_create_and_list_product(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        Store::factory()->create(['owner_id' => $seller->id, 'slug' => 'demo-seller-store']);
        Category::query()->create(['name' => 'Fashion', 'slug' => 'fashion']);

        Sanctum::actingAs($seller);

        $this->postJson('/api/seller/products', [
            'name' => 'Demo Cotton Tee',
            'price' => 12000,
            'stock' => 10,
            'category' => 'fashion',
            'status' => 'active',
            'image_urls' => ['https://example.com/tee.jpg'],
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Demo Cotton Tee')
            ->assertJsonPath('data.status', 'active');

        $this->getJson('/api/seller/products')
            ->assertOk()
            ->assertJsonPath('data.total', 1);

        $this->getJson('/api/products?store=demo-seller-store')
            ->assertOk()
            ->assertJsonPath('data.total', 1);
    }

    public function test_buyer_cannot_create_seller_product(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        Sanctum::actingAs($buyer);

        $this->postJson('/api/seller/products', [
            'name' => 'Hacked',
            'price' => 1,
        ])->assertForbidden();
    }

    public function test_seller_cannot_update_another_sellers_product(): void
    {
        $owner = User::factory()->create(['role' => 'seller']);
        $other = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $owner->id]);
        Store::factory()->create(['owner_id' => $other->id]);
        $product = Product::factory()->create(['store_id' => $store->id]);

        Sanctum::actingAs($other);

        $this->patchJson('/api/seller/products/'.$product->id, [
            'name' => 'Stolen',
        ])->assertForbidden();
    }

    public function test_search_matches_product_name(): void
    {
        $product = Product::factory()->create([
            'name' => 'PlayStation 5 Console',
            'status' => 'active',
        ]);

        $this->getJson('/api/search?q=playstation')
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.id', (string) $product->id);
    }
}
