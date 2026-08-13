<?php

namespace App\Services;

use App\Models\Product;
use App\Models\PromoCode;
use App\Models\PromoRedemption;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class PromotionService
{
    /**
     * @param  array<int, float>  $storeSubtotals  storeId => subtotal
     * @return array{promo: PromoCode, allocations: array<int, float>, totalDiscount: float}
     */
    public function quote(User $user, array $storeSubtotals, string $code): array
    {
        $promo = $this->findUsable($user, $code);
        $eligible = $this->eligibleSubtotals($storeSubtotals, $promo);
        $eligibleTotal = array_sum($eligible);

        if ($eligibleTotal <= 0) {
            throw ValidationException::withMessages([
                'coupon_code' => 'This code does not apply to items in your cart.',
            ]);
        }

        if ($eligibleTotal < (float) $promo->min_subtotal) {
            throw ValidationException::withMessages([
                'coupon_code' => 'Add more items to use this code (minimum ₦'.number_format((float) $promo->min_subtotal, 2).').',
            ]);
        }

        $discount = $this->compute($eligibleTotal, $promo);
        $allocations = $this->allocate($eligible, $discount);

        return [
            'promo' => $promo,
            'allocations' => $allocations,
            'totalDiscount' => round(array_sum($allocations), 2),
        ];
    }

    public function redeem(User $user, PromoCode $promo, float $amount, int $orderId): void
    {
        PromoRedemption::query()->create([
            'promo_code_id' => $promo->id,
            'user_id' => $user->id,
            'order_id' => $orderId,
            'amount' => round($amount, 2),
        ]);
        $promo->increment('used_count');
    }

    /**
     * @param  list<array{product_id: mixed, quantity: int}>  $items
     * @return array{code: string, discount: float, allocations: list<array{storeId: string, discount: float}>}
     */
    public function previewCart(User $user, array $items, string $code): array
    {
        $storeSubtotals = [];

        foreach ($items as $item) {
            $product = Product::query()->find($item['product_id']);
            if (! $product || ! Product::isPublicStatus($product->status)) {
                throw ValidationException::withMessages([
                    'items' => 'One or more products are unavailable.',
                ]);
            }

            $id = (int) $product->store_id;
            $storeSubtotals[$id] = ($storeSubtotals[$id] ?? 0) + ((float) $product->price) * (int) $item['quantity'];
        }

        $quoted = $this->quote($user, $storeSubtotals, $code);
        $allocations = [];
        foreach ($quoted['allocations'] as $storeId => $amount) {
            $allocations[] = [
                'storeId' => (string) $storeId,
                'discount' => round((float) $amount, 2),
            ];
        }

        return [
            'code' => $quoted['promo']->code,
            'discount' => $quoted['totalDiscount'],
            'allocations' => $allocations,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?int $storeId = null): PromoCode
    {
        $code = strtoupper(trim((string) $data['code']));
        $this->assertCodeAvailable($code);

        return PromoCode::query()->create([
            'store_id' => $storeId,
            'code' => $code,
            'type' => $data['type'],
            'value' => $data['value'],
            'min_subtotal' => $data['min_subtotal'] ?? 0,
            'max_discount' => $data['max_discount'] ?? null,
            'usage_limit' => $data['usage_limit'] ?? null,
            'used_count' => 0,
            'per_user_limit' => $data['per_user_limit'] ?? 1,
            'is_active' => $data['is_active'] ?? true,
            'starts_at' => $data['starts_at'] ?? now(),
            'ends_at' => $data['ends_at'] ?? null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(PromoCode $promo, array $data): PromoCode
    {
        if (isset($data['code'])) {
            $code = strtoupper(trim((string) $data['code']));
            $this->assertCodeAvailable($code, $promo->id);
            $data['code'] = $code;
        }

        $promo->update($data);

        return $promo->fresh();
    }

    public static function rules(bool $creating = true): array
    {
        $required = $creating ? 'required' : 'sometimes';

        return [
            'code' => [$required, 'string', 'max:40'],
            'type' => [$required, 'in:percent,fixed'],
            'value' => [$required, 'numeric', 'min:0'],
            'min_subtotal' => ['sometimes', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'per_user_limit' => ['sometimes', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'store_id' => ['nullable', 'integer', 'exists:stores,id'],
        ];
    }

    private function assertCodeAvailable(string $code, ?int $ignoreId = null): void
    {
        $exists = PromoCode::query()
            ->whereRaw('UPPER(code) = ?', [$code])
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages(['code' => 'This promo code is already in use.']);
        }
    }

    public function serialize(PromoCode $promo): array
    {
        return [
            'id' => (string) $promo->id,
            'code' => $promo->code,
            'type' => $promo->type,
            'value' => (float) $promo->value,
            'minSubtotal' => (float) $promo->min_subtotal,
            'maxDiscount' => $promo->max_discount !== null ? (float) $promo->max_discount : null,
            'usageLimit' => $promo->usage_limit,
            'usedCount' => (int) $promo->used_count,
            'perUserLimit' => (int) $promo->per_user_limit,
            'isActive' => (bool) $promo->is_active,
            'storeId' => $promo->store_id ? (string) $promo->store_id : null,
            'startsAt' => $promo->starts_at?->toIso8601String(),
            'endsAt' => $promo->ends_at?->toIso8601String(),
        ];
    }

    private function findUsable(User $user, string $code): PromoCode
    {
        $promo = PromoCode::query()
            ->whereRaw('UPPER(code) = ?', [strtoupper(trim($code))])
            ->first();

        if (! $promo || ! $promo->is_active) {
            throw ValidationException::withMessages(['coupon_code' => 'Invalid or expired promo code.']);
        }

        if ($promo->starts_at && $promo->starts_at->isFuture()) {
            throw ValidationException::withMessages(['coupon_code' => 'This promo code is not active yet.']);
        }

        if ($promo->ends_at && $promo->ends_at->isPast()) {
            throw ValidationException::withMessages(['coupon_code' => 'This promo code has expired.']);
        }

        if ($promo->usage_limit !== null && $promo->used_count >= $promo->usage_limit) {
            throw ValidationException::withMessages(['coupon_code' => 'This promo code has reached its usage limit.']);
        }

        $userUses = PromoRedemption::query()
            ->where('promo_code_id', $promo->id)
            ->where('user_id', $user->id)
            ->count();

        if ($userUses >= (int) $promo->per_user_limit) {
            throw ValidationException::withMessages(['coupon_code' => 'You have already used this promo code.']);
        }

        return $promo;
    }

    /**
     * @param  array<int, float>  $storeSubtotals
     * @return array<int, float>
     */
    private function eligibleSubtotals(array $storeSubtotals, PromoCode $promo): array
    {
        if ($promo->store_id) {
            $id = (int) $promo->store_id;

            return isset($storeSubtotals[$id]) ? [$id => $storeSubtotals[$id]] : [];
        }

        return $storeSubtotals;
    }

    private function compute(float $eligibleSubtotal, PromoCode $promo): float
    {
        $discount = $promo->type === 'percent'
            ? round($eligibleSubtotal * ((float) $promo->value) / 100, 2)
            : min((float) $promo->value, $eligibleSubtotal);

        if ($promo->max_discount !== null) {
            $discount = min($discount, (float) $promo->max_discount);
        }

        return max(0, round($discount, 2));
    }

    /**
     * @param  array<int, float>  $eligible
     * @return array<int, float>
     */
    private function allocate(array $eligible, float $discount): array
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
}
