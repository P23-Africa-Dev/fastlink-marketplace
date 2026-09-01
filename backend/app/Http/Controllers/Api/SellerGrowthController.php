<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GrowthInsightService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerGrowthController extends Controller
{
    public function show(Request $request, GrowthInsightService $growth): JsonResponse
    {
        return ApiResponse::success($growth->forSeller($request->user()));
    }
}
