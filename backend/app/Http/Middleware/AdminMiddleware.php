<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            Log::info('AdminMiddleware: No user found');
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        if (!$request->user()->isAdmin()) {
            Log::info('AdminMiddleware: User is not admin', ['user' => $request->user()]);
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        return $next($request);
    }
}
