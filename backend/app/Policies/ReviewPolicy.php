<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    public function reply(User $user, Review $review): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $review->store?->owner_id === $user->id;
    }

    public function update(User $user, Review $review): bool
    {
        return $this->reply($user, $review);
    }
}
