<?php

namespace App\Services;

use App\Mail\OrderEventMail;
use App\Models\Order;
use App\Models\User;
use App\Models\UserNotification;
use App\Support\NotificationPreferences;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * @param  array<string, mixed>|null  $data
     */
    public function notify(User $user, string $type, string $title, string $body, ?array $data = null): UserNotification
    {
        $notification = UserNotification::query()->create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ]);

        $prefs = NotificationPreferences::normalize($user->notification_preferences);
        $channel = $this->channelForType($type);

        if ($channel && ($prefs[$channel]['email'] ?? false)) {
            Mail::to($user->email)->send(new OrderEventMail($title, $body));
        }

        return $notification;
    }

    public function notifyOrderEvent(Order $order, string $type, string $title, string $body): void
    {
        $order->loadMissing(['buyer', 'store.owner']);
        $payload = [
            'orderId' => (string) $order->id,
            'reference' => $order->reference,
        ];

        if ($order->buyer) {
            $this->notify($order->buyer, $type, $title, $body, $payload);
        }

        if (in_array($type, ['order.placed', 'order.paid'], true) && $order->store?->owner) {
            $this->notify(
                $order->store->owner,
                'sale.'.$type,
                'New order '.$order->reference,
                $body,
                $payload,
            );
        }
    }

    /**
     * @param  array<string, mixed>|null  $data
     */
    public function notifyAdmins(string $type, string $title, string $body, ?array $data = null): void
    {
        User::query()
            ->where('role', 'admin')
            ->where('status', 'active')
            ->each(fn (User $admin) => $this->notify($admin, $type, $title, $body, $data));
    }

    private function channelForType(string $type): ?string
    {
        if (str_starts_with($type, 'order.') || str_starts_with($type, 'return.') || str_starts_with($type, 'application.')) {
            return 'order';
        }
        if (str_starts_with($type, 'sale.') || str_starts_with($type, 'store.')) {
            return 'sale';
        }

        return null;
    }
}
