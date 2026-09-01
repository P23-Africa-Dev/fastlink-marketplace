#!/usr/bin/env bash
# Full VPS setup for FastLink API — isolated from other projects
set -euo pipefail

APP_ROOT="/var/www/fastlink-marketplace"
BACKEND_DIR="${APP_ROOT}/backend"
REPO_URL="https://github.com/P23-Africa-Dev/fastlink-marketplace.git"
NGINX_AVAILABLE="/etc/nginx/sites-available/api.fastlinkmarketplace.com"
NGINX_ENABLED="/etc/nginx/sites-enabled/api.fastlinkmarketplace.com"
DB_NAME="fastlink_marketplace"
DB_USER="fastlink_user"
DB_PASS="${FASTLINK_DB_PASSWORD:?Set FASTLINK_DB_PASSWORD before running}"

echo "========== Phase 1: Reconnaissance =========="
cat /etc/os-release | head -5
echo "--- Web ---"
systemctl is-active nginx 2>/dev/null && echo "nginx: active" || echo "nginx: inactive"
systemctl is-active apache2 2>/dev/null && echo "apache2: active" || true
echo "--- PHP ---"
php -v 2>/dev/null | head -1 || echo "PHP not found"
ls /etc/php/ 2>/dev/null || true
echo "--- MySQL ---"
systemctl is-active mysql 2>/dev/null && echo "mysql: active" || systemctl is-active mariadb 2>/dev/null && echo "mariadb: active" || echo "mysql: not active"
echo "--- /var/www ---"
ls -la /var/www/ 2>/dev/null || true

echo "========== Phase 2: Install dependencies (if missing) =========="
export DEBIAN_FRONTEND=noninteractive
if command -v apt-get &>/dev/null; then
  apt-get update -qq
  NEED=""
  command -v php8.3 &>/dev/null || NEED="$NEED php8.3 php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip php8.3-bcmath php8.3-intl"
  command -v composer &>/dev/null || NEED="$NEED composer"
  command -v git &>/dev/null || NEED="$NEED git"
  systemctl is-active mysql &>/dev/null || systemctl is-active mariadb &>/dev/null || NEED="$NEED mysql-server"
  systemctl is-active nginx &>/dev/null || NEED="$NEED nginx"
  command -v certbot &>/dev/null || NEED="$NEED certbot python3-certbot-nginx"
  dpkg -l supervisor &>/dev/null || NEED="$NEED supervisor"
  if [[ -n "$NEED" ]]; then
    echo "Installing:$NEED"
    apt-get install -y $NEED
  fi
fi

echo "========== Phase 3: MySQL database (isolated) =========="
mysql -u root <<EOSQL
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOSQL

echo "========== Phase 4: Clone repo =========="
if [[ ! -d "${APP_ROOT}/.git" ]]; then
  git clone "${REPO_URL}" "${APP_ROOT}"
else
  cd "${APP_ROOT}" && git fetch origin && (git checkout main 2>/dev/null || git checkout dev) && git pull
fi

echo "========== Phase 5: .env =========="
cd "${BACKEND_DIR}"
if [[ ! -f .env ]]; then
  cp "${APP_ROOT}/deploy/backend.env.production.example" .env 2>/dev/null || cp .env.example .env
fi

# Patch production URLs and DB (idempotent sed)
sed -i 's|^APP_ENV=.*|APP_ENV=production|' .env
sed -i 's|^APP_DEBUG=.*|APP_DEBUG=false|' .env
sed -i 's|^APP_URL=.*|APP_URL=https://api.fastlinkmarketplace.com|' .env
sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://fastlinkmarketplace.com|' .env
sed -i 's|^DB_CONNECTION=.*|DB_CONNECTION=mysql|' .env
sed -i 's|^DB_HOST=.*|DB_HOST=127.0.0.1|' .env
sed -i 's|^DB_PORT=.*|DB_PORT=3306|' .env
sed -i "s|^DB_DATABASE=.*|DB_DATABASE=${DB_NAME}|" .env
sed -i "s|^DB_USERNAME=.*|DB_USERNAME=${DB_USER}|" .env
sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${DB_PASS}|" .env
sed -i 's|^LOG_LEVEL=.*|LOG_LEVEL=error|' .env

echo "========== Phase 6: Laravel =========="
composer install --no-dev --optimize-autoloader --no-interaction
php artisan key:generate --force
php artisan migrate --force
php artisan storage:link 2>/dev/null || true
php artisan config:cache
php artisan route:cache
php artisan view:cache
chown -R www-data:www-data "${APP_ROOT}"
chmod -R ug+rwx storage bootstrap/cache

echo "========== Phase 7: Nginx (new site only) =========="
PHP_SOCK="$(ls /run/php/php8.3-fpm.sock 2>/dev/null || ls /run/php/php8.2-fpm.sock 2>/dev/null || ls /run/php/php*-fpm.sock 2>/dev/null | head -1)"
if [[ -z "${PHP_SOCK}" ]]; then
  echo "ERROR: PHP-FPM socket not found"
  exit 1
fi

cat > "${NGINX_AVAILABLE}" <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name api.fastlinkmarketplace.com;
    root ${BACKEND_DIR}/public;

    index index.php;
    charset utf-8;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php\$ {
        fastcgi_pass unix:${PHP_SOCK};
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    client_max_body_size 20M;
}
NGINX

ln -sf "${NGINX_AVAILABLE}" "${NGINX_ENABLED}"
nginx -t
systemctl reload nginx

echo "========== Phase 8: SSL =========="
certbot --nginx -d api.fastlinkmarketplace.com --non-interactive --agree-tos --register-unsafely-without-email || echo "Certbot failed — run manually if DNS not ready"

echo "========== Phase 9: Supervisor + Cron =========="
cat > /etc/supervisor/conf.d/fastlink-queue.conf <<'SUP'
[program:fastlink-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/fastlink-marketplace/backend/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/fastlink-marketplace/backend/storage/logs/queue.log
stopwaitsecs=3600
SUP

supervisorctl reread
supervisorctl update
supervisorctl start fastlink-queue:* 2>/dev/null || supervisorctl restart fastlink-queue:*

CRON_LINE="* * * * * cd ${BACKEND_DIR} && php artisan schedule:run >> /dev/null 2>&1"
(crontab -l 2>/dev/null | grep -F "fastlink-marketplace" || true; echo "${CRON_LINE}") | sort -u | crontab -

echo "========== Done =========="
curl -sS "http://127.0.0.1/api/health" -H "Host: api.fastlinkmarketplace.com" || true
echo ""
echo "Verify: curl https://api.fastlinkmarketplace.com/api/health"
