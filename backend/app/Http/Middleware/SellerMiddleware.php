<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SellerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user || !$user->isSeller()) {
            return response()->json([
                'message' => 'Unauthorized. Seller access required.'
            ], 403);
        }

        // Check if seller has an approved shop
        if (!$user->hasApprovedShop()) {
            return response()->json([
                'message' => 'You need an approved shop to access this feature.'
            ], 403);
        }

        return $next($request);
    }
}