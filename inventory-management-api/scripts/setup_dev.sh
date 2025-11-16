#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

VENV=".venv"

if [ ! -d "$VENV" ]; then
  if command -v python3.11 >/dev/null 2>&1; then
    PYBIN=python3.11
  elif command -v python3 >/dev/null 2>&1; then
    PYBIN=python3
  else
    echo "python3 not found. Install Python 3.11 or 3.x and retry."
    exit 1
  fi
  "$PYBIN" -m venv "$VENV"
  echo "Created venv at $VENV using $PYBIN"
else
  echo "Venv already exists at $VENV"
fi

"$VENV/bin/python" -m pip install --upgrade pip setuptools wheel
"$VENV/bin/pip" install -r requirements.txt

echo ""
echo "Setup complete."
echo "To run locally:"
echo "  ./scripts/run_local.sh"
echo "Or activate the venv manually:"
echo "  source $VENV/bin/activate && uvicorn src.main:app --reload --host 0.0.0.0 --port 8000"