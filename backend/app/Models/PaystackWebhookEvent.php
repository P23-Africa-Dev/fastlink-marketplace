<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaystackWebhookEvent extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'event',
        'reference',
        'status',
        'error',
        'payload',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
