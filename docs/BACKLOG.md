# Fastlink Marketplace — Backlog

Deferred work that is **not** required to boot the API.

See also: [`API-INTEGRATION-PLAN.md`](./API-INTEGRATION-PLAN.md) · [`API-CATALOG.md`](./API-CATALOG.md)

---

## Database

### Supabase Postgres (current target)

**Status:** In use for local Laravel `.env`  
**Auth stays Laravel Sanctum** — Supabase is the hosted Postgres database only, not login.

Point `backend/.env` at the project (Project Settings → Database):

```
DB_CONNECTION=pgsql
DB_HOST=db.<project-ref>.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD="your-database-password"
DB_SSLMODE=require
```

Quote the password if it contains `*`, `+`, `#`, or spaces.

Then:

```bash
cd backend
php artisan migrate
php artisan db:seed
php artisan serve
```

**Keep PHPUnit on SQLite in-memory** (`backend/phpunit.xml`). Tests must not hit Supabase.

If the direct host (`db.<ref>.supabase.co`) fails from your network (often IPv6-only), use the **Session pooler** (port `5432`, username `postgres.<project-ref>`), for example:

```
DB_HOST=aws-0-eu-central-1.pooler.supabase.com
DB_PORT=5432
DB_USERNAME=postgres.<project-ref>
```

Never put the database password in the Next.js `.env.local`. That file is for the frontend.

### SQLite (optional local fallback)

For offline work without Supabase:

```
DB_CONNECTION=sqlite
# leave DB_HOST / DB_PASSWORD unset
```

Then `touch database/database.sqlite` and `php artisan migrate`.
