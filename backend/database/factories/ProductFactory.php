<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Store;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'store_id' => Store::factory(),
            'name' => Str::title($name),
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('###'),
            'sku' => strtoupper(fake()->unique()->bothify('FL-####??')),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 10, 5000),
            'stock' => fake()->numberBetween(0, 40),
            'status' => 'active',
            'is_featured' => false,
            'is_new' => true,
            'is_bestseller' => false,
            'rating' => fake()->randomFloat(1, 3, 5),
            'review_count' => fake()->numberBetween(0, 200),
            'tags' => ['demo'],
        ];
    }
}
