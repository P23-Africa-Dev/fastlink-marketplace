<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RecommendationService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    public function index(Request $request, RecommendationService $recommendations): JsonResponse
    {
        $limit = min(16, max(4, (int) $request->query('limit', 8)));

        return ApiResponse::success(
            $recommendations->forUser(auth('sanctum')->user(), $limit)
        );
    }
}
