<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryZone extends Model
{
    protected $fillable = [
        'name',
        'state',
        'city',
        'fee',
        'free_above',
        'eta_min_days',
        'eta_max_days',
        'is_active',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fee' => 'decimal:2',
            'free_above' => 'decimal:2',
            'eta_min_days' => 'integer',
            'eta_max_days' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
