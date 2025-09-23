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
            'images' => [
                'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
                'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
            ],
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
            'images' => [
                'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500',
                'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500'
            ],
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
            'images' => [
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
                'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'
            ],
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
            'images' => [
                'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
                'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500'
            ],
        ]);

        // Create more products using factories
        Product::factory(20)->create();
    }
}
