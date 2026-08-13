<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mall extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'image',
        'location',
        'city',
    ];

    public function stores(): HasMany
    {
        return $this->hasMany(Store::class);
    }
}
