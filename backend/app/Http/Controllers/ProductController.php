<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'shop.owner'])->active();

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('description', 'ILIKE', "%{$search}%")
                  ->orWhere('sku', 'ILIKE', "%{$search}%");
            });
        }

        // Category filter
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        // Price range filter
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Featured products
        if ($request->has('featured') && $request->featured) {
            $query->featured();
        }

        // In stock filter
        if ($request->has('in_stock') && $request->in_stock) {
            $query->inStock();
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        
        $allowedSorts = ['name', 'price', 'created_at'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $perPage = $request->get('per_page', 12);
        $perPage = min($perPage, 50); // Limit max items per page to 50
        
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    public function show(Product $product)
    {
        $product->load(['category', 'shop.owner']);
        return response()->json($product);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'sku' => 'required|string|unique:products',
            'category_id' => 'required|exists:categories,id',
            'images' => 'nullable|array',
            'is_featured' => 'boolean',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
        ]);

        $product = Product::create([
            'name' => $request->name,
            'description' => $request->description,
            'slug' => Str::slug($request->name),
            'price' => $request->price,
            'quantity' => $request->quantity,
            'sku' => $request->sku,
            'category_id' => $request->category_id,
            'images' => $request->images,
            'is_featured' => $request->is_featured ?? false,
            'weight' => $request->weight,
            'dimensions' => $request->dimensions,
        ]);

        $product->load('category');

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product
        ], 201);
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'quantity' => 'sometimes|required|integer|min:0',
            'sku' => 'sometimes|required|string|unique:products,sku,' . $product->id,
            'category_id' => 'sometimes|required|exists:categories,id',
            'images' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
        ]);

        $updateData = $request->only([
            'name', 'description', 'price', 'quantity', 'sku', 
            'category_id', 'images', 'is_active', 'is_featured',
            'weight', 'dimensions'
        ]);

        if (isset($updateData['name'])) {
            $updateData['slug'] = Str::slug($updateData['name']);
        }

        $product->update($updateData);
        $product->load('category');

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product
        ]);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }

    // Seller-specific methods

    /**
     * Get products for the authenticated seller's shop
     */
    public function sellerProducts(Request $request)
    {
        $user = $request->user();
        $shop = $user->shop;

        $products = Product::with('category')
            ->where('shop_id', $shop->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($products);
    }

    /**
     * Store a new product for the authenticated seller's shop
     */
    public function sellerStore(Request $request)
    {
        $user = $request->user();
        $shop = $user->shop;

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max per image
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
        ]);

        // Generate unique SKU
        $sku = 'SHOP' . $shop->id . '-' . strtoupper(Str::random(8));

        // Handle image uploads
        $imageUrls = [];
        
        // Handle both array format (images[0], images[1]) and simple array (images)
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                if ($index >= 5) break; // Limit to 5 images
                
                // Create a unique filename
                $filename = $sku . '_' . time() . '_' . uniqid() . '_' . $index . '.' . $image->getClientOriginalExtension();
                
                // Store in public/storage/products directory
                $path = $image->storeAs('products', $filename, 'public');
                
                if ($path) {
                    // Create the full URL
                    $imageUrls[] = asset('storage/' . $path);
                }
            }
        }

        $product = Product::create([
            'name' => $request->name,
            'description' => $request->description,
            'slug' => Str::slug($request->name . '-' . $sku),
            'price' => $request->price,
            'quantity' => $request->quantity,
            'sku' => $sku,
            'category_id' => $request->category_id,
            'shop_id' => $shop->id,
            'images' => $imageUrls,
            'is_active' => true,
            'is_featured' => false,
            'weight' => $request->weight,
            'dimensions' => $request->dimensions,
        ]);

        $product->load(['category', 'shop']);

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product
        ], 201);
    }

    /**
     * Update a product for the authenticated seller's shop
     */
    public function sellerUpdate(Request $request, Product $product)
    {
        $user = $request->user();
        $shop = $user->shop;

        // Ensure the product belongs to the seller's shop
        if ($product->shop_id !== $shop->id) {
            return response()->json([
                'message' => 'You can only update your own products'
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'quantity' => 'sometimes|required|integer|min:0',
            'category_id' => 'sometimes|required|exists:categories,id',
            'images' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
        ]);

        $updateData = $request->only([
            'name', 'description', 'price', 'quantity', 
            'category_id', 'images', 'is_active', 'is_featured',
            'weight', 'dimensions'
        ]);

        if (isset($updateData['name'])) {
            $updateData['slug'] = Str::slug($updateData['name'] . '-' . $product->sku);
        }

        $product->update($updateData);
        $product->load(['category', 'shop']);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product
        ]);
    }

    /**
     * Delete a product for the authenticated seller's shop
     */
    public function sellerDestroy(Request $request, Product $product)
    {
        $user = $request->user();
        $shop = $user->shop;

        // Ensure the product belongs to the seller's shop
        if ($product->shop_id !== $shop->id) {
            return response()->json([
                'message' => 'You can only delete your own products'
            ], 403);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }
}
