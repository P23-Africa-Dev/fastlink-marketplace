<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConversationTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_message_seller_and_seller_can_reply(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $seller->id]);
        $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'active']);
        $buyer = User::factory()->create(['role' => 'buyer']);

        Sanctum::actingAs($buyer);
        $created = $this->postJson('/api/conversations', [
            'store_id' => $store->id,
            'product_id' => $product->id,
            'body' => 'Is this still in stock?',
        ])->assertCreated();

        $id = $created->json('data.id');
        $this->assertNotEmpty($id);

        Sanctum::actingAs($seller);
        $this->getJson('/api/conversations')
            ->assertOk()
            ->assertJsonPath('data.data.0.id', $id);

        $this->postJson('/api/conversations/'.$id.'/messages', [
            'body' => 'Yes, we have 4 left.',
        ])->assertOk();

        $this->patchJson('/api/conversations/'.$id, ['status' => 'in_progress'])
            ->assertOk()
            ->assertJsonPath('data.status', 'in_progress');
    }

    public function test_other_seller_cannot_read_conversation(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $seller->id]);
        $buyer = User::factory()->create(['role' => 'buyer']);
        Sanctum::actingAs($buyer);
        $id = $this->postJson('/api/conversations', [
            'store_id' => $store->id,
            'body' => 'Hello',
        ])->json('data.id');

        $other = User::factory()->create(['role' => 'seller']);
        Store::factory()->create(['owner_id' => $other->id]);
        Sanctum::actingAs($other);

        $this->getJson('/api/conversations/'.$id)->assertForbidden();
    }
}
