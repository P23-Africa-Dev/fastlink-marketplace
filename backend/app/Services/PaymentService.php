<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\PlatformSetting;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class PaymentService
{
    public function __construct(private PaystackService $paystack) {}

    /**
     * @return array<string, mixed>
     */
    public function initialize(User $buyer, string $groupId): array
    {
        $orders = Order::query()
            ->where('buyer_id', $buyer->id)
            ->where('group_id', $groupId)
            ->get();

        if ($orders->isEmpty()) {
            abort(404);
        }

        $existingPaid = Payment::query()
            ->whereIn('order_id', $orders->pluck('id'))
            ->where('status', 'paid')
            ->first();

        if ($orders->every(fn (Order $order) => $order->payment_status === 'paid')) {
            return [
                'alreadyPaid' => true,
                'groupId' => $groupId,
                'reference' => $existingPaid?->reference,
                'authorizationUrl' => null,
                'accessCode' => null,
                'mode' => $this->paystack->isConfigured() ? 'paystack' : 'demo',
            ];
        }

        $pending = Payment::query()
            ->whereIn('order_id', $orders->pluck('id'))
            ->where('status', 'pending')
            ->first();

        $reference = $pending?->reference ?? 'PSK-'.strtoupper(Str::replace('-', '', (string) Str::uuid()));
        $provider = $this->paystack->isConfigured() ? 'paystack' : 'demo';

        foreach ($orders as $order) {
            Payment::query()->firstOrCreate(
                ['order_id' => $order->id],
                [
                    'store_id' => $order->store_id,
                    'provider' => $provider,
                    'reference' => $reference,
                    'amount' => $order->total,
                    'fees' => 0,
                    'net' => 0,
                    'status' => 'pending',
                ],
            );
        }

        $amountKobo = (int) round(((float) $orders->sum('total')) * 100);
        $callback = rtrim((string) config('app.frontend_url'), '/').'/checkout/callback';
        $init = $this->paystack->initialize($buyer->email, $amountKobo, $reference, $callback);

        return [
            'alreadyPaid' => false,
            'groupId' => $groupId,
            'reference' => $init['reference'],
            'authorizationUrl' => $init['authorization_url'],
            'accessCode' => $init['access_code'],
            'mode' => $this->paystack->isConfigured() ? 'paystack' : 'demo',
        ];
    }

    /**
     * @return Collection<int, Order>
     */
    public function verify(string $reference, ?User $buyer = null): Collection
    {
        $payments = Payment::query()
            ->with('order')
            ->where('reference', $reference)
            ->get();

        if ($payments->isEmpty()) {
            abort(404);
        }

        if ($buyer && $payments->contains(fn (Payment $payment) => $payment->order?->buyer_id !== $buyer->id)) {
            abort(404);
        }

        if ($this->paystack->isConfigured()) {
            $result = $this->paystack->verify($reference);
            $status = strtolower((string) ($result['status'] ?? ''));
            if ($status !== 'success') {
                abort(422, 'Payment has not been completed.');
            }

            $this->markPaidByReference($reference, $result, 'paystack');
        } else {
            $this->markPaidByReference($reference, ['mode' => 'demo'], 'demo');
        }

        $orderIds = $payments->pluck('order_id');

        return Order::query()
            ->with(['items', 'store', 'events'])
            ->whereIn('id', $orderIds)
            ->get();
    }

    /**
     * @param  array<string, mixed>|null  $payload
     * @return Collection<int, Payment>
     */
    public function markPaidByReference(string $reference, ?array $payload = null, string $provider = 'paystack'): Collection
    {
        $payments = Payment::query()
            ->with('order')
            ->where('reference', $reference)
            ->get();

        if ($payments->isEmpty()) {
            abort(404);
        }

        $rate = PlatformSetting::commissionRate();

        foreach ($payments as $payment) {
            if ($payment->status === 'paid') {
                continue;
            }

            $amount = (float) $payment->amount;
            $fees = round($amount * $rate / 100, 2);
            $net = round($amount - $fees, 2);

            $payment->update([
                'status' => 'paid',
                'fees' => $fees,
                'net' => $net,
                'provider' => $provider,
                'raw_payload' => $payload,
                'paid_at' => now(),
            ]);

            $order = $payment->order;
            if ($order && $order->payment_status !== 'paid') {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => $order->status === 'pending' ? 'confirmed' : $order->status,
                    'paid_at' => now(),
                    'payment_method' => $provider,
                ]);
                $order->addEvent('confirmed', 'Payment received. Your order has been confirmed.');
            }
        }

        return $payments->fresh(['order']);
    }

    /**
     * @return Collection<int, Order>
     */
    public function confirmDemo(User $buyer, string $groupId): Collection
    {
        $orders = Order::query()
            ->where('buyer_id', $buyer->id)
            ->where('group_id', $groupId)
            ->get();

        if ($orders->isEmpty()) {
            abort(404);
        }

        $existing = Payment::query()->whereIn('order_id', $orders->pluck('id'))->first();
        $reference = $existing?->reference ?? 'DEMO-'.strtoupper(Str::random(12));

        foreach ($orders as $order) {
            Payment::query()->firstOrCreate(
                ['order_id' => $order->id],
                [
                    'store_id' => $order->store_id,
                    'provider' => 'demo',
                    'reference' => $reference,
                    'amount' => $order->total,
                    'fees' => 0,
                    'net' => 0,
                    'status' => 'pending',
                ],
            );
        }

        $this->markPaidByReference(
            Payment::query()->where('order_id', $orders->first()->id)->value('reference'),
            ['mode' => 'demo'],
            'demo',
        );

        return Order::query()
            ->with(['items', 'store', 'events'])
            ->where('buyer_id', $buyer->id)
            ->where('group_id', $groupId)
            ->get();
    }
}
