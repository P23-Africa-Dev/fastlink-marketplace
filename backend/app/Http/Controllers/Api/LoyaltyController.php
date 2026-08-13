<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LoyaltyService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    public function me(Request $request, LoyaltyService $loyalty): JsonResponse
    {
        return ApiResponse::success($loyalty->summary($request->user()));
    }
}
