<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class PaystackService
{
    public function isConfigured(): bool
    {
        return filled(config('services.paystack.secret'));
    }

    /**
     * @return array{authorization_url: string, access_code: string|null, reference: string}
     */
    public function initialize(string $email, int $amountKobo, string $reference, string $callbackUrl): array
    {
        if (! $this->isConfigured()) {
            $frontend = rtrim((string) config('app.frontend_url'), '/');

            return [
                'authorization_url' => $frontend.'/checkout/callback?reference='.urlencode($reference).'&demo=1',
                'access_code' => 'demo',
                'reference' => $reference,
            ];
        }

        $response = Http::withToken((string) config('services.paystack.secret'))
            ->acceptJson()
            ->post('https://api.paystack.co/transaction/initialize', [
                'email' => $email,
                'amount' => $amountKobo,
                'reference' => $reference,
                'callback_url' => $callbackUrl,
                'currency' => 'NGN',
            ]);

        if (! $response->successful() || ! $response->json('status')) {
            abort(502, $response->json('message') ?: 'Unable to start payment.');
        }

        return [
            'authorization_url' => (string) $response->json('data.authorization_url'),
            'access_code' => $response->json('data.access_code'),
            'reference' => (string) ($response->json('data.reference') ?: $reference),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function verify(string $reference): array
    {
        if (! $this->isConfigured()) {
            return [
                'status' => 'success',
                'reference' => $reference,
                'mode' => 'demo',
            ];
        }

        $response = Http::withToken((string) config('services.paystack.secret'))
            ->acceptJson()
            ->get('https://api.paystack.co/transaction/verify/'.$reference);

        if (! $response->successful() || ! $response->json('status')) {
            abort(502, $response->json('message') ?: 'Unable to verify payment.');
        }

        return $response->json('data') ?? [];
    }

    public function validSignature(string $payload, ?string $signature): bool
    {
        $secret = (string) config('services.paystack.secret');

        if ($secret === '' || ! $signature) {
            return false;
        }

        return hash_equals(hash_hmac('sha512', $payload, $secret), $signature);
    }
}
