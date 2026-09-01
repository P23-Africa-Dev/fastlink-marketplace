<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformSetting extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'key',
        'value',
    ];

    public static function getValue(string $key, mixed $default = null): mixed
    {
        $row = static::query()->find($key);

        return $row?->value ?? $default;
    }

    public static function setValue(string $key, mixed $value): void
    {
        static::query()->updateOrCreate(
            ['key' => $key],
            ['value' => is_scalar($value) || $value === null ? (string) $value : json_encode($value)],
        );
    }

    public static function commissionRate(): float
    {
        return (float) static::getValue('commission_rate', config('commerce.commission_rate', 10));
    }

    public static function returnWindowDays(): int
    {
        return (int) static::getValue('return_window_days', 14);
    }

    public static function minOrderAmount(): float
    {
        return (float) static::getValue('min_order_amount', 0);
    }

    public static function defaultShippingFee(): float
    {
        return (float) static::getValue('default_shipping_fee', 1500);
    }

    public static function maintenanceMode(): bool
    {
        return filter_var(static::getValue('maintenance_mode', false), FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * @return array<string, mixed>
     */
    public static function marketplaceConfig(): array
    {
        return [
            'commissionRate' => static::commissionRate(),
            'returnWindowDays' => static::returnWindowDays(),
            'minOrderAmount' => static::minOrderAmount(),
            'defaultShippingFee' => static::defaultShippingFee(),
            'maintenanceMode' => static::maintenanceMode(),
        ];
    }
}
