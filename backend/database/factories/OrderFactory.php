<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = 100;
        $tax = 9;
        $shipping = 9.99;

        return [
            'reference' => 'FLK-'.strtoupper(Str::random(8)),
            'group_id' => (string) Str::uuid(),
            'buyer_id' => User::factory(),
            'store_id' => Store::factory(),
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'demo',
            'delivery_method' => 'standard',
            'tracking_number' => 'FL-TRK-'.fake()->unique()->numerify('######'),
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'tax' => $tax,
            'total' => $subtotal + $shipping + $tax,
            'buyer_email' => fake()->safeEmail(),
            'buyer_name' => fake()->name(),
            'shipping_street' => '15 Zoo Road',
            'shipping_city' => 'Kano',
            'shipping_state' => 'Kano',
            'shipping_postal_code' => '700213',
            'shipping_country' => 'Nigeria',
        ];
    }
}
