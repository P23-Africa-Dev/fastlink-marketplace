<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ReturnRequest;
use App\Models\Store;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReturnTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_request_return_and_seller_can_approve(): void
    {
        Mail::fake();
        [$buyer, $seller, $order] = $this->paidOrderSetup();

        Sanctum::actingAs($buyer);
        $this->postJson('/api/orders/'.$order->id.'/returns', [
            'reason' => 'Item arrived damaged.',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        Sanctum::actingAs($seller);
        $return = ReturnRequest::query()->firstOrFail();
        $this->patchJson('/api/seller/returns/'.$return->id, ['action' => 'approve'])
            ->assertOk()
            ->assertJsonPath('data.status', 'refunded');

        $order->refresh();
        $this->assertSame('cancelled', $order->status);
        $this->assertSame('refunded', $order->payment_status);
        $this->assertDatabaseHas('payments', ['order_id' => $order->id, 'status' => 'refunded']);
    }

    public function test_seller_can_reject_return(): void
    {
        Mail::fake();
        [$buyer, $seller, $order] = $this->paidOrderSetup();

        Sanctum::actingAs($buyer);
        $this->postJson('/api/orders/'.$order->id.'/returns', [
            'reason' => 'Changed my mind.',
        ])->assertCreated();

        Sanctum::actingAs($seller);
        $return = ReturnRequest::query()->firstOrFail();
        $this->patchJson('/api/seller/returns/'.$return->id, [
            'action' => 'reject',
            'note' => 'Outside return window.',
        ])->assertOk()
            ->assertJsonPath('data.status', 'rejected');
    }

    /**
     * @return array{0: User, 1: User, 2: Order}
     */
    private function paidOrderSetup(): array
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $seller->id, 'status' => 'approved']);
        $product = Product::factory()->create(['store_id' => $store->id, 'status' => 'active', 'stock' => 5]);
        $order = Order::factory()->create([
            'buyer_id' => $buyer->id,
            'store_id' => $store->id,
            'status' => 'delivered',
            'payment_status' => 'paid',
            'total' => 100,
        ]);
        $order->items()->create([
            'product_id' => $product->id,
            'name_snapshot' => $product->name,
            'quantity' => 1,
            'unit_price' => 100,
        ]);
        Payment::query()->create([
            'order_id' => $order->id,
            'store_id' => $store->id,
            'provider' => 'demo',
            'reference' => 'REF-TEST',
            'amount' => 100,
            'fees' => 5,
            'net' => 95,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        return [$buyer, $seller, $order];
    }
}
