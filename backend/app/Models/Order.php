<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;

    public const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    public const TRANSITIONS = [
        'pending' => ['confirmed', 'cancelled'],
        'confirmed' => ['shipped', 'cancelled'],
        'shipped' => ['delivered'],
        'delivered' => [],
        'cancelled' => [],
    ];

    protected $fillable = [
        'reference',
        'group_id',
        'buyer_id',
        'store_id',
        'address_id',
        'status',
        'payment_status',
        'payment_method',
        'delivery_method',
        'tracking_number',
        'subtotal',
        'shipping',
        'tax',
        'discount',
        'promo_code',
        'loyalty_points',
        'loyalty_discount',
        'total',
        'buyer_email',
        'buyer_name',
        'shipping_street',
        'shipping_city',
        'shipping_state',
        'shipping_postal_code',
        'shipping_country',
        'shipping_phone',
        'paid_at',
        'rider_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'shipping' => 'decimal:2',
            'tax' => 'decimal:2',
            'discount' => 'decimal:2',
            'loyalty_discount' => 'decimal:2',
            'total' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(OrderEvent::class)->orderBy('id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function rider(): BelongsTo
    {
        return $this->belongsTo(Rider::class);
    }

    public function returnRequest(): HasOne
    {
        return $this->hasOne(ReturnRequest::class);
    }

    public function canTransitionTo(string $status): bool
    {
        return in_array($status, self::TRANSITIONS[$this->status] ?? [], true);
    }

    public function addEvent(string $status, string $title): OrderEvent
    {
        return $this->events()->create([
            'status' => $status,
            'title' => $title,
        ]);
    }

    public static function uniqueReference(): string
    {
        do {
            $reference = 'FLK-'.strtoupper(Str::random(8));
        } while (static::query()->where('reference', $reference)->exists());

        return $reference;
    }

    public static function uniqueTrackingNumber(): string
    {
        do {
            $number = 'FL-TRK-'.random_int(100000, 999999);
        } while (static::query()->where('tracking_number', $number)->exists());

        return $number;
    }

    public static function normalizeStatus(string $status): string
    {
        return match (strtolower($status)) {
            'successful', 'confirmed', 'processing' => 'confirmed',
            'pending' => 'pending',
            'shipped' => 'shipped',
            'delivered' => 'delivered',
            'refunded', 'cancelled', 'canceled' => 'cancelled',
            default => strtolower($status),
        };
    }
}
