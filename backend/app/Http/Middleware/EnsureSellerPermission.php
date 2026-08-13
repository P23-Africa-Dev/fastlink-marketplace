<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use App\Support\SellerContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSellerPermission
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission = 'any'): Response
    {
        $user = $request->user();

        if (! $user || ! SellerContext::can($user, $permission)) {
            return ApiResponse::error('Forbidden.', 403);
        }

        return $next($request);
    }
}
