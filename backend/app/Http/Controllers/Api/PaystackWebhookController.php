<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentService;
use App\Services\PaystackService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaystackWebhookController extends Controller
{
    public function __invoke(Request $request, PaystackService $paystack, PaymentService $payments): JsonResponse
    {
        $raw = $request->getContent();
        if (! $paystack->validSignature($raw, $request->header('x-paystack-signature'))) {
            return ApiResponse::error('Invalid signature.', 401);
        }

        $payload = $request->json()->all();
        if ($payload === []) {
            $payload = json_decode($raw, true) ?: [];
        }

        if (($payload['event'] ?? null) === 'charge.success') {
            $reference = (string) data_get($payload, 'data.reference', '');
            if ($reference !== '' && Payment::query()->where('reference', $reference)->exists()) {
                $payments->markPaidByReference($reference, $payload, 'paystack');
            }
        }

        return ApiResponse::success(['received' => true]);
    }
}
