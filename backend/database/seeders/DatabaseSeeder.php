<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@oss.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create regular users
        User::factory(10)->create();

        // Create categories
        $electronics = Category::create([
            'name' => 'Electronics',
            'description' => 'Electronic devices and accessories',
            'slug' => 'electronics',
            'is_active' => true,
        ]);

        $clothing = Category::create([
            'name' => 'Clothing',
            'description' => 'Apparel and fashion items',
            'slug' => 'clothing',
            'is_active' => true,
        ]);

        $books = Category::create([
            'name' => 'Books',
            'description' => 'Books and literature',
            'slug' => 'books',
            'is_active' => true,
        ]);

        // Create products
        Product::create([
            'name' => 'iPhone 15 Pro',
            'description' => 'Latest Apple iPhone with advanced features',
            'slug' => 'iphone-15-pro',
            'price' => 999.99,
            'quantity' => 50,
            'sku' => 'IPH15PRO001',
            'category_id' => $electronics->id,
            'is_active' => true,
            'is_featured' => true,
        ]);

        Product::create([
            'name' => 'Samsung Galaxy S24',
            'description' => 'Premium Android smartphone',
            'slug' => 'samsung-galaxy-s24',
            'price' => 899.99,
            'quantity' => 30,
            'sku' => 'SAM24001',
            'category_id' => $electronics->id,
            'is_active' => true,
            'is_featured' => true,
        ]);

        Product::create([
            'name' => 'Nike Air Max',
            'description' => 'Comfortable running shoes',
            'slug' => 'nike-air-max',
            'price' => 129.99,
            'quantity' => 100,
            'sku' => 'NIKE001',
            'category_id' => $clothing->id,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'The Great Gatsby',
            'description' => 'Classic American novel by F. Scott Fitzgerald',
            'slug' => 'the-great-gatsby',
            'price' => 12.99,
            'quantity' => 200,
            'sku' => 'BOOK001',
            'category_id' => $books->id,
            'is_active' => true,
        ]);

        // Create more products using factories
        Product::factory(20)->create();
    }
}
