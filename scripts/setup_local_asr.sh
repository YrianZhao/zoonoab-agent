#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="${LOCAL_ASR_VENV_DIR:-$ROOT_DIR/.runtime/local-asr-venv}"
PYTHON_BIN="${PYTHON_BIN:-python3}"
LOCAL_ASR_CACHE_DIR="${LOCAL_ASR_CACHE_DIR:-$ROOT_DIR/.runtime/local-asr-cache}"
LOCAL_ASR_TORCH_INDEX_URL="${LOCAL_ASR_TORCH_INDEX_URL:-https://download.pytorch.org/whl/cpu}"

if [[ "$VENV_DIR" != /* ]]; then
  VENV_DIR="$ROOT_DIR/$VENV_DIR"
fi
if [[ "$LOCAL_ASR_CACHE_DIR" != /* ]]; then
  LOCAL_ASR_CACHE_DIR="$ROOT_DIR/$LOCAL_ASR_CACHE_DIR"
fi

mkdir -p "$(dirname "$VENV_DIR")" "$LOCAL_ASR_CACHE_DIR"

export MODELSCOPE_CACHE="${MODELSCOPE_CACHE:-$LOCAL_ASR_CACHE_DIR/modelscope}"
export HF_HOME="${HF_HOME:-$LOCAL_ASR_CACHE_DIR/huggingface}"
export TORCH_HOME="${TORCH_HOME:-$LOCAL_ASR_CACHE_DIR/torch}"
export PIP_CACHE_DIR="${PIP_CACHE_DIR:-$LOCAL_ASR_CACHE_DIR/pip}"
mkdir -p "$MODELSCOPE_CACHE" "$HF_HOME" "$TORCH_HOME" "$PIP_CACHE_DIR"

if [ ! -d "$VENV_DIR" ]; then
  "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

"$VENV_DIR/bin/python" -m pip install --upgrade pip setuptools wheel
if [ -n "$LOCAL_ASR_TORCH_INDEX_URL" ]; then
  "$VENV_DIR/bin/python" -m pip install --upgrade --no-compile --index-url "$LOCAL_ASR_TORCH_INDEX_URL" torch torchaudio
  "$VENV_DIR/bin/python" -m pip install --upgrade --no-compile funasr modelscope
else
  "$VENV_DIR/bin/python" -m pip install --upgrade --no-compile funasr modelscope torch torchaudio
fi

echo "Local ASR environment is ready: $VENV_DIR"
