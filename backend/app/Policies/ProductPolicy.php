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
        return $user->role === 'seller' && $user->stores()->exists();
    }

    public function update(User $user, Product $product): bool
    {
        return $product->store?->owner_id === $user->id;
    }

    public function delete(User $user, Product $product): bool
    {
        return $this->update($user, $product);
    }
}
