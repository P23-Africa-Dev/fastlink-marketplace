<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispute extends Model
{
    public const STATUSES = [
        'open',
        'seller_responded',
        'under_review',
        'resolved_refund',
        'resolved_replacement',
        'resolved_rejected',
    ];

    protected $fillable = [
        'order_id',
        'buyer_id',
        'store_id',
        'type',
        'reason',
        'buyer_evidence',
        'seller_response',
        'status',
        'resolution',
        'admin_note',
        'refund_amount',
        'resolved_by',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'refund_amount' => 'decimal:2',
            'resolved_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
