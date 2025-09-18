<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->sentence(2); // Generate a unique name first
        return [
            'name' => $name,
            'description' => $this->faker->paragraph,
            'slug' => \Illuminate\Support\Str::slug($name), // Generate slug from the unique name
            'is_active' => $this->faker->boolean(80),
        ];
    }
}
