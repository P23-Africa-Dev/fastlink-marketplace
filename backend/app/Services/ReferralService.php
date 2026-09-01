<?php

namespace App\Services;

use App\Models\ReferralAttribution;
use App\Models\ReferralCode;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class ReferralService
{
    public function ensureCode(User $user): ReferralCode
    {
        return ReferralCode::codeFor($user);
    }

    public function attribute(User $newUser, ?string $code): void
    {
        $this->ensureCode($newUser);

        if (! $code) {
            return;
        }

        $referral = ReferralCode::query()->whereRaw('UPPER(code) = ?', [strtoupper(trim($code))])->first();
        if (! $referral) {
            throw ValidationException::withMessages(['referral_code' => 'Unknown referral code.']);
        }

        if ($referral->user_id === $newUser->id) {
            throw ValidationException::withMessages(['referral_code' => 'You cannot refer yourself.']);
        }

        ReferralAttribution::query()->firstOrCreate([
            'referred_user_id' => $newUser->id,
        ], [
            'referrer_id' => $referral->user_id,
        ]);
    }

    /**
     * @return array{code: string, signups: int}
     */
    public function summary(User $user): array
    {
        $code = $this->ensureCode($user);

        return [
            'code' => $code->code,
            'signups' => ReferralAttribution::query()->where('referrer_id', $user->id)->count(),
        ];
    }
}
