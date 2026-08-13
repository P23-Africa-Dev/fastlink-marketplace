<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ReturnRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReturnService
{
    public function __construct(
        private CheckoutService $checkout,
        private NotificationService $notifications,
    ) {}

    public function request(User $buyer, Order $order, string $reason): ReturnRequest
    {
        if ($order->buyer_id !== $buyer->id) {
            abort(403);
        }

        if ($order->payment_status !== 'paid') {
            throw ValidationException::withMessages([
                'order' => 'Only paid orders can be returned.',
            ]);
        }

        if (! in_array($order->status, ['confirmed', 'shipped', 'delivered'], true)) {
            throw ValidationException::withMessages([
                'order' => 'This order is not eligible for a return.',
            ]);
        }

        if (ReturnRequest::query()->where('order_id', $order->id)->exists()) {
            throw ValidationException::withMessages([
                'order' => 'A return has already been requested for this order.',
            ]);
        }

        $return = ReturnRequest::query()->create([
            'order_id' => $order->id,
            'buyer_id' => $buyer->id,
            'store_id' => $order->store_id,
            'reason' => $reason,
            'status' => 'pending',
        ]);

        $order->load('store.owner');
        if ($order->store?->owner) {
            $this->notifications->notify(
                $order->store->owner,
                'return.requested',
                'Return requested for '.$order->reference,
                $buyer->name.' requested a return: '.$reason,
                ['orderId' => (string) $order->id, 'returnId' => (string) $return->id],
            );
        }

        return $return;
    }

    public function approve(User $actor, ReturnRequest $return): ReturnRequest
    {
        if (! in_array($return->status, ['pending', 'approved'], true)) {
            throw ValidationException::withMessages(['status' => 'Return is already resolved.']);
        }

        return DB::transaction(function () use ($actor, $return) {
            $order = $return->order()->lockForUpdate()->firstOrFail();

            if ($order->status !== 'cancelled') {
                $this->checkout->restoreStock($order);
                $order->update(['status' => 'cancelled']);
                $order->addEvent('cancelled', 'Return approved. Order cancelled and stock restored.');
            }

            Payment::query()
                ->where('order_id', $order->id)
                ->where('status', 'paid')
                ->get()
                ->each(function (Payment $payment) use ($return) {
                    $payment->update(['status' => 'refunded']);
                    app(LedgerService::class)->recordRefund($payment->fresh(), (int) $return->id);
                });

            $order->update(['payment_status' => 'refunded']);

            $return->update([
                'status' => 'refunded',
                'refund_amount' => $order->total,
                'resolved_by' => $actor->id,
                'resolved_at' => now(),
            ]);

            AuditLog::record($actor, 'return.approved', $return, ['order_id' => $order->id]);

            $return->loadMissing('buyer');
            $this->notifications->notify(
                $return->buyer,
                'return.approved',
                'Return approved for '.$order->reference,
                'Your return was approved. A full refund of ₦'.number_format((float) $order->total, 2).' has been recorded.',
                ['orderId' => (string) $order->id, 'returnId' => (string) $return->id],
            );

            return $return->fresh(['order', 'store', 'buyer']);
        });
    }

    public function reject(User $actor, ReturnRequest $return, ?string $note = null): ReturnRequest
    {
        if ($return->status !== 'pending') {
            throw ValidationException::withMessages(['status' => 'Return is already resolved.']);
        }

        $return->update([
            'status' => 'rejected',
            'resolved_by' => $actor->id,
            'resolved_at' => now(),
        ]);

        AuditLog::record($actor, 'return.rejected', $return);

        $return->loadMissing('buyer');
        $order = $return->order;

        $this->notifications->notify(
            $return->buyer,
            'return.rejected',
            'Return declined for '.$order->reference,
            $note ?: 'Your return request was declined by the seller.',
            ['orderId' => (string) $order->id, 'returnId' => (string) $return->id],
        );

        return $return->fresh(['order', 'store', 'buyer']);
    }
}
