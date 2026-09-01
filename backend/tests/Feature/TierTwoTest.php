<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Store;
use App\Models\StoreDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TierTwoTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_quote_groups_items_by_store_with_zone_shipping(): void
    {
        [$buyer, $address, $productA, $productB] = $this->multiStoreCartSetup();

        Sanctum::actingAs($buyer);
        $response = $this->postJson('/api/checkout/quote', [
            'address_id' => $address->id,
            'items' => [
                ['product_id' => $productA->id, 'quantity' => 1],
                ['product_id' => $productB->id, 'quantity' => 1],
            ],
        ])->assertOk();

        $response->assertJsonPath('data.orderCount', 2)
            ->assertJsonPath('data.groupPreview', true)
            ->assertJsonCount(2, 'data.stores')
            ->assertJsonStructure(['data' => ['deliveryEstimate' => ['minDays', 'maxDays', 'label']]]);
    }

    public function test_checkout_creates_inventory_movements(): void
    {
        [$buyer, $address, $product] = $this->singleProductSetup();

        Sanctum::actingAs($buyer);
        $this->postJson('/api/checkout', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertCreated();

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $product->id,
            'type' => 'sale',
            'quantity_delta' => -1,
        ]);
    }

    public function test_seller_can_upload_kyc_document(): void
    {
        Storage::fake('public');
        $seller = User::factory()->create(['role' => 'seller']);
        Store::factory()->create(['owner_id' => $seller->id, 'status' => 'approved']);

        Sanctum::actingAs($seller);
        $this->postJson('/api/seller/documents', [
            'type' => 'cac',
            'document' => UploadedFile::fake()->create('cac.pdf', 120, 'application/pdf'),
        ])->assertCreated()
            ->assertJsonPath('data.type', 'cac');

        $this->assertSame(1, StoreDocument::query()->count());
    }

    public function test_seller_replaces_pending_document_of_same_type(): void
    {
        Storage::fake('public');
        $seller = User::factory()->create(['role' => 'seller']);
        Store::factory()->create(['owner_id' => $seller->id, 'status' => 'approved']);

        Sanctum::actingAs($seller);
        $this->postJson('/api/seller/documents', [
            'type' => 'cac',
            'document' => UploadedFile::fake()->create('cac-v1.pdf', 120, 'application/pdf'),
        ])->assertCreated();

        $this->postJson('/api/seller/documents', [
            'type' => 'cac',
            'document' => UploadedFile::fake()->create('cac-v2.pdf', 120, 'application/pdf'),
        ])->assertCreated()
            ->assertJsonPath('data.type', 'cac');

        $this->assertSame(1, StoreDocument::query()->count());
    }

    public function test_admin_can_list_delivery_zones(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/delivery-zones')
            ->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name', 'fee', 'etaMinDays', 'etaMaxDays']]]);
    }

    public function test_seller_inventory_summary_includes_low_stock_snapshot(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $seller->id, 'status' => 'approved']);
        $low = Product::factory()->create(['store_id' => $store->id, 'status' => 'active', 'stock' => 2]);
        Product::factory()->create(['store_id' => $store->id, 'status' => 'active', 'stock' => 0]);
        InventoryMovement::query()->create([
            'product_id' => $low->id,
            'store_id' => $store->id,
            'type' => 'restock',
            'quantity_delta' => 2,
            'quantity_after' => 2,
            'reference_type' => null,
            'reference_id' => null,
            'note' => 'Initial stock',
            'created_at' => now(),
        ]);

        Sanctum::actingAs($seller);
        $this->getJson('/api/seller/inventory/summary')
            ->assertOk()
            ->assertJsonPath('data.lowStockCount', 1)
            ->assertJsonPath('data.outOfStockCount', 1)
            ->assertJsonPath('data.lowStockProducts.0.id', (string) $low->id);
    }

    public function test_city_zone_overrides_state_shipping_fee(): void
    {
        \App\Models\DeliveryZone::query()->create([
            'name' => 'Lagos — Ikeja',
            'state' => 'Lagos',
            'city' => 'Ikeja',
            'fee' => 800,
            'free_above' => null,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $buyer = User::factory()->create(['role' => 'buyer']);
        $store = Store::factory()->create(['status' => 'approved']);
        $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'active', 'stock' => 5, 'price' => 3000]);
        $address = Address::query()->create([
            'user_id' => $buyer->id,
            'label' => 'Home',
            'street' => '1 Allen Ave',
            'city' => 'Ikeja',
            'state' => 'Lagos',
            'postal_code' => '100271',
            'country' => 'Nigeria',
            'is_default' => true,
        ]);

        Sanctum::actingAs($buyer);
        $this->postJson('/api/checkout/quote', [
            'address_id' => $address->id,
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])->assertOk()
            ->assertJsonPath('data.shipping', 800)
            ->assertJsonPath('data.deliveryZone.name', 'Lagos — Ikeja');
    }

    public function test_seller_can_record_damaged_stock(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $seller->id, 'status' => 'approved']);
        $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'active', 'stock' => 10]);

        Sanctum::actingAs($seller);
        $this->patchJson("/api/seller/products/{$product->id}/stock", [
            'quantity_delta' => -2,
            'type' => 'damaged',
            'note' => 'Water damage',
        ])->assertOk();

        $this->assertSame(8, $product->fresh()->stock);
        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $product->id,
            'type' => 'damaged',
            'quantity_delta' => -2,
        ]);
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
    private function singleProductSetup(): array
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $store = Store::factory()->create(['status' => 'approved']);
        $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'active', 'stock' => 5, 'price' => 3000]);
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
