<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['seller', 'admin'], true);
    }

    public function view(User $user, Order $order): bool
    {
        if ($user->role === 'admin' || $order->buyer_id === $user->id) {
            return true;
        }

        return $order->store?->owner_id === $user->id;
    }

    public function update(User $user, Order $order): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $order->store?->owner_id === $user->id;
    }
}
