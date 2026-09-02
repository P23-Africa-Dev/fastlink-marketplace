<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Configure CORS so the Next.js frontend (default: localhost:3000) can call
    | this API during local development.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_unique(array_filter(array_merge(
        [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            env('FRONTEND_URL', 'http://localhost:3000'),
        ],
        array_map('trim', explode(',', (string) env('FRONTEND_URLS', ''))),
        (function (): array {
            $frontend = (string) env('FRONTEND_URL', '');
            if ($frontend === '') {
                return [];
            }

            $host = parse_url($frontend, PHP_URL_HOST);
            $scheme = parse_url($frontend, PHP_URL_SCHEME) ?: 'https';
            if (! is_string($host) || $host === '') {
                return [];
            }

            $variants = [];
            if (str_starts_with($host, 'www.')) {
                $variants[] = $scheme.'://'.substr($host, 4);
            } else {
                $variants[] = $scheme.'://www.'.$host;
            }

            return $variants;
        })(),
    )))),

    'allowed_origins_patterns' => array_values(array_filter([
        in_array(env('APP_ENV'), ['local', 'testing'], true)
            ? '#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#'
            : null,
    ])),

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
