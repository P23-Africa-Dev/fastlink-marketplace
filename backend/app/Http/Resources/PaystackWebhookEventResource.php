<?php

namespace App\Http\Resources;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\PaystackWebhookEvent */
class PaystackWebhookEventResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $matchedPayments = 0;
        $paidPayments = 0;
        if ($this->reference) {
            $paymentQuery = Payment::query()->where('reference', $this->reference);
            $matchedPayments = (clone $paymentQuery)->count();
            $paidPayments = (clone $paymentQuery)->where('status', 'paid')->count();
        }

        return [
            'id' => (string) $this->id,
            'event' => $this->event,
            'reference' => $this->reference,
            'status' => $this->status,
            'error' => $this->error,
            'matchedPayments' => $matchedPayments,
            'paidPayments' => $paidPayments,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
