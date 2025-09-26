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
            'name' => 'Budi Santoso',
            'username' => 'budisantoso',
            'email' => 'seller1@oss.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'user_type' => 'seller',
        ]);

        $seller2 = User::factory()->create([
            'name' => 'Sari Dewi',
            'username' => 'saridewi',
            'email' => 'seller2@oss.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'user_type' => 'seller',
        ]);

        $seller3 = User::factory()->create([
            'name' => 'Ahmad Wijaya',
            'username' => 'ahmadwijaya',
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

        // Create medical shops for sellers
        $apotek = Shop::create([
            'name' => 'Apotek Sehat Bersama',
            'description' => 'Apotek terpercaya dengan obat-obatan berkualitas dan pelayanan terbaik',
            'owner_id' => $seller1->id,
            'status' => 'approved',
        ]);

        $medicalEquipment = Shop::create([
            'name' => 'Toko Alkes Medika',
            'description' => 'Pusat alat kesehatan dan perlengkapan medis terlengkap',
            'owner_id' => $seller2->id,
            'status' => 'approved',
        ]);

        $klinikSupply = Shop::create([
            'name' => 'Supplier Klinik Indonesia',
            'description' => 'Menyediakan kebutuhan klinik dan rumah sakit dengan kualitas terjamin',
            'owner_id' => $seller3->id,
            'status' => 'approved',
        ]);

        // Create the test shop (approved)
        $testShop = Shop::create([
            'name' => 'Apotek Keluarga Sehat',
            'description' => 'Apotek terpercaya dengan layanan konsultasi gratis dan pengiriman cepat',
            'owner_id' => $testSeller->id,
            'status' => 'approved',
        ]);

        // Create medical categories
        $obatObatan = Category::create([
            'name' => 'Obat-obatan',
            'description' => 'Berbagai jenis obat dan suplemen kesehatan',
            'slug' => 'obat-obatan',
            'is_active' => true,
        ]);

        $alatKesehatan = Category::create([
            'name' => 'Alat Kesehatan',
            'description' => 'Peralatan medis dan alat kesehatan',
            'slug' => 'alat-kesehatan',
            'is_active' => true,
        ]);

        $vitaminSuplemen = Category::create([
            'name' => 'Vitamin & Suplemen',
            'description' => 'Vitamin, suplemen, dan nutrisi tambahan',
            'slug' => 'vitamin-suplemen',
            'is_active' => true,
        ]);

        // Create products for Apotek Sehat Bersama
        Product::create([
            'name' => 'Paracetamol 500mg',
            'description' => 'Obat pereda nyeri dan penurun demam yang aman dan efektif',
            'slug' => 'paracetamol-500mg',
            'price' => 15000,
            'quantity' => 200,
            'sku' => 'SHOP' . $apotek->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $obatObatan->id,
            'shop_id' => $apotek->id,
            'is_active' => true,
            'is_featured' => true,
            'images' => [
                'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
                'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500'
            ],
        ]);

        Product::create([
            'name' => 'Amoxicillin 500mg',
            'description' => 'Antibiotik untuk pengobatan infeksi bakteri berbagai jenis',
            'slug' => 'amoxicillin-500mg',
            'price' => 35000,
            'quantity' => 150,
            'sku' => 'SHOP' . $apotek->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $obatObatan->id,
            'shop_id' => $apotek->id,
            'is_active' => true,
            'is_featured' => true,
            'images' => [
                'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500',
                'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500'
            ],
        ]);

        Product::create([
            'name' => 'Omeprazole 20mg',
            'description' => 'Obat untuk mengatasi masalah lambung dan asam lambung berlebih',
            'slug' => 'omeprazole-20mg',
            'price' => 45000,
            'quantity' => 120,
            'sku' => 'SHOP' . $apotek->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $obatObatan->id,
            'shop_id' => $apotek->id,
            'is_active' => true,
            'is_featured' => false,
            'images' => [
                'https://images.unsplash.com/photo-1550572017-edd951b55104?w=500',
                'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=500'
            ],
        ]);

        // Create products for Toko Alkes Medika
        Product::create([
            'name' => 'Tensimeter Digital',
            'description' => 'Alat ukur tekanan darah digital dengan akurasi tinggi dan mudah digunakan',
            'slug' => 'tensimeter-digital',
            'price' => 450000,
            'quantity' => 50,
            'sku' => 'SHOP' . $medicalEquipment->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $alatKesehatan->id,
            'shop_id' => $medicalEquipment->id,
            'is_active' => true,
            'is_featured' => true,
            'images' => [
                'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500',
                'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500'
            ],
        ]);

        Product::create([
            'name' => 'Termometer Digital',
            'description' => 'Termometer digital infrared non-kontak untuk mengukur suhu tubuh dengan cepat',
            'slug' => 'termometer-digital',
            'price' => 125000,
            'quantity' => 75,
            'sku' => 'SHOP' . $medicalEquipment->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $alatKesehatan->id,
            'shop_id' => $medicalEquipment->id,
            'is_active' => true,
            'is_featured' => false,
            'images' => [
                'https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=500',
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'
            ],
        ]);

        // Create products for Supplier Klinik Indonesia
        Product::create([
            'name' => 'Vitamin C 1000mg',
            'description' => 'Suplemen vitamin C dosis tinggi untuk meningkatkan daya tahan tubuh',
            'slug' => 'vitamin-c-1000mg',
            'price' => 85000,
            'quantity' => 100,
            'sku' => 'SHOP' . $klinikSupply->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $vitaminSuplemen->id,
            'shop_id' => $klinikSupply->id,
            'is_active' => true,
            'is_featured' => true,
            'images' => [
                'https://images.unsplash.com/photo-1550572017-edd951b55104?w=500',
                'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=500'
            ],
        ]);

        Product::create([
            'name' => 'Omega 3 Fish Oil',
            'description' => 'Suplemen minyak ikan omega 3 untuk kesehatan jantung dan otak',
            'slug' => 'omega-3-fish-oil',
            'price' => 165000,
            'quantity' => 80,
            'sku' => 'SHOP' . $klinikSupply->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $vitaminSuplemen->id,
            'shop_id' => $klinikSupply->id,
            'is_active' => true,
            'is_featured' => false,
            'images' => [
                'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
                'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500'
            ],
        ]);

        // Create some products for the test shop
        Product::create([
            'name' => 'Masker Medis 3 Ply',
            'description' => 'Masker medis sekali pakai 3 lapis dengan perlindungan optimal',
            'slug' => 'masker-medis-3-ply',
            'price' => 75000,
            'quantity' => 500,
            'sku' => 'SHOP' . $testShop->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'category_id' => $alatKesehatan->id,
            'shop_id' => $testShop->id,
            'is_active' => true,
            'is_featured' => true,
            'images' => [
                'https://images.unsplash.com/photo-1584433144859-68cf7613bfcd?w=500',
                'https://images.unsplash.com/photo-1605289355680-75fb41239154?w=500'
            ],
        ]);

        // Create additional medical products
        $shops = [$apotek, $medicalEquipment, $klinikSupply, $testShop];
        $categories = [$obatObatan, $alatKesehatan, $vitaminSuplemen];

        // Additional specific medical products
        $medicalProducts = [
            [
                'name' => 'Betadine Solution 60ml',
                'description' => 'Antiseptik untuk luka luar dan pembersihan kulit',
                'price' => 25000,
                'category_id' => $obatObatan->id,
                'images' => ['https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=500']
            ],
            [
                'name' => 'Stetoskop Littmann',
                'description' => 'Stetoskop berkualitas tinggi untuk pemeriksaan medis',
                'price' => 1250000,
                'category_id' => $alatKesehatan->id,
                'images' => ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500']
            ],
            [
                'name' => 'Kalsium + D3 Tablet',
                'description' => 'Suplemen kalsium dengan vitamin D3 untuk kesehatan tulang',
                'price' => 95000,
                'category_id' => $vitaminSuplemen->id,
                'images' => ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500']
            ],
            [
                'name' => 'Hand Sanitizer 500ml',
                'description' => 'Pembersih tangan berbasis alkohol 70% untuk perlindungan dari kuman',
                'price' => 35000,
                'category_id' => $alatKesehatan->id,
                'images' => ['https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=500']
            ],
            [
                'name' => 'Multivitamin Complete',
                'description' => 'Multivitamin lengkap untuk memenuhi kebutuhan nutrisi harian',
                'price' => 145000,
                'category_id' => $vitaminSuplemen->id,
                'images' => ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=500']
            ]
        ];

        foreach ($medicalProducts as $index => $productData) {
            $shop = $shops[$index % count($shops)];
            Product::create([
                'name' => $productData['name'],
                'description' => $productData['description'],
                'slug' => \Illuminate\Support\Str::slug($productData['name']),
                'price' => $productData['price'],
                'quantity' => rand(20, 200),
                'sku' => 'SHOP' . $shop->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
                'category_id' => $productData['category_id'],
                'shop_id' => $shop->id,
                'is_active' => true,
                'is_featured' => rand(0, 1),
                'images' => $productData['images'],
            ]);
        }
        
        // Create additional random medical products
        for ($i = 0; $i < 10; $i++) {
            $shop = $shops[array_rand($shops)];
            $category = $categories[array_rand($categories)];
            
            Product::factory()->create([
                'shop_id' => $shop->id,
                'category_id' => $category->id,
                'sku' => 'SHOP' . $shop->id . '-' . strtoupper(\Illuminate\Support\Str::random(8)),
                'price' => rand(15000, 500000), // Rupiah prices
            ]);
        }
    }
}
