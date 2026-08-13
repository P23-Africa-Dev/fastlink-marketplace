<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\PaystackWebhookEvent;
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
        $signatureValid = $paystack->validSignature($raw, $request->header('x-paystack-signature'));

        if (! $signatureValid) {
            PaystackWebhookEvent::query()->create([
                'event' => null,
                'reference' => null,
                'status' => 'invalid_signature',
                'error' => 'Invalid x-paystack-signature header.',
                'payload' => null,
                'created_at' => now(),
            ]);

            return ApiResponse::error('Invalid signature.', 401);
        }

        $payload = $request->json()->all();
        if ($payload === []) {
            $payload = json_decode($raw, true) ?: [];
        }

        $event = (string) ($payload['event'] ?? '');
        $reference = (string) data_get($payload, 'data.reference', '');

        $existing = $reference !== ''
            ? PaystackWebhookEvent::query()
                ->where('reference', $reference)
                ->where('status', 'processed')
                ->exists()
            : false;

        if ($existing) {
            PaystackWebhookEvent::query()->create([
                'event' => $event,
                'reference' => $reference,
                'status' => 'duplicate',
                'payload' => $payload,
                'created_at' => now(),
            ]);

            return ApiResponse::success(['received' => true, 'duplicate' => true]);
        }

        try {
            if ($event === 'charge.success') {
                if ($reference === '' || ! Payment::query()->where('reference', $reference)->exists()) {
                    PaystackWebhookEvent::query()->create([
                        'event' => $event,
                        'reference' => $reference,
                        'status' => 'ignored',
                        'error' => 'Unknown payment reference.',
                        'payload' => $payload,
                        'created_at' => now(),
                    ]);
                } else {
                    $payments->markPaidByReference($reference, $payload, 'paystack');
                    PaystackWebhookEvent::query()->create([
                        'event' => $event,
                        'reference' => $reference,
                        'status' => 'processed',
                        'payload' => $payload,
                        'created_at' => now(),
                    ]);
                }
            } else {
                PaystackWebhookEvent::query()->create([
                    'event' => $event,
                    'reference' => $reference ?: null,
                    'status' => 'ignored',
                    'payload' => $payload,
                    'created_at' => now(),
                ]);
            }
        } catch (\Throwable $e) {
            PaystackWebhookEvent::query()->create([
                'event' => $event,
                'reference' => $reference ?: null,
                'status' => 'failed',
                'error' => $e->getMessage(),
                'payload' => $payload,
                'created_at' => now(),
            ]);

            throw $e;
        }

        return ApiResponse::success(['received' => true]);
    }
}
