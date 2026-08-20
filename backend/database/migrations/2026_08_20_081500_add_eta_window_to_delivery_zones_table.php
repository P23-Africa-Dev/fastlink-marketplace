<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('delivery_zones', function (Blueprint $table): void {
            $table->unsignedTinyInteger('eta_min_days')->default(2)->after('free_above');
            $table->unsignedTinyInteger('eta_max_days')->default(5)->after('eta_min_days');
        });
    }

    public function down(): void
    {
        Schema::table('delivery_zones', function (Blueprint $table): void {
            $table->dropColumn(['eta_min_days', 'eta_max_days']);
        });
    }
};

