#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$ROOT_DIR/.mariadb-data"
SOCKET_PATH="$ROOT_DIR/.mariadb.sock"
PID_FILE="$ROOT_DIR/.mariadb.pid"
LOG_FILE="$ROOT_DIR/.mariadb.log"
PORT="${DB_PORT:-3306}"
HOST="${DB_HOST:-127.0.0.1}"

if ! command -v mariadbd >/dev/null 2>&1; then
  echo "mariadbd is not installed on this machine."
  exit 1
fi

if [ ! -d "$DATA_DIR/mysql" ]; then
  echo "Initializing local MariaDB data directory..."
  mariadb-install-db \
    --datadir="$DATA_DIR" \
    --auth-root-authentication-method=normal \
    --skip-test-db >/dev/null
fi

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Local MariaDB is already running on ${HOST}:${PORT}"
  exit 0
fi

echo "Starting local MariaDB on ${HOST}:${PORT}..."
mariadbd \
  --datadir="$DATA_DIR" \
  --socket="$SOCKET_PATH" \
  --pid-file="$PID_FILE" \
  --log-error="$LOG_FILE" \
  --port="$PORT" \
  --bind-address="$HOST" \
  --skip-networking=0 \
  --user="$(id -un)" \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci \
  >/dev/null 2>&1 &

sleep 5

if ! mysqladmin --protocol=tcp -h"$HOST" -P"$PORT" -u root ping >/dev/null 2>&1; then
  echo "MariaDB did not start correctly. Check $LOG_FILE"
  exit 1
fi

mysql --protocol=tcp -h"$HOST" -P"$PORT" -u root \
  -e "CREATE DATABASE IF NOT EXISTS ecommerce_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "Local MariaDB is ready."
echo "Next:"
echo "  mysql -h ${HOST} -P ${PORT} -u root ecommerce_store < ${ROOT_DIR}/src/database/schema.sql"
echo "  mysql -h ${HOST} -P ${PORT} -u root ecommerce_store < ${ROOT_DIR}/src/database/seed.sql"
