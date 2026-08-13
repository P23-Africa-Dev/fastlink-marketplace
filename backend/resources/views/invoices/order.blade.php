<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt {{ $order->reference }}</title>
    <style>
        body { font-family: system-ui, sans-serif; color: #1a1a1a; max-width: 640px; margin: 2rem auto; padding: 1rem; }
        h1 { color: #6D349F; font-size: 1.5rem; margin-bottom: 0.25rem; }
        .muted { color: #666; font-size: 0.875rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
        th, td { text-align: left; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
        .total { font-weight: 700; font-size: 1.125rem; }
        .footer { margin-top: 2rem; font-size: 0.75rem; color: #888; }
    </style>
</head>
<body>
    <h1>Fastlink Marketplace</h1>
    <p class="muted">Order receipt · {{ $order->reference }}</p>
    <p class="muted">Date: {{ $order->created_at?->format('d M Y, H:i') }}</p>
    <p><strong>Customer:</strong> {{ $order->buyer_name }} ({{ $order->buyer_email }})</p>
    @if($order->store)
        <p><strong>Store:</strong> {{ $order->store->name }}</p>
    @endif
    <table>
        <thead>
            <tr><th>Item</th><th>Qty</th><th>Amount</th></tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->name_snapshot }}</td>
                <td>{{ $item->quantity }}</td>
                <td>₦{{ number_format($item->unit_price * $item->quantity, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    <p class="total">Total: ₦{{ number_format((float) $order->total, 2) }}</p>
    <p class="muted">Payment: {{ ucfirst($order->payment_status) }} · Status: {{ ucfirst($order->status) }}</p>
    <div class="footer">Thank you for shopping on Fastlink.</div>
</body>
</html>
