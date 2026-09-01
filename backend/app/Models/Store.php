<?php

namespace App\Models;

use Database\Factories\StoreFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Store extends Model
{
    /** @use HasFactory<StoreFactory> */
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'mall_id',
        'category_id',
        'name',
        'slug',
        'description',
        'logo',
        'banner',
        'location',
        'delivery_tag',
        'headline',
        'type',
        'phone',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'status',
        'kyc_status',
        'kyc_rejection_reason',
        'kyc_submitted_at',
        'kyc_verified_at',
    ];

    public const KYC_STATUSES = [
        'not_started',
        'in_progress',
        'submitted',
        'under_review',
        'approved',
        'rejected',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'kyc_submitted_at' => 'datetime',
            'kyc_verified_at' => 'datetime',
        ];
    }

    /** Can publish products, receive orders, and request payouts. */
    public function canSell(): bool
    {
        return $this->status === 'approved' && $this->kyc_status === 'approved';
    }

    /** Can prepare catalog drafts while KYC/store approval is pending. */
    public function canDraftProducts(): bool
    {
        return $this->status !== 'suspended';
    }

    public function markKycSubmitted(): void
    {
        $this->update([
            'kyc_status' => 'under_review',
            'kyc_submitted_at' => $this->kyc_submitted_at ?? now(),
            'kyc_rejection_reason' => null,
            'status' => $this->status === 'rejected' ? 'pending' : $this->status,
        ]);
    }

    public function markKycApproved(): void
    {
        $this->update([
            'status' => 'approved',
            'kyc_status' => 'approved',
            'kyc_verified_at' => now(),
            'kyc_rejection_reason' => null,
            'kyc_submitted_at' => $this->kyc_submitted_at ?? now(),
        ]);
    }

    public function markKycRejected(?string $reason = null): void
    {
        $this->update([
            'status' => 'rejected',
            'kyc_status' => 'rejected',
            'kyc_rejection_reason' => $reason,
        ]);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function mall(): BelongsTo
    {
        return $this->belongsTo(Mall::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function staffMembers(): HasMany
    {
        return $this->hasMany(StoreStaff::class);
    }

    public static function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'store';
        $slug = $base;
        $i = 1;

        while (static::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }
}
