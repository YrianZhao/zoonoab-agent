#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="${LOCAL_ASR_VENV_DIR:-$ROOT_DIR/.runtime/local-asr-venv}"
LOCAL_ASR_CACHE_DIR="${LOCAL_ASR_CACHE_DIR:-$ROOT_DIR/.runtime/local-asr-cache}"

if [[ "$VENV_DIR" != /* ]]; then
  VENV_DIR="$ROOT_DIR/$VENV_DIR"
fi
if [[ "$LOCAL_ASR_CACHE_DIR" != /* ]]; then
  LOCAL_ASR_CACHE_DIR="$ROOT_DIR/$LOCAL_ASR_CACHE_DIR"
fi

if [ ! -x "$VENV_DIR/bin/python" ]; then
  if [ "${LOCAL_ASR_BOOTSTRAP:-1}" = "1" ]; then
    echo "Local ASR environment is missing. Preparing it now: $VENV_DIR" >&2
    "$ROOT_DIR/scripts/setup_local_asr.sh"
  else
    echo "Local ASR environment is missing. Run: npm run asr:setup" >&2
    exit 1
  fi
fi

mkdir -p "$LOCAL_ASR_CACHE_DIR"
export MODELSCOPE_CACHE="${MODELSCOPE_CACHE:-$LOCAL_ASR_CACHE_DIR/modelscope}"
export HF_HOME="${HF_HOME:-$LOCAL_ASR_CACHE_DIR/huggingface}"
export TORCH_HOME="${TORCH_HOME:-$LOCAL_ASR_CACHE_DIR/torch}"
export PIP_CACHE_DIR="${PIP_CACHE_DIR:-$LOCAL_ASR_CACHE_DIR/pip}"
mkdir -p "$MODELSCOPE_CACHE" "$HF_HOME" "$TORCH_HOME" "$PIP_CACHE_DIR"

exec "$VENV_DIR/bin/python" "$ROOT_DIR/scripts/local_asr_server.py"
