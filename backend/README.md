# Fastlink Marketplace — Laravel API

Laravel backend for the Fastlink Marketplace project. The Next.js frontend lives in the repository root; this folder contains the API only.

## Requirements

- PHP 8.3+
- Composer
- SQLite (default) or MySQL

## Quick start

From this `backend` folder:

```bash
composer install
cp .env.example .env   # skip if .env already exists
php artisan key:generate
touch database/database.sqlite   # Windows: type nul > database\database.sqlite
php artisan migrate
php artisan db:seed
php artisan serve
```

The API will be available at `http://localhost:8000`.

## Health check

Verify the backend is running:

```bash
curl http://localhost:8000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Fastlink Marketplace API is running.",
  "data": {
    "status": "ok",
    "service": "Fastlink Marketplace API",
    "environment": "local",
    "timestamp": "2026-08-12T10:00:00+00:00"
  }
}
```

Laravel also exposes a built-in health route at `GET /up`.

## Run tests

```bash
php artisan test
```

Or run only the health check test:

```bash
php artisan test --filter=HealthCheckTest
```

## Frontend integration

When you connect the Next.js app, set this in the frontend `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

The API response shape matches the frontend `ApiResponse` type: `{ success, data, message? }`.

CORS is configured for `FRONTEND_URL` (default `http://localhost:3000`).

## Demo users (after `php artisan db:seed`)

Password for all: `password`

| Email | Role |
|-------|------|
| `admin@fastlink.test` | admin |
| `seller@fastlink.test` | seller |
| `buyer@fastlink.test` | buyer |

Admin is seeded only — public register cannot create `role=admin`.

## Project structure

```
backend/
├── app/Http/Controllers/Api/   # API controllers
├── routes/api.php              # API routes (prefix: /api)
├── config/                     # App configuration
├── database/                   # Migrations & SQLite database
└── tests/Feature/              # API tests
```
