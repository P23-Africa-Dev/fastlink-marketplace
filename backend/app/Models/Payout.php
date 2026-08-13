<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payout extends Model
{
    public const STATUSES = ['pending', 'approved', 'rejected', 'transferred'];

    protected $fillable = [
        'store_id',
        'amount',
        'bank_name',
        'bank_code',
        'account_number',
        'account_name',
        'status',
        'provider_reference',
        'requested_by',
        'approved_by',
        'rejection_reason',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public static function maskAccount(?string $number): string
    {
        if (! $number) {
            return '••••';
        }

        return '•••• '.substr($number, -4);
    }
}
