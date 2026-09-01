#!/usr/bin/env bash
# FastLink Marketplace — Laravel API deployment (backend only)
# Frontend stays on Vercel: https://fastlinkmarketplace.com
# API: https://api.fastlinkmarketplace.com
set -euo pipefail

APP_ROOT="/var/www/fastlink-marketplace"
BACKEND_DIR="${APP_ROOT}/backend"
REPO_URL="https://github.com/P23-Africa-Dev/fastlink-marketplace.git"
NGINX_SITE="api.fastlinkmarketplace.com"
DB_NAME="fastlink_marketplace"
DB_USER="fastlink_user"

echo "==> FastLink backend deploy starting..."

# --- Detect stack ---
if systemctl is-active --quiet nginx; then
  WEB_SERVER="nginx"
elif systemctl is-active --quiet apache2; then
  WEB_SERVER="apache2"
else
  WEB_SERVER="none"
fi

PHP_BIN="$(command -v php || true)"
if [[ -z "${PHP_BIN}" ]]; then
  echo "ERROR: PHP not installed. Install PHP 8.3+ first."
  exit 1
fi

PHP_VERSION="$("${PHP_BIN}" -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')"
echo "Detected: web=${WEB_SERVER}, php=${PHP_VERSION}"

# --- Clone or update repo (isolated directory) ---
if [[ ! -d "${APP_ROOT}/.git" ]]; then
  mkdir -p "${APP_ROOT}"
  git clone "${REPO_URL}" "${APP_ROOT}"
else
  cd "${APP_ROOT}"
  git pull origin main || git pull origin dev || true
fi

cd "${BACKEND_DIR}"

# --- Composer ---
if ! command -v composer &>/dev/null; then
  echo "Installing Composer..."
  curl -sS https://getcomposer.org/installer | php
  mv composer.phar /usr/local/bin/composer
  chmod +x /usr/local/bin/composer
fi

composer install --no-dev --optimize-autoloader --no-interaction

# --- .env must exist before continuing ---
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo ""
  echo "Created backend/.env from example."
  echo "STOP: Edit ${BACKEND_DIR}/.env with production values, then re-run this script."
  exit 1
fi

# --- Laravel setup ---
php artisan key:generate --force 2>/dev/null || true
php artisan migrate --force
php artisan storage:link 2>/dev/null || true
php artisan config:cache
php artisan route:cache
php artisan view:cache

# --- Permissions ---
chown -R www-data:www-data "${APP_ROOT}"
chmod -R ug+rwx storage bootstrap/cache

echo "==> Backend deploy complete. Configure Nginx + SSL + Supervisor separately if not done."
