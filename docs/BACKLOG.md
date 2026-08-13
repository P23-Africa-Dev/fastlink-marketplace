# Fastlink Marketplace — Backlog

Deferred work that is **not** required to boot the API. Do these after the current local path works (`php artisan serve` + `GET /api/health` on SQLite).

See also: [`API-INTEGRATION-PLAN.md`](./API-INTEGRATION-PLAN.md) · [`API-CATALOG.md`](./API-CATALOG.md)

---

## Local infrastructure

### MySQL (recommended once you leave “health check”)

**Status:** Backlog  
**Blocked on:** Local health check succeeding on SQLite (`GET /api/health`)  
**Why:** SQLite is enough for first boot and early auth tests. Mall/store/product relations and concurrent orders belong on MySQL ([plan §3.7](./API-INTEGRATION-PLAN.md#37-database)).

**Do not do this yet** if you have not confirmed the health endpoint.

When you pick this up:

1. Run MySQL locally (pick one):
   - **Docker (free, no Herd Pro):**

     ```bash
     docker run --name fastlink-mysql \
       -e MYSQL_ROOT_PASSWORD=secret \
       -e MYSQL_DATABASE=fastlink \
       -p 3306:3306 \
       -d mysql:8.4
     ```

   - Homebrew (`brew install mysql`), or Herd Pro’s MySQL service.

2. Point `backend/.env` at MySQL (PHP needs `pdo_mysql`):

   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=fastlink
   DB_USERNAME=root
   DB_PASSWORD=secret
   ```

3. Migrate and serve:

   ```bash
   cd backend
   php artisan migrate
   php artisan serve
   ```

**Keep PHPUnit on SQLite in-memory** (`backend/phpunit.xml`). Local `.env` can use MySQL; tests should not.

**Also later:** document both SQLite and MySQL in `backend/.env.example` (still SQLite-default today).
