<?php

namespace App\Support;

use App\Models\Store;
use App\Models\User;
use Symfony\Component\HttpKernel\Exception\HttpException;

class SellerGate
{
    public static function storeFor(User $user): ?Store
    {
        return $user->store ?? Store::query()->whereIn('id', SellerContext::storeIds($user))->first();
    }

    public static function assertCanDraft(User $user): Store
    {
        $store = self::storeFor($user);
        if (! $store || ! $store->canDraftProducts()) {
            throw new HttpException(403, 'Create a store before managing products.', null, [
                'X-Error-Code' => 'STORE_REQUIRED',
            ]);
        }

        return $store;
    }

    public static function assertCanSell(User $user, string $action = 'sell'): Store
    {
        $store = self::assertCanDraft($user);

        if (! $store->canSell()) {
            throw new HttpException(
                403,
                'Complete KYC verification before you can '.$action.' on the marketplace.',
                null,
                ['X-Error-Code' => 'KYC_REQUIRED'],
            );
        }

        return $store;
    }

    public static function isPublicProductStatus(?string $status): bool
    {
        return in_array($status, ['active', 'published', 'submitted', 'under_review'], true);
    }
}
