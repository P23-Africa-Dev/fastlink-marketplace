<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use RuntimeException;

class LedgerEntry extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'idempotency_key',
        'type',
        'direction',
        'amount',
        'currency',
        'reference_type',
        'reference_id',
        'store_id',
        'order_id',
        'meta',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'meta' => 'array',
            'created_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::updating(function () {
            throw new RuntimeException('Ledger entries are immutable.');
        });

        static::deleting(function () {
            throw new RuntimeException('Ledger entries cannot be deleted.');
        });
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
