<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Mall;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_malls_index_returns_seeded_shape(): void
    {
        $mall = Mall::query()->create([
            'name' => 'Kano Malls',
            'slug' => 'kano-malls',
            'image' => 'https://example.com/mall.jpg',
            'location' => 'Kano Municipal',
            'city' => 'Kano',
        ]);

        $owner = User::factory()->create(['role' => 'seller']);
        $category = Category::query()->create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'image' => 'https://example.com/cat.jpg',
        ]);

        Store::factory()->create([
            'owner_id' => $owner->id,
            'mall_id' => $mall->id,
            'category_id' => $category->id,
            'name' => 'Electronic Hub',
            'slug' => 'electronic-hub',
            'type' => 'mall_store',
            'status' => 'approved',
        ]);

        $this->getJson('/api/malls')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.data.0.slug', 'kano-malls')
            ->assertJsonPath('data.data.0.storeCount', 1);
    }

    public function test_mall_stores_can_filter_by_category(): void
    {
        $mall = Mall::query()->create([
            'name' => 'Kano Malls',
            'slug' => 'kano-malls',
            'image' => 'https://example.com/mall.jpg',
            'location' => 'Kano',
        ]);
        $electronics = Category::query()->create(['name' => 'Electronics', 'slug' => 'electronics']);
        $fashion = Category::query()->create(['name' => 'Fashion', 'slug' => 'fashion']);
        $owner = User::factory()->create(['role' => 'seller']);

        Store::factory()->create([
            'owner_id' => $owner->id,
            'mall_id' => $mall->id,
            'category_id' => $electronics->id,
            'slug' => 'electronic-hub',
            'name' => 'Electronic Hub',
            'type' => 'mall_store',
            'status' => 'approved',
        ]);
        Store::factory()->create([
            'owner_id' => $owner->id,
            'mall_id' => $mall->id,
            'category_id' => $fashion->id,
            'slug' => 'style-avenue',
            'name' => 'Style Avenue',
            'type' => 'mall_store',
            'status' => 'approved',
        ]);

        $this->getJson('/api/malls/kano-malls/stores?category=electronics')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'electronic-hub');
    }

    public function test_brands_and_categories_are_public(): void
    {
        Brand::query()->create([
            'name' => 'NIKE',
            'slug' => 'nike',
            'product_brand' => 'Nike',
            'logo_style' => 'black',
        ]);
        Category::query()->create(['name' => 'Fashion', 'slug' => 'fashion']);

        $this->getJson('/api/brands')
            ->assertOk()
            ->assertJsonPath('data.0.href', '/brands/nike');

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'fashion');
    }

    public function test_nationwide_and_emerging_endpoints(): void
    {
        $owner = User::factory()->create(['role' => 'seller']);

        Store::factory()->create([
            'owner_id' => $owner->id,
            'slug' => 'jumia-official',
            'name' => 'Jumia Official',
            'type' => 'nationwide',
            'headline' => 'Nationwide Shipping',
            'status' => 'approved',
        ]);
        Store::factory()->create([
            'owner_id' => $owner->id,
            'slug' => 'zuri-fashion-hub',
            'name' => 'Zuri Fashion Hub',
            'type' => 'emerging',
            'headline' => 'Fashion store',
            'logo' => 'https://example.com/zuri.jpg',
            'status' => 'approved',
        ]);

        $this->getJson('/api/stores/nationwide')
            ->assertOk()
            ->assertJsonPath('data.0.href', '/stores/jumia-official');

        $this->getJson('/api/vendors/emerging')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Zuri Fashion Hub')
            ->assertJsonPath('data.0.href', '/stores/zuri-fashion-hub');
    }
}
