#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$ROOT_DIR/.mariadb.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "No local MariaDB pid file found."
  exit 0
fi

PID="$(cat "$PID_FILE")"

if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  echo "Stopped local MariaDB process ${PID}."
else
  echo "MariaDB process ${PID} is not running."
fi

rm -f "$PID_FILE"
