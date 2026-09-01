<?php

namespace App\Services;

use App\Models\Dispute;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ReturnRequest;
use App\Models\Review;
use App\Models\Store;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DisputeService
{
    public function __construct(
        private NotificationService $notifications,
        private LedgerService $ledger,
    ) {}

    public function open(User $buyer, Order $order, string $reason, string $type = 'refund', ?string $evidence = null): Dispute
    {
        if ($order->buyer_id !== $buyer->id) {
            abort(403);
        }

        if ($order->payment_status !== 'paid') {
            throw ValidationException::withMessages(['order' => 'Only paid orders can be disputed.']);
        }

        if (Dispute::query()->where('order_id', $order->id)->exists()) {
            throw ValidationException::withMessages(['order' => 'A dispute already exists for this order.']);
        }

        if (ReturnRequest::query()->where('order_id', $order->id)->whereIn('status', ['pending', 'approved', 'refunded'])->exists()) {
            throw ValidationException::withMessages(['order' => 'Use returns for this order or wait until the return is closed.']);
        }

        $dispute = Dispute::query()->create([
            'order_id' => $order->id,
            'buyer_id' => $buyer->id,
            'store_id' => $order->store_id,
            'type' => $type,
            'reason' => $reason,
            'buyer_evidence' => $evidence,
            'status' => 'open',
        ]);

        $order->load('store.owner');
        if ($order->store?->owner) {
            $this->notifications->notify(
                $order->store->owner,
                'dispute.opened',
                'Dispute opened for '.$order->reference,
                $buyer->name.' opened a dispute: '.$reason,
                ['orderId' => (string) $order->id, 'disputeId' => (string) $dispute->id],
            );
        }

        return $dispute;
    }

    public function respond(User $seller, Dispute $dispute, string $response): Dispute
    {
        $storeIds = \App\Support\SellerContext::storeIds($seller);
        if (! $storeIds->contains($dispute->store_id)) {
            abort(403);
        }

        if (! in_array($dispute->status, ['open', 'seller_responded'], true)) {
            throw ValidationException::withMessages(['status' => 'Dispute is no longer open for seller response.']);
        }

        $dispute->update([
            'seller_response' => $response,
            'status' => 'seller_responded',
        ]);

        $dispute->loadMissing('buyer', 'order');
        $this->notifications->notify(
            $dispute->buyer,
            'dispute.seller_responded',
            'Seller responded to your dispute',
            'The seller replied regarding order '.$dispute->order->reference.'.',
            ['disputeId' => (string) $dispute->id],
        );

        return $dispute->fresh(['order', 'store', 'buyer']);
    }

    public function escalateToReview(User $actor, Dispute $dispute): Dispute
    {
        if ($dispute->status === 'under_review') {
            return $dispute;
        }

        $dispute->update(['status' => 'under_review']);

        return $dispute->fresh(['order', 'store', 'buyer']);
    }

    public function resolve(
        User $admin,
        Dispute $dispute,
        string $resolution,
        ?string $note = null,
        ?float $refundAmount = null,
    ): Dispute {
        if (! in_array($resolution, ['refund', 'replacement', 'rejected'], true)) {
            throw ValidationException::withMessages(['resolution' => 'Invalid resolution.']);
        }

        return DB::transaction(function () use ($admin, $dispute, $resolution, $note, $refundAmount) {
            $order = $dispute->order()->lockForUpdate()->firstOrFail();
            $status = match ($resolution) {
                'refund' => 'resolved_refund',
                'replacement' => 'resolved_replacement',
                'rejected' => 'resolved_rejected',
            };

            $amount = $refundAmount;
            if ($resolution === 'refund') {
                $amount = $amount ?? (float) $order->total;
                if ($amount <= 0 || $amount > (float) $order->total) {
                    throw ValidationException::withMessages([
                        'refund_amount' => 'Refund amount must be between 0.01 and the order total.',
                    ]);
                }

                $isFullRefund = $amount >= (float) $order->total - 0.01;

                Payment::query()
                    ->where('order_id', $order->id)
                    ->whereIn('status', ['paid', 'partially_refunded'])
                    ->get()
                    ->each(function (Payment $payment) use ($dispute, $amount) {
                        $payment->update(['status' => $amount >= (float) $payment->amount - 0.01 ? 'refunded' : 'partially_refunded']);
                        $this->ledger->recordRefund($payment->fresh(), (int) $dispute->id, $amount);
                    });

                $order->update([
                    'payment_status' => $isFullRefund ? 'refunded' : 'partially_refunded',
                    'status' => $isFullRefund ? 'cancelled' : $order->status,
                ]);
            }

            $dispute->update([
                'status' => $status,
                'resolution' => $resolution,
                'admin_note' => $note,
                'refund_amount' => $resolution === 'refund' ? $amount : null,
                'resolved_by' => $admin->id,
                'resolved_at' => now(),
            ]);

            $dispute->loadMissing('buyer');
            $this->notifications->notify(
                $dispute->buyer,
                'dispute.resolved',
                'Dispute resolved for '.$order->reference,
                'Admin decision: '.$resolution.($note ? ' — '.$note : ''),
                ['disputeId' => (string) $dispute->id],
            );

            return $dispute->fresh(['order', 'store', 'buyer']);
        });
    }
}
