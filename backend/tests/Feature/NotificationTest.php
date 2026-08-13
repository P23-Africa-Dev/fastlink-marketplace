<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_and_mark_notifications_read(): void
    {
        $user = User::factory()->create();
        $notification = UserNotification::query()->create([
            'user_id' => $user->id,
            'type' => 'order.paid',
            'title' => 'Paid',
            'body' => 'Your order was paid.',
        ]);

        Sanctum::actingAs($user);
        $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonPath('data.unreadCount', 1);

        $this->patchJson('/api/notifications/'.$notification->id.'/read')->assertOk();
        $this->assertNotNull($notification->fresh()->read_at);
    }
}
