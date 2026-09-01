<?php

namespace Tests\Feature;

use App\Mail\PlatformMail;
use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmailNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_registration_sends_welcome_email(): void
    {
        Mail::fake();

        $this->postJson('/api/auth/register', [
            'name' => 'Amina Buyer',
            'email' => 'amina@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'buyer',
        ])->assertCreated();

        Mail::assertSent(PlatformMail::class, function (PlatformMail $mail) {
            return $mail->template === 'welcome-buyer'
                && $mail->hasTo('amina@example.com');
        });
    }

    public function test_seller_onboard_sends_store_setup_email(): void
    {
        Mail::fake();
        $user = User::factory()->create(['role' => 'buyer']);
        Sanctum::actingAs($user);

        $this->postJson('/api/seller/onboard', [
            'business_name' => 'Kano Gadgets',
            'phone' => '08012345678',
            'submit_kyc' => false,
        ])->assertCreated();

        Mail::assertSent(PlatformMail::class, function (PlatformMail $mail) {
            return in_array($mail->template, ['seller-onboarded', 'seller-kyc-reminder'], true);
        });
    }

    public function test_order_paid_notification_sends_email_when_prefs_allow(): void
    {
        Mail::fake();

        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create(['owner_id' => $seller->id, 'status' => 'approved']);
        $buyer = User::factory()->create([
            'role' => 'buyer',
            'notification_preferences' => [
                'order' => ['email' => true, 'push' => true],
                'sale' => ['email' => true, 'push' => true],
                'stock' => ['email' => true, 'push' => true],
            ],
        ]);
        $order = Order::factory()->create([
            'buyer_id' => $buyer->id,
            'store_id' => $store->id,
            'status' => 'confirmed',
            'payment_status' => 'paid',
            'total' => 15000,
        ]);

        app(NotificationService::class)->notifyOrderEvent(
            $order,
            'order.paid',
            'Payment confirmed',
            'Payment for order '.$order->reference.' was successful.',
        );

        Mail::assertSent(PlatformMail::class, function (PlatformMail $mail) use ($buyer) {
            return $mail->template === 'order-paid' && $mail->hasTo($buyer->email);
        });

        Mail::assertSent(PlatformMail::class, function (PlatformMail $mail) use ($seller) {
            return $mail->template === 'seller-new-order' && $mail->hasTo($seller->email);
        });
    }

    public function test_email_respects_disabled_preference(): void
    {
        Mail::fake();

        $buyer = User::factory()->create([
            'notification_preferences' => [
                'order' => ['email' => false, 'push' => true],
                'sale' => ['email' => true, 'push' => true],
                'stock' => ['email' => true, 'push' => true],
            ],
        ]);

        app(NotificationService::class)->notify(
            $buyer,
            'order.shipped',
            'Shipped',
            'Your order is on the way.',
        );

        Mail::assertNothingSent();
    }

    public function test_force_email_ignores_preferences(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'notification_preferences' => [
                'order' => ['email' => false, 'push' => false],
                'sale' => ['email' => false, 'push' => false],
                'stock' => ['email' => false, 'push' => false],
            ],
        ]);

        app(NotificationService::class)->notify(
            $user,
            'account.welcome_buyer',
            'Welcome',
            'Welcome body',
            [],
            forceEmail: true,
        );

        Mail::assertSent(PlatformMail::class);
    }

    public function test_store_approval_emails_seller(): void
    {
        Mail::fake();
        $admin = User::factory()->create(['role' => 'admin']);
        $seller = User::factory()->create(['role' => 'seller']);
        $store = Store::factory()->create([
            'owner_id' => $seller->id,
            'status' => 'pending',
            'kyc_status' => 'under_review',
        ]);

        Sanctum::actingAs($admin);
        $this->postJson('/api/admin/stores/'.$store->id.'/approve')->assertOk();

        Mail::assertSent(PlatformMail::class, function (PlatformMail $mail) use ($seller) {
            return $mail->template === 'seller-approved' && $mail->hasTo($seller->email);
        });
    }
}
