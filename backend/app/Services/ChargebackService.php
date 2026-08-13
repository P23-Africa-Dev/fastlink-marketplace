<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Chargeback;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ChargebackService
{
    public function __construct(private LedgerService $ledger) {}

    public function record(
        User $admin,
        Payment $payment,
        float $amount,
        string $reason,
        ?string $providerReference = null,
    ): Chargeback {
        if (! in_array($payment->status, ['paid', 'partially_refunded'], true)) {
            throw ValidationException::withMessages([
                'payment' => 'Chargebacks can only be recorded against captured payments.',
            ]);
        }

        $paymentAmount = (float) $payment->amount;
        if ($amount <= 0 || $amount > $paymentAmount) {
            throw ValidationException::withMessages([
                'amount' => "Amount must be between 0.01 and {$paymentAmount}.",
            ]);
        }

        return DB::transaction(function () use ($admin, $payment, $amount, $reason, $providerReference, $paymentAmount) {
            $chargeback = Chargeback::query()->create([
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
                'store_id' => $payment->store_id,
                'amount' => $amount,
                'provider_reference' => $providerReference,
                'reason' => $reason,
                'status' => 'open',
                'recorded_by' => $admin->id,
            ]);

            $this->ledger->recordChargeback($payment, $amount, (int) $chargeback->id);

            $isFull = $amount >= $paymentAmount - 0.01;
            $payment->update(['status' => $isFull ? 'chargeback' : 'partially_refunded']);
            $payment->order?->update([
                'payment_status' => $isFull ? 'chargeback' : 'partially_refunded',
            ]);

            AuditLog::record($admin, 'chargeback.recorded', $chargeback, [
                'payment_id' => $payment->id,
                'amount' => $amount,
            ]);

            return $chargeback->fresh(['order', 'store', 'payment']);
        });
    }

    public function resolve(User $admin, Chargeback $chargeback, string $status, ?string $note = null): Chargeback
    {
        if (! in_array($status, ['won', 'lost'], true)) {
            throw ValidationException::withMessages(['status' => 'Status must be won or lost.']);
        }

        if ($chargeback->status !== 'open') {
            throw ValidationException::withMessages(['status' => 'Chargeback is already resolved.']);
        }

        $chargeback->update([
            'status' => $status,
            'admin_note' => $note,
            'resolved_by' => $admin->id,
            'resolved_at' => now(),
        ]);

        AuditLog::record($admin, 'chargeback.resolved', $chargeback, ['status' => $status]);

        return $chargeback->fresh(['order', 'store', 'payment']);
    }
}
