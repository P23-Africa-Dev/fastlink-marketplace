<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    /**
     * Marketplace API health check.
     */
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Fastlink Marketplace API is running.',
            'data' => [
                'status' => 'ok',
                'service' => config('app.name'),
                'environment' => app()->environment(),
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }
}
