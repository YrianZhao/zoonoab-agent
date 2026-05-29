#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="$ROOT_DIR/.runtime/local-asr-venv"

if [ ! -x "$VENV_DIR/bin/python" ]; then
  echo "Local ASR environment is missing. Run: npm run asr:setup" >&2
  exit 1
fi

exec "$VENV_DIR/bin/python" "$ROOT_DIR/scripts/local_asr_server.py"
