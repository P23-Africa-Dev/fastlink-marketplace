<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_views', function (Blueprint $table): void {
            $table->string('event_type', 40)->default('page_view')->after('viewer_id');
            $table->json('meta')->nullable()->after('path');
            $table->index(['store_id', 'event_type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('page_views', function (Blueprint $table): void {
            $table->dropIndex(['store_id', 'event_type', 'created_at']);
            $table->dropColumn(['event_type', 'meta']);
        });
    }
};

