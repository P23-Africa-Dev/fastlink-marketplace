<?php

namespace App\Services;

use App\Models\LoyaltyTransaction;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LoyaltyService
{
    public const POINT_VALUE = 1.0;

    public const EARN_PER_NAIRA = 100;

    public const MAX_REDEEM_RATIO = 0.5;

    /**
     * @return array{points: int, amount: float, available: int, maxRedeemable: int}
     */
    public function quote(User $user, float $afterPromoSubtotal, int $requested): array
    {
        $available = (int) $user->loyalty_points;
        $maxByCart = (int) floor(max(0, $afterPromoSubtotal) * self::MAX_REDEEM_RATIO);
        $maxRedeemable = min($available, $maxByCart);
        $points = max(0, min($requested, $maxRedeemable));

        return [
            'points' => $points,
            'amount' => round($points * self::POINT_VALUE, 2),
            'available' => $available,
            'maxRedeemable' => $maxRedeemable,
        ];
    }

    public function debit(User $user, int $points, int $orderId): void
    {
        if ($points <= 0) {
            return;
        }

        DB::transaction(function () use ($user, $points, $orderId) {
            $locked = User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            if ((int) $locked->loyalty_points < $points) {
                throw ValidationException::withMessages([
                    'redeem_points' => 'You do not have enough loyalty points.',
                ]);
            }

            $balance = (int) $locked->loyalty_points - $points;
            $locked->update(['loyalty_points' => $balance]);

            LoyaltyTransaction::query()->create([
                'user_id' => $locked->id,
                'order_id' => $orderId,
                'type' => 'redeem',
                'points' => -$points,
                'balance_after' => $balance,
                'note' => 'Redeemed at checkout',
            ]);
        });
    }

    public function restore(Order $order): void
    {
        $points = (int) ($order->loyalty_points ?? 0);
        if ($points <= 0 || ! $order->buyer_id) {
            return;
        }

        $already = LoyaltyTransaction::query()
            ->where('order_id', $order->id)
            ->where('type', 'restore')
            ->exists();
        if ($already) {
            return;
        }

        $this->credit(
            User::query()->findOrFail($order->buyer_id),
            $points,
            'restore',
            (int) $order->id,
            'Points restored from cancelled order',
        );
    }

    public function earnForOrder(Order $order): void
    {
        if ($order->payment_status !== 'paid' || ! $order->buyer_id) {
            return;
        }

        $already = LoyaltyTransaction::query()
            ->where('order_id', $order->id)
            ->where('type', 'earn')
            ->exists();
        if ($already) {
            return;
        }

        $points = (int) floor((float) $order->total / self::EARN_PER_NAIRA);
        if ($points < 1) {
            return;
        }

        $this->credit(
            User::query()->findOrFail($order->buyer_id),
            $points,
            'earn',
            (int) $order->id,
            'Earned from paid order '.$order->reference,
        );
    }

    /**
     * @return array{points: int, nairaValue: float, earnPerNaira: int, pointValue: float}
     */
    public function summary(User $user): array
    {
        $points = (int) $user->loyalty_points;

        return [
            'points' => $points,
            'nairaValue' => round($points * self::POINT_VALUE, 2),
            'earnPerNaira' => self::EARN_PER_NAIRA,
            'pointValue' => self::POINT_VALUE,
        ];
    }

    /**
     * @param  array<int, float>  $eligible
     * @return array<int, float>
     */
    public function allocate(array $eligible, float $discount): array
    {
        $total = array_sum($eligible);
        if ($total <= 0 || $discount <= 0) {
            return [];
        }

        $remaining = $discount;
        $ids = array_keys($eligible);
        $last = array_key_last($ids);
        $allocations = [];

        foreach ($ids as $index => $storeId) {
            if ($index === $last) {
                $allocations[$storeId] = round($remaining, 2);
                break;
            }
            $share = round($discount * ($eligible[$storeId] / $total), 2);
            $allocations[$storeId] = $share;
            $remaining = round($remaining - $share, 2);
        }

        return $allocations;
    }

    private function credit(User $user, int $points, string $type, ?int $orderId, string $note): void
    {
        DB::transaction(function () use ($user, $points, $type, $orderId, $note) {
            $locked = User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $balance = (int) $locked->loyalty_points + $points;
            $locked->update(['loyalty_points' => $balance]);

            LoyaltyTransaction::query()->create([
                'user_id' => $locked->id,
                'order_id' => $orderId,
                'type' => $type,
                'points' => $points,
                'balance_after' => $balance,
                'note' => $note,
            ]);
        });
    }
}
