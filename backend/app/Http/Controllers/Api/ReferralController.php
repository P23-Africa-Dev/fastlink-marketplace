<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReferralService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function me(Request $request, ReferralService $referrals): JsonResponse
    {
        return ApiResponse::success($referrals->summary($request->user()));
    }
}
