<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->string('kyc_status', 24)->default('not_started')->after('status');
            $table->string('kyc_rejection_reason', 1000)->nullable()->after('kyc_status');
            $table->timestamp('kyc_submitted_at')->nullable()->after('kyc_rejection_reason');
            $table->timestamp('kyc_verified_at')->nullable()->after('kyc_submitted_at');
        });

        // Backfill from existing store approval workflow.
        DB::table('stores')->where('status', 'approved')->update([
            'kyc_status' => 'approved',
            'kyc_verified_at' => now(),
            'kyc_submitted_at' => now(),
        ]);
        DB::table('stores')->where('status', 'pending')->update([
            'kyc_status' => 'under_review',
            'kyc_submitted_at' => now(),
        ]);
        DB::table('stores')->where('status', 'rejected')->update([
            'kyc_status' => 'rejected',
            'kyc_submitted_at' => now(),
        ]);
        DB::table('stores')->where('status', 'suspended')->update([
            'kyc_status' => 'approved',
        ]);
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn(['kyc_status', 'kyc_rejection_reason', 'kyc_submitted_at', 'kyc_verified_at']);
        });
    }
};
