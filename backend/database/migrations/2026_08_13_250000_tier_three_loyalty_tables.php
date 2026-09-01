<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('loyalty_points')->default(0)->after('status');
        });

        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 16);
            $table->integer('points');
            $table->unsignedInteger('balance_after');
            $table->string('note', 255)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['order_id', 'type']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedInteger('loyalty_points')->default(0)->after('promo_code');
            $table->decimal('loyalty_discount', 12, 2)->default(0)->after('loyalty_points');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['loyalty_points', 'loyalty_discount']);
        });
        Schema::dropIfExists('loyalty_transactions');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('loyalty_points');
        });
    }
};
