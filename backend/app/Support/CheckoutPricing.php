<?php

namespace App\Support;

class CheckoutPricing
{
    public const TAX_RATE = 0.09;

    public const FREE_SHIPPING_THRESHOLD = 150;

    public const SHIPPING_COST = 9.99;

    /**
     * @return array{subtotal: float, shipping: float, tax: float, total: float}
     */
    public static function totals(float $subtotal): array
    {
        $shipping = $subtotal >= self::FREE_SHIPPING_THRESHOLD || $subtotal <= 0
            ? 0.0
            : self::SHIPPING_COST;
        $tax = round($subtotal * self::TAX_RATE, 2);
        $total = round($subtotal + $shipping + $tax, 2);

        return [
            'subtotal' => round($subtotal, 2),
            'shipping' => $shipping,
            'tax' => $tax,
            'total' => $total,
        ];
    }
}
