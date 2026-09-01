<?php

namespace App\Services;

use App\Mail\PlatformMail;
use App\Models\Order;
use App\Models\User;
use App\Models\UserNotification;
use App\Support\EmailTemplates;
use App\Support\NotificationPreferences;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class NotificationService
{
    /**
     * @param  array<string, mixed>|null  $data
     */
    public function notify(
        User $user,
        string $type,
        string $title,
        string $body,
        ?array $data = null,
        bool $forceEmail = false,
    ): UserNotification {
        $notification = UserNotification::query()->create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ]);

        $this->sendEmail($user, $type, $title, $body, $data ?? [], $forceEmail);

        return $notification;
    }

    /**
     * Transactional email that always sends (welcome, password, security).
     *
     * @param  array<string, mixed>  $data
     */
    public function emailOnly(User $user, string $type, string $title, string $body, array $data = []): void
    {
        $this->sendEmail($user, $type, $title, $body, $data, force: true);
    }

    public function notifyOrderEvent(Order $order, string $type, string $title, string $body): void
    {
        $order->loadMissing(['buyer', 'store.owner', 'items']);
        $payload = [
            'orderId' => (string) $order->id,
            'reference' => $order->reference,
            'total' => (float) $order->total,
            'status' => $order->status,
            'paymentStatus' => $order->payment_status,
            'storeName' => $order->store?->name,
            'trackingUrl' => rtrim((string) config('app.frontend_url'), '/').'/account/orders/'.$order->id,
            'ordersUrl' => rtrim((string) config('app.frontend_url'), '/').'/orders',
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

    /**
     * @param  array<string, mixed>  $data
     */
    private function sendEmail(
        User $user,
        string $type,
        string $title,
        string $body,
        array $data,
        bool $force = false,
    ): void {
        if (! filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
            return;
        }

        $prefs = NotificationPreferences::normalize($user->notification_preferences);
        $channel = $this->channelForType($type);

        if (! $force && $channel && ! ($prefs[$channel]['email'] ?? false)) {
            return;
        }

        // Types with no preference channel still email when forced; otherwise skip.
        if (! $force && $channel === null) {
            return;
        }

        $resolved = EmailTemplates::resolve($type, $title, $body);
        if (! $resolved) {
            return;
        }

        $frontend = rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/');
        $viewData = array_merge([
            'heading' => $title,
            'intro' => $body,
            'body' => $body,
            'userName' => $user->name,
            'ctaUrl' => $data['ctaUrl'] ?? $frontend,
            'ctaLabel' => $data['ctaLabel'] ?? 'Open Fastlink',
            'details' => $this->detailsFromData($type, $data),
            'outro' => $data['outro'] ?? null,
        ], $data);

        try {
            Mail::to($user->email)->send(new PlatformMail(
                $resolved['subject'],
                $resolved['template'],
                $viewData,
            ));
        } catch (Throwable $e) {
            Log::warning('Failed to send platform email', [
                'type' => $type,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, string>
     */
    private function detailsFromData(string $type, array $data): array
    {
        $details = [];

        if (! empty($data['reference'])) {
            $details['Order'] = (string) $data['reference'];
        }
        if (isset($data['total'])) {
            $details['Total'] = '₦'.number_format((float) $data['total'], 2);
        }
        if (! empty($data['storeName'])) {
            $details['Store'] = (string) $data['storeName'];
        }
        if (! empty($data['status'])) {
            $details['Status'] = ucfirst(str_replace('_', ' ', (string) $data['status']));
        }
        if (! empty($data['amount'])) {
            $details['Amount'] = '₦'.number_format((float) $data['amount'], 2);
        }
        if (! empty($data['productName'])) {
            $details['Product'] = (string) $data['productName'];
        }
        if (! empty($data['reason'])) {
            $details['Reason'] = (string) $data['reason'];
        }
        if (! empty($data['role'])) {
            $details['Role'] = (string) $data['role'];
        }
        if (str_starts_with($type, 'inventory.') && isset($data['stock'])) {
            $details['Stock left'] = (string) $data['stock'];
        }

        return $details;
    }

    private function channelForType(string $type): ?string
    {
        return match (true) {
            str_starts_with($type, 'inventory.') => 'stock',
            str_starts_with($type, 'sale.'),
            str_starts_with($type, 'store.'),
            str_starts_with($type, 'product.'),
            str_starts_with($type, 'payout.'),
            str_starts_with($type, 'staff.'),
            str_starts_with($type, 'review.received'),
            str_starts_with($type, 'chargeback.') => 'sale',
            str_starts_with($type, 'order.'),
            str_starts_with($type, 'return.'),
            str_starts_with($type, 'dispute.'),
            str_starts_with($type, 'application.'),
            str_starts_with($type, 'cart.'),
            str_starts_with($type, 'rider.'),
            str_starts_with($type, 'message.'),
            str_starts_with($type, 'support.'),
            str_starts_with($type, 'review.replied') => 'order',
            str_starts_with($type, 'account.') => 'order',
            default => null,
        };
    }
}
