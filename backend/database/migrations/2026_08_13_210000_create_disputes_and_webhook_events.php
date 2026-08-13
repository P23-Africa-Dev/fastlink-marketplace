<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->string('type', 32)->default('refund');
            $table->text('reason');
            $table->text('buyer_evidence')->nullable();
            $table->text('seller_response')->nullable();
            $table->string('status', 32)->default('open');
            $table->string('resolution', 32)->nullable();
            $table->text('admin_note')->nullable();
            $table->decimal('refund_amount', 14, 2)->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });

        Schema::create('paystack_webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('event', 64)->nullable();
            $table->string('reference', 120)->nullable();
            $table->string('status', 32);
            $table->text('error')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['status', 'created_at']);
            $table->index('reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paystack_webhook_events');
        Schema::dropIfExists('disputes');
    }
};
