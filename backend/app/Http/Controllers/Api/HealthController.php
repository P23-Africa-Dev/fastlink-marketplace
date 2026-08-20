<?php

namespace App\Http\Controllers\Api;

use App\Models\PaystackWebhookEvent;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    /**
     * Marketplace API health check.
     */
    public function __invoke(): JsonResponse
    {
        $databaseOk = true;
        try {
            DB::select('select 1 as ok');
        } catch (\Throwable) {
            $databaseOk = false;
        }
        $webhookFailures24h = 0;
        try {
            $webhookFailures24h = PaystackWebhookEvent::query()
                ->whereIn('status', ['failed', 'invalid_signature'])
                ->where('created_at', '>=', now()->subDay())
                ->count();
        } catch (\Throwable) {
            $webhookFailures24h = 0;
        }

        return response()->json([
            'success' => true,
            'message' => 'Fastlink Marketplace API is running.',
            'data' => [
                'status' => $databaseOk ? 'ok' : 'degraded',
                'service' => config('app.name'),
                'environment' => app()->environment(),
                'database' => $databaseOk ? 'ok' : 'error',
                'queue' => config('queue.default'),
                'webhookFailures24h' => $webhookFailures24h,
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }
}
