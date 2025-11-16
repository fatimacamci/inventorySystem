#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

VENV=".venv"

if [ ! -d "$VENV" ]; then
  echo "Venv not found. Run ./scripts/setup_dev.sh first."
  exit 1
fi

exec "$VENV/bin/uvicorn" src.main:app --reload --host 0.0.0.0 --port 8000