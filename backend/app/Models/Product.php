<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'store_id',
        'brand_id',
        'category_id',
        'name',
        'slug',
        'sku',
        'description',
        'long_description',
        'subcategory',
        'price',
        'compare_at_price',
        'cost_price',
        'stock',
        'status',
        'is_featured',
        'is_new',
        'is_bestseller',
        'rating',
        'review_count',
        'tags',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'is_featured' => 'boolean',
            'is_new' => 'boolean',
            'is_bestseller' => 'boolean',
            'rating' => 'float',
            'tags' => 'array',
        ];
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order')->orderBy('id');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function refreshRating(): void
    {
        $approved = $this->reviews()->where('status', 'approved');
        $count = (clone $approved)->count();
        $average = $count > 0 ? round((float) (clone $approved)->avg('rating'), 2) : 0;

        $this->forceFill([
            'rating' => $average,
            'review_count' => $count,
        ])->save();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public static function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'product';
        $slug = $base;
        $i = 1;

        while (static::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }

    public static function uniqueSku(?string $sku = null): string
    {
        $base = $sku ? Str::upper(Str::slug($sku, '')) : 'FL'.strtoupper(Str::random(8));
        $candidate = $base;
        $i = 1;

        while (static::query()->where('sku', $candidate)->exists()) {
            $candidate = $base.'-'.$i;
            $i++;
        }

        return $candidate;
    }
}
