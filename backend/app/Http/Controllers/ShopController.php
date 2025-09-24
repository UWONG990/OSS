<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ShopController extends Controller
{
    /**
     * Request to create a shop (for sellers)
     */
    public function requestShop(Request $request): JsonResponse
    {
        $user = Auth::user();

        // Check if user is a seller
        if (!$user || $user->user_type !== 'seller') {
            return response()->json([
                'message' => 'Only sellers can request to create a shop',
                'user_type' => $user ? $user->user_type : 'not authenticated'
            ], 403);
        }

        // Check if user already has a shop
        if ($user->shop) {
            return response()->json([
                'message' => 'You already have a shop request or an existing shop'
            ], 400);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:shops,name',
            'description' => 'required|string|max:1000',
        ]);

        $shop = Shop::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'owner_id' => $user->id,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Shop request submitted successfully',
            'shop' => $shop
        ], 201);
    }

    /**
     * Get all shop requests (for admin)
     */
    public function getShopRequests(): JsonResponse
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $shops = Shop::with('owner')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($shops);
    }

    /**
     * Get pending shop requests (for admin)
     */
    public function getPendingShopRequests(): JsonResponse
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $shops = Shop::with('owner')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($shops);
    }

    /**
     * Approve a shop request (for admin)
     */
    public function approveShop(Request $request, $shopId): JsonResponse
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $shop = Shop::findOrFail($shopId);

        if ($shop->status !== 'pending') {
            return response()->json([
                'message' => 'Shop is not in pending status'
            ], 400);
        }

        $shop->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Shop approved successfully',
            'shop' => $shop->load('owner')
        ]);
    }

    /**
     * Reject a shop request (for admin)
     */
    public function rejectShop(Request $request, $shopId): JsonResponse
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $shop = Shop::findOrFail($shopId);

        if ($shop->status !== 'pending') {
            return response()->json([
                'message' => 'Shop is not in pending status'
            ], 400);
        }

        // Delete the shop request instead of just rejecting
        $shop->delete();

        return response()->json([
            'message' => 'Shop request rejected and removed'
        ]);
    }

    /**
     * Get current user's shop
     */
    public function getMyShop(): JsonResponse
    {
        $user = Auth::user();
        $shop = $user->shop;

        if (!$shop) {
            return response()->json([
                'message' => 'No shop found'
            ], 404);
        }

        return response()->json($shop);
    }

    /**
     * Update shop details (for shop owners)
     */
    public function updateShop(Request $request): JsonResponse
    {
        $user = Auth::user();
        $shop = $user->shop;

        if (!$shop) {
            return response()->json([
                'message' => 'No shop found'
            ], 404);
        }

        if ($shop->status !== 'approved') {
            return response()->json([
                'message' => 'Can only update approved shops'
            ], 400);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:shops,name,' . $shop->id,
            'description' => 'sometimes|string|max:1000',
        ]);

        $shop->update($validated);

        return response()->json([
            'message' => 'Shop updated successfully',
            'shop' => $shop
        ]);
    }
}