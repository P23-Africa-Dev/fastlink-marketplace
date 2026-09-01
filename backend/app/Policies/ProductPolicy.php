<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Support\SellerContext;
use App\Support\SellerGate;

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
        return SellerContext::storeIds($user)->contains($product->store_id);
    }

    public function create(User $user): bool
    {
        if ($user->role !== 'seller') {
            return false;
        }

        $store = $user->store ?? Store::query()->whereIn('id', SellerContext::storeIds($user))->first();

        return $store !== null && $store->canDraftProducts();
    }

    public function update(User $user, Product $product): bool
    {
        if (! SellerContext::storeIds($user)->contains($product->store_id)) {
            return false;
        }

        return $product->store?->canDraftProducts() === true;
    }

    public function delete(User $user, Product $product): bool
    {
        return $this->update($user, $product);
    }

    public function publish(User $user, ?Product $product = null): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        $store = $product?->store ?? SellerGate::storeFor($user);

        return $store?->canSell() === true;
    }
}
