<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category')->active();

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
        $product->load('category');
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
}
