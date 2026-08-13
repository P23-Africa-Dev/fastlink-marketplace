<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['seller', 'admin'], true);
    }

    public function view(User $user, Product $product): bool
    {
        return $product->store?->owner_id === $user->id;
    }

    public function create(User $user): bool
    {
        if ($user->role !== 'seller') {
            return false;
        }

        $store = $user->store;

        return $store !== null && $store->status === 'approved';
    }

    public function update(User $user, Product $product): bool
    {
        if ($product->store?->owner_id !== $user->id) {
            return false;
        }

        return $product->store?->status === 'approved';
    }

    public function delete(User $user, Product $product): bool
    {
        return $this->update($user, $product);
    }
}