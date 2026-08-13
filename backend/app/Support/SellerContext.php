<?php

namespace App\Support;

use App\Models\Store;
use App\Models\User;
use Illuminate\Support\Collection;

class SellerContext
{
    /**
     * @return Collection<int, int|string>
     */
    public static function storeIds(User $user): Collection
    {
        return $user->stores()->pluck('id');
    }

    public static function storeOrFail(User $user): Store
    {
        $store = $user->store;

        if (! $store) {
            abort(404, 'Store not found.');
        }

        return $store;
    }
}
