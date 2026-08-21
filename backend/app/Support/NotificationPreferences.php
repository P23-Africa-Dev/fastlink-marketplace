<?php

namespace App\Support;

class NotificationPreferences
{
    /**
     * @return array<string, array{email: bool, push: bool}>
     */
    public static function defaults(): array
    {
        return [
            'sale' => ['email' => true, 'push' => true],
            'order' => ['email' => true, 'push' => true],
            'stock' => ['email' => true, 'push' => true],
        ];
    }

    /**
     * @param  array<string, mixed>|null  $stored
     * @return array<string, array{email: bool, push: bool}>
     */
    public static function normalize(?array $stored): array
    {
        $defaults = self::defaults();

        foreach ($defaults as $key => $value) {
            if (! isset($stored[$key]) || ! is_array($stored[$key])) {
                continue;
            }

            $defaults[$key] = [
                'email' => (bool) ($stored[$key]['email'] ?? $value['email']),
                'push' => (bool) ($stored[$key]['push'] ?? $value['push']),
            ];
        }

        return $defaults;
    }
}
