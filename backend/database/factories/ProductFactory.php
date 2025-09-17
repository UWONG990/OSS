<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(3, true);
        return [
            'name' => $name,
            'description' => $this->faker->paragraph(3),
            'slug' => \Illuminate\Support\Str::slug($name),
            'price' => $this->faker->randomFloat(2, 10, 1000),
            'quantity' => $this->faker->numberBetween(0, 100),
            'sku' => strtoupper($this->faker->bothify('???###')),
            'category_id' => \App\Models\Category::factory(),
            'is_active' => $this->faker->boolean(90),
            'is_featured' => $this->faker->boolean(20),
            'weight' => $this->faker->randomFloat(2, 0.1, 10),
            'dimensions' => $this->faker->randomFloat(1, 5, 50) . 'x' . $this->faker->randomFloat(1, 5, 50) . 'x' . $this->faker->randomFloat(1, 5, 50),
        ];
    }
}
