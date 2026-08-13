<?php

namespace App\Support;

use App\Models\Store;
use App\Models\StoreStaff;
use App\Models\User;
use Illuminate\Support\Collection;

class SellerContext
{
    public const PERMISSIONS = ['inventory', 'orders', 'finance', 'support', 'manage'];

    /**
     * @var array<string, list<string>>
     */
    public const ROLE_PERMISSIONS = [
        'inventory' => ['inventory'],
        'orders' => ['orders'],
        'finance' => ['finance'],
        'support' => ['support'],
    ];

    /**
     * @return Collection<int, int|string>
     */
    public static function storeIds(User $user): Collection
    {
        $owned = $user->stores()->pluck('id');
        $staffed = StoreStaff::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->pluck('store_id');

        return $owned->merge($staffed)->unique()->values();
    }

    public static function storeOrFail(User $user): Store
    {
        $store = $user->store;
        if ($store) {
            return $store;
        }

        $staffed = Store::query()
            ->whereIn('id', self::storeIds($user))
            ->first();

        if (! $staffed) {
            abort(404, 'Store not found.');
        }

        return $staffed;
    }

    public static function isOwner(User $user, int|string|null $storeId = null): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($storeId === null) {
            return $user->stores()->exists();
        }

        return $user->stores()->where('id', $storeId)->exists();
    }

    /**
     * @return list<string>
     */
    public static function permissions(User $user): array
    {
        if ($user->role === 'admin' || $user->stores()->exists()) {
            return self::PERMISSIONS;
        }

        $roles = StoreStaff::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->pluck('role');

        if ($roles->isEmpty()) {
            return $user->role === 'seller' ? self::PERMISSIONS : [];
        }

        $permissions = [];
        foreach ($roles as $role) {
            foreach (self::ROLE_PERMISSIONS[$role] ?? [] as $permission) {
                $permissions[$permission] = true;
            }
        }

        return array_keys($permissions);
    }

    public static function can(User $user, string $permission): bool
    {
        if ($permission === 'any') {
            return in_array($user->role, ['seller', 'admin'], true);
        }

        $permissions = self::permissions($user);

        return in_array('manage', $permissions, true) || in_array($permission, $permissions, true);
    }

    public static function assertCan(User $user, string $permission): void
    {
        if (! self::can($user, $permission)) {
            abort(403, 'Forbidden.');
        }
    }

    /**
     * @return array{isOwner: bool, staffRole: string|null, permissions: list<string>}
     */
    public static function accessPayload(User $user): array
    {
        $staffRole = StoreStaff::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->value('role');

        $isOwner = $user->role === 'admin' || $user->stores()->exists();

        return [
            'isOwner' => $isOwner,
            'staffRole' => $isOwner ? 'owner' : ($staffRole ?: null),
            'permissions' => self::permissions($user),
        ];
    }
}
