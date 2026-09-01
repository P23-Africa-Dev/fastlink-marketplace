<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Review;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
{
    protected $model = Review::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $product = Product::factory()->create();

        return [
            'product_id' => $product->id,
            'store_id' => $product->store_id,
            'buyer_id' => User::factory(),
            'rating' => fake()->numberBetween(4, 5),
            'body' => fake()->sentence(),
            'status' => 'approved',
        ];
    }
}
