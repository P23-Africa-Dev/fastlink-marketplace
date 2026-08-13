<?php

namespace App\Services;

use App\Models\CartSnapshot;
use App\Models\User;

class CartRecoveryService
{
    /**
     * @param  list<array{product_id: mixed, quantity: int}>  $items
     */
    public function sync(User $user, array $items, ?string $couponCode = null): CartSnapshot
    {
        $normalized = array_values(array_filter($items, fn ($item) => (int) ($item['quantity'] ?? 0) > 0));

        if ($normalized === []) {
            CartSnapshot::query()->where('user_id', $user->id)->delete();

            return new CartSnapshot(['user_id' => $user->id, 'items' => []]);
        }

        return CartSnapshot::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'items' => $normalized,
                'coupon_code' => $couponCode,
                'reminded_at' => null,
            ],
        );
    }

    public function remindStale(int $hours = 2): int
    {
        $cutoff = now()->subHours(max(0, $hours));
        $count = 0;

        CartSnapshot::query()
            ->with('user')
            ->whereNull('reminded_at')
            ->where('updated_at', '<=', $cutoff)
            ->each(function (CartSnapshot $snapshot) use (&$count) {
                if (! $snapshot->user || $snapshot->items === []) {
                    return;
                }

                app(NotificationService::class)->notify(
                    $snapshot->user,
                    'cart.abandoned',
                    'You left items in your cart',
                    'Your Fastlink cart is still waiting. Complete checkout before stock runs out.',
                    ['itemCount' => count($snapshot->items)],
                );

                $snapshot->update(['reminded_at' => now()]);
                $count++;
            });

        return $count;
    }
}
