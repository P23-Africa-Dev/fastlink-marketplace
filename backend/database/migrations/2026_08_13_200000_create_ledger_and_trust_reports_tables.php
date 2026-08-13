<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->string('idempotency_key')->unique();
            $table->string('type', 64);
            $table->string('direction', 8);
            $table->decimal('amount', 14, 2);
            $table->string('currency', 8)->default('NGN');
            $table->string('reference_type', 64)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->foreignId('store_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->json('meta')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['type', 'created_at']);
            $table->index(['store_id', 'created_at']);
        });

        Schema::create('trust_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->string('subject_type', 32);
            $table->unsignedBigInteger('subject_id');
            $table->string('reason', 120);
            $table->text('details')->nullable();
            $table->string('status', 32)->default('open');
            $table->text('admin_note')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['subject_type', 'subject_id']);
        });

        $defaults = [
            ['return_window_days', '14'],
            ['min_order_amount', '0'],
            ['maintenance_mode', '0'],
            ['default_shipping_fee', '1500'],
        ];

        foreach ($defaults as [$key, $value]) {
            if (! DB::table('platform_settings')->where('key', $key)->exists()) {
                DB::table('platform_settings')->insert([
                    'key' => $key,
                    'value' => $value,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('trust_reports');
        Schema::dropIfExists('ledger_entries');
    }
};
