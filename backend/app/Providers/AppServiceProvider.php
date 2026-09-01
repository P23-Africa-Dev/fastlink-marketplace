<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (User $user, string $token): string {
            $frontend = rtrim((string) config('app.frontend_url'), '/');

            return $frontend.'/set-new-password?token='.$token.'&email='.urlencode($user->email);
        });
    }
}
