<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->foreignId('mall_id')->nullable()->after('owner_id')->constrained('malls')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->after('mall_id')->constrained('categories')->nullOnDelete();
            $table->text('description')->nullable()->after('slug');
            $table->string('logo')->nullable()->after('description');
            $table->string('banner')->nullable()->after('logo');
            $table->string('location')->nullable()->after('banner');
            $table->string('delivery_tag')->nullable()->after('location');
            $table->string('headline')->nullable()->after('delivery_tag');
            $table->string('type', 32)->default('independent')->after('headline');
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropConstrainedForeignId('mall_id');
            $table->dropConstrainedForeignId('category_id');
            $table->dropColumn([
                'description',
                'logo',
                'banner',
                'location',
                'delivery_tag',
                'headline',
                'type',
            ]);
        });
    }
};
