<?php

namespace Tests\Feature;

use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SupportTicketTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_creates_ticket_and_admin_replies(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        Store::factory()->create(['owner_id' => $seller->id]);
        Sanctum::actingAs($seller);

        $created = $this->postJson('/api/seller/support/tickets', [
            'subject' => 'Payout delay',
            'category' => 'Billing',
            'priority' => 'High',
            'body' => 'My payout is still pending.',
        ])->assertCreated();

        $id = $created->json('data.id');
        $this->getJson('/api/seller/support/tickets')->assertOk()->assertJsonPath('data.data.0.id', $id);

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);
        $this->postJson('/api/admin/support/tickets/'.$id.'/messages', [
            'body' => 'We are reviewing it now.',
        ])->assertOk();

        $this->patchJson('/api/admin/support/tickets/'.$id, ['status' => 'resolved'])
            ->assertOk()
            ->assertJsonPath('data.status', 'resolved');
    }

    public function test_seller_cannot_list_admin_tickets_queue(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        Sanctum::actingAs($seller);
        $this->getJson('/api/admin/support/tickets')->assertForbidden();
    }
}
