<?php

namespace App\Services;

use App\Models\LedgerEntry;
use App\Models\Payment;
use App\Models\Payout;

class LedgerService
{
    /**
     * @param  array<string, mixed>  $meta
     */
    public function record(
        string $idempotencyKey,
        string $type,
        string $direction,
        float $amount,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?int $storeId = null,
        ?int $orderId = null,
        array $meta = [],
    ): ?LedgerEntry {
        if (LedgerEntry::query()->where('idempotency_key', $idempotencyKey)->exists()) {
            return null;
        }

        return LedgerEntry::query()->create([
            'idempotency_key' => $idempotencyKey,
            'type' => $type,
            'direction' => $direction,
            'amount' => round($amount, 2),
            'currency' => 'NGN',
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'store_id' => $storeId,
            'order_id' => $orderId,
            'meta' => $meta ?: null,
            'created_at' => now(),
        ]);
    }

    public function recordPaymentCaptured(Payment $payment): void
    {
        if ($payment->status !== 'paid') {
            return;
        }

        $storeId = (int) $payment->store_id;
        $orderId = (int) $payment->order_id;
        $paymentId = (int) $payment->id;
        $amount = (float) $payment->amount;
        $fees = (float) $payment->fees;
        $net = (float) $payment->net;

        $this->record(
            "payment:{$paymentId}:gross",
            'order_payment',
            'credit',
            $amount,
            'payment',
            $paymentId,
            $storeId,
            $orderId,
            ['reference' => $payment->reference],
        );

        if ($fees > 0) {
            $this->record(
                "payment:{$paymentId}:fee",
                'platform_fee',
                'credit',
                $fees,
                'payment',
                $paymentId,
                $storeId,
                $orderId,
            );
        }

        if ($net > 0) {
            $this->record(
                "payment:{$paymentId}:net",
                'seller_earnings',
                'credit',
                $net,
                'payment',
                $paymentId,
                $storeId,
                $orderId,
            );
        }
    }

    public function recordRefund(Payment $payment, ?int $returnId = null): void
    {
        $paymentId = (int) $payment->id;
        $storeId = (int) $payment->store_id;
        $orderId = (int) $payment->order_id;
        $amount = (float) $payment->amount;
        $fees = (float) $payment->fees;
        $net = (float) $payment->net;
        $suffix = $returnId ? ":return:{$returnId}" : '';

        $this->record(
            "refund:{$paymentId}{$suffix}:gross",
            'order_refund',
            'debit',
            $amount,
            'payment',
            $paymentId,
            $storeId,
            $orderId,
            ['returnId' => $returnId],
        );

        if ($fees > 0) {
            $this->record(
                "refund:{$paymentId}{$suffix}:fee",
                'platform_fee_reversal',
                'debit',
                $fees,
                'payment',
                $paymentId,
                $storeId,
                $orderId,
            );
        }

        if ($net > 0) {
            $this->record(
                "refund:{$paymentId}{$suffix}:net",
                'seller_earnings_reversal',
                'debit',
                $net,
                'payment',
                $paymentId,
                $storeId,
                $orderId,
            );
        }
    }

    public function recordPayoutApproved(Payout $payout): void
    {
        $this->record(
            "payout:{$payout->id}:disbursed",
            'payout_disbursement',
            'debit',
            (float) $payout->amount,
            'payout',
            (int) $payout->id,
            (int) $payout->store_id,
            null,
            ['providerReference' => $payout->provider_reference],
        );
    }
}
