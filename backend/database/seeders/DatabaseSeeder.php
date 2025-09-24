<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
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
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@oss.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'user_type' => 'buyer', // Admin can have any user_type
        ]);

        // Create seller users
        $seller1 = User::factory()->create([
            'name' => 'John Smith',
            'username' => 'johnsmith',
            'email' => 'seller1@oss.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'user_type' => 'seller',
        ]);

        $seller2 = User::factory()->create([
            'name' => 'Jane Doe',
            'username' => 'janedoe',
            'email' => 'seller2@oss.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'user_type' => 'seller',
        ]);

        $seller3 = User::factory()->create([
            'name' => 'Mike Wilson',
            'username' => 'mikewilson',
            'email' => 'seller3@oss.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'user_type' => 'seller',
        ]);

        // Create test seller (the one from your database)
        $testSeller = User::factory()->create([
            'name' => 'tes',
            'username' => 'tes_generated_123',
            'email' => 'tes@test.com',
            'password' => Hash::make('123'),
            'role' => 'customer',
            'user_type' => 'seller',
        ]);

        // Create regular buyer users
        User::factory(5)->create([
            'role' => 'customer',
            'user_type' => 'buyer',
        ]);

        // Create shops for sellers
        $techStore = Shop::create([
            'name' => 'TechWorld',
            'description' => 'Your one-stop shop for the latest technology and electronics',
            'owner_id' => $seller1->id,
            'status' => 'approved',
        ]);

        $fashionStore = Shop::create([
            'name' => 'Fashion Hub',
            'description' => 'Trendy clothing and accessories for all occasions',
            'owner_id' => $seller2->id,
            'status' => 'approved',
        ]);

        $bookstore = Shop::create([
            'name' => 'Book Paradise',
            'description' => 'Discover amazing books and expand your knowledge',
            'owner_id' => $seller3->id,
            'status' => 'approved',
        ]);

        // Create the test shop (approved)
        $testShop = Shop::create([
            'name' => 'tes',
            'description' => 'A',
            'owner_id' => $testSeller->id,
            'status' => 'approved',
        ]);

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

        // Create products for TechWorld
        Product::create([
            'name' => 'iPhone 15 Pro',
            'description' => 'Latest Apple iPhone with advanced features',
            'slug' => 'iphone-15-pro',
            'price' => 999.99,
            'quantity' => 50,
            'sku' => 'SHOP' . $techStore->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $electronics->id,
            'shop_id' => $techStore->id,
            'is_active' => true,
            'is_featured' => true,
            'images' => [
                'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
                'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
            ],
        ]);

        Product::create([
            'name' => 'Samsung Galaxy S24',
            'description' => 'Premium Android smartphone with AI features',
            'slug' => 'samsung-galaxy-s24',
            'price' => 899.99,
            'quantity' => 30,
            'sku' => 'SHOP' . $techStore->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $electronics->id,
            'shop_id' => $techStore->id,
            'is_active' => true,
            'is_featured' => true,
            'images' => [
                'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500',
                'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500'
            ],
        ]);

        Product::create([
            'name' => 'MacBook Pro 14"',
            'description' => 'Powerful laptop for professionals and creators',
            'slug' => 'macbook-pro-14',
            'price' => 1999.99,
            'quantity' => 25,
            'sku' => 'SHOP' . $techStore->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $electronics->id,
            'shop_id' => $techStore->id,
            'is_active' => true,
            'is_featured' => false,
            'images' => [
                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'
            ],
        ]);

        // Create products for Fashion Hub
        Product::create([
            'name' => 'Nike Air Max 270',
            'description' => 'Comfortable running shoes with maximum air cushioning',
            'slug' => 'nike-air-max-270',
            'price' => 129.99,
            'quantity' => 100,
            'sku' => 'SHOP' . $fashionStore->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $clothing->id,
            'shop_id' => $fashionStore->id,
            'is_active' => true,
            'is_featured' => true,
            'images' => [
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
                'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'
            ],
        ]);

        Product::create([
            'name' => 'Adidas Ultraboost 22',
            'description' => 'Premium running shoes with energy return technology',
            'slug' => 'adidas-ultraboost-22',
            'price' => 149.99,
            'quantity' => 80,
            'sku' => 'SHOP' . $fashionStore->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $clothing->id,
            'shop_id' => $fashionStore->id,
            'is_active' => true,
            'is_featured' => false,
            'images' => [
                'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
                'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500'
            ],
        ]);

        // Create products for Book Paradise
        Product::create([
            'name' => 'The Great Gatsby',
            'description' => 'Classic American novel by F. Scott Fitzgerald',
            'slug' => 'the-great-gatsby',
            'price' => 12.99,
            'quantity' => 200,
            'sku' => 'SHOP' . $bookstore->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $books->id,
            'shop_id' => $bookstore->id,
            'is_active' => true,
            'is_featured' => true,
            'images' => [
                'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
                'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500'
            ],
        ]);

        Product::create([
            'name' => 'To Kill a Mockingbird',
            'description' => 'Timeless novel about justice and morality by Harper Lee',
            'slug' => 'to-kill-a-mockingbird',
            'price' => 14.99,
            'quantity' => 150,
            'sku' => 'SHOP' . $bookstore->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $books->id,
            'shop_id' => $bookstore->id,
            'is_active' => true,
            'is_featured' => false,
            'images' => [
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
                'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500'
            ],
        ]);

        // Create some products for the test shop
        Product::create([
            'name' => 'Wireless Headphones',
            'description' => 'High-quality wireless headphones with noise cancellation',
            'slug' => 'wireless-headphones',
            'price' => 199.99,
            'quantity' => 40,
            'sku' => 'SHOP' . $testShop->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $electronics->id,
            'shop_id' => $testShop->id,
            'is_active' => true,
            'is_featured' => true,
            'images' => [
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
                'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'
            ],
        ]);

        // Create additional random products with shops
        $shops = [$techStore, $fashionStore, $bookstore, $testShop];
        $categories = [$electronics, $clothing, $books];
        
        for ($i = 0; $i < 15; $i++) {
            $shop = $shops[array_rand($shops)];
            $category = $categories[array_rand($categories)];
            
            Product::factory()->create([
                'shop_id' => $shop->id,
                'category_id' => $category->id,
                'sku' => 'SHOP' . $shop->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            ]);
        }
    }
}
