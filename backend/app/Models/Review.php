<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    /** @use HasFactory<\Database\Factories\ReviewFactory> */
    use HasFactory;

    public const STATUSES = ['approved', 'pending', 'flagged', 'hidden'];

    protected $fillable = [
        'product_id',
        'store_id',
        'buyer_id',
        'order_item_id',
        'rating',
        'body',
        'status',
        'seller_reply',
        'seller_replied_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'seller_replied_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function displayStatus(): string
    {
        return match ($this->status) {
            'approved' => 'Approved',
            'pending' => 'Pending',
            'flagged' => 'Flagged',
            'hidden' => 'Hidden',
            default => ucfirst($this->status),
        };
    }
}
