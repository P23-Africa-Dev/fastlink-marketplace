<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferralCode extends Model
{
    protected $fillable = [
        'user_id',
        'code',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function codeFor(User $user): self
    {
        $existing = static::query()->where('user_id', $user->id)->first();
        if ($existing) {
            return $existing;
        }

        do {
            $letters = preg_replace('/[^A-Za-z]/', '', $user->name ?? '') ?: 'FLK';
            $code = strtoupper(substr($letters, 0, 3)).random_int(1000, 9999);
        } while (static::query()->where('code', $code)->exists());

        return static::query()->create([
            'user_id' => $user->id,
            'code' => $code,
        ]);
    }
}
