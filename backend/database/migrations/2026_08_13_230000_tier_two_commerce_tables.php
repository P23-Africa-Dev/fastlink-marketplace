<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('state')->nullable();
            $table->string('city')->nullable();
            $table->decimal('fee', 14, 2);
            $table->decimal('free_above', 14, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['state', 'is_active']);
        });

        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->string('type', 32);
            $table->integer('quantity_delta');
            $table->unsignedInteger('quantity_after');
            $table->string('reference_type', 64)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('note')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['store_id', 'created_at']);
            $table->index(['product_id', 'created_at']);
        });

        Schema::create('store_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->string('type', 32);
            $table->string('file_path');
            $table->string('file_url');
            $table->string('status', 32)->default('pending');
            $table->text('admin_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['store_id', 'status']);
        });

        Schema::create('rider_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rider_id')->constrained()->cascadeOnDelete();
            $table->string('type', 32);
            $table->string('file_path');
            $table->string('file_url');
            $table->string('status', 32)->default('pending');
            $table->text('admin_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['rider_id', 'status']);
        });

        $now = now();
        $zones = [
            ['name' => 'Lagos Metro', 'state' => 'Lagos', 'city' => null, 'fee' => 1200, 'free_above' => 25000, 'sort_order' => 10],
            ['name' => 'Abuja FCT', 'state' => 'FCT', 'city' => null, 'fee' => 1500, 'free_above' => 30000, 'sort_order' => 20],
            ['name' => 'Kano State', 'state' => 'Kano', 'city' => null, 'fee' => 1000, 'free_above' => 20000, 'sort_order' => 30],
            ['name' => 'Nigeria — Standard', 'state' => null, 'city' => null, 'fee' => 1500, 'free_above' => null, 'sort_order' => 100],
        ];

        foreach ($zones as $zone) {
            DB::table('delivery_zones')->insert([
                ...$zone,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('rider_documents');
        Schema::dropIfExists('store_documents');
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('delivery_zones');
    }
};
