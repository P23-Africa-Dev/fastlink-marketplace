<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promo_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('code', 40);
            $table->string('type', 16);
            $table->decimal('value', 12, 2);
            $table->decimal('min_subtotal', 12, 2)->default(0);
            $table->decimal('max_discount', 12, 2)->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->unsignedInteger('per_user_limit')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();

            $table->unique('code');
            $table->index(['store_id', 'is_active']);
        });

        Schema::create('promo_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promo_code_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 12, 2);
            $table->timestamps();

            $table->index(['promo_code_id', 'user_id']);
        });

        Schema::create('cart_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->json('items');
            $table->string('coupon_code', 40)->nullable();
            $table->timestamp('reminded_at')->nullable();
            $table->timestamps();
        });

        Schema::create('referral_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('code', 32)->unique();
            $table->timestamps();
        });

        Schema::create('referral_attributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('referred_user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index('referrer_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('discount', 12, 2)->default(0)->after('tax');
            $table->string('promo_code', 40)->nullable()->after('discount');
        });

        DB::table('promo_codes')->insert([
            'store_id' => null,
            'code' => 'FASTLINK10',
            'type' => 'percent',
            'value' => 10,
            'min_subtotal' => 0,
            'max_discount' => 5000,
            'usage_limit' => null,
            'used_count' => 0,
            'per_user_limit' => 5,
            'is_active' => true,
            'starts_at' => now(),
            'ends_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['discount', 'promo_code']);
        });
        Schema::dropIfExists('referral_attributions');
        Schema::dropIfExists('referral_codes');
        Schema::dropIfExists('cart_snapshots');
        Schema::dropIfExists('promo_redemptions');
        Schema::dropIfExists('promo_codes');
    }
};
