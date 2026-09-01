<?php

use App\Services\CartRecoveryService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('cart:remind-stale {--hours=2}', function () {
    $count = app(CartRecoveryService::class)->remindStale((int) $this->option('hours'));
    $this->info("Reminded {$count} abandoned cart(s).");
})->purpose('Notify buyers who left items in their cart');

Schedule::command('cart:remind-stale --hours=2')->hourly();
