<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->timestamp('submitted_at')->nullable()->after('status');
            $table->timestamp('moderated_at')->nullable()->after('submitted_at');
            $table->unsignedBigInteger('moderated_by')->nullable()->after('moderated_at');
            $table->string('moderation_note', 500)->nullable()->after('moderated_by');

            $table->index(['status', 'submitted_at']);
            $table->index('moderated_by');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->dropIndex(['status', 'submitted_at']);
            $table->dropIndex(['moderated_by']);
            $table->dropColumn(['submitted_at', 'moderated_at', 'moderated_by', 'moderation_note']);
        });
    }
};

