<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ShopController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/categories/{category}/products', [CategoryController::class, 'products']);

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Cart routes
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{cartItem}', [CartController::class, 'update']);
    Route::delete('/cart/{cartItem}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);
    
    // Order routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    
    // Shop routes
    Route::post('/shop/request', [ShopController::class, 'requestShop']);
    Route::get('/shop/my-shop', [ShopController::class, 'getMyShop']);
    Route::put('/shop/update', [ShopController::class, 'updateShop']);
    
    // Admin routes
    Route::middleware('admin')->group(function () {
        // Product management
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        
        // Category management
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
        
        // Order management
        Route::put('/orders/{order}', [OrderController::class, 'update']);
        Route::get('/admin/orders', [OrderController::class, 'adminIndex']);
        Route::get('/admin/dashboard', [OrderController::class, 'dashboard']);
        
        // Shop management (Admin only)
        Route::get('/admin/shop-requests', [ShopController::class, 'getShopRequests']);
        Route::get('/admin/shop-requests/pending', [ShopController::class, 'getPendingShopRequests']);
        Route::post('/admin/shops/{shop}/approve', [ShopController::class, 'approveShop']);
        Route::delete('/admin/shops/{shop}/reject', [ShopController::class, 'rejectShop']);
    });
});