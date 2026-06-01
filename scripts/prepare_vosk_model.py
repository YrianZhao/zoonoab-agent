#!/usr/bin/env python3
"""Download and prepare the lightweight Vosk Chinese ASR model."""

from __future__ import annotations

import os
import shutil
import urllib.request
import zipfile
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent.parent
CACHE_DIR = Path(os.environ.get("LOCAL_ASR_CACHE_DIR", ROOT_DIR / ".runtime" / "local-asr-cache"))
MODEL_NAME = os.environ.get("LOCAL_ASR_MODEL", "vosk-model-small-cn-0.22").strip() or "vosk-model-small-cn-0.22"
MODEL_URL = os.environ.get(
    "LOCAL_ASR_VOSK_MODEL_URL",
    "https://alphacephei.com/vosk/models/vosk-model-small-cn-0.22.zip",
).strip()


def main() -> None:
    model_dir = CACHE_DIR / "vosk" / MODEL_NAME
    if (model_dir / "conf").exists() and (model_dir / "am").exists():
        print(f"Vosk model is ready: {model_dir}")
        return

    archive_dir = CACHE_DIR / "downloads"
    archive_dir.mkdir(parents=True, exist_ok=True)
    archive_path = archive_dir / f"{MODEL_NAME}.zip"
    if not archive_path.exists():
        print(f"Downloading Vosk model: {MODEL_URL}")
        urllib.request.urlretrieve(MODEL_URL, archive_path)

    extract_tmp = CACHE_DIR / "vosk" / f".{MODEL_NAME}.tmp"
    if extract_tmp.exists():
        shutil.rmtree(extract_tmp)
    extract_tmp.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(archive_path) as zf:
        zf.extractall(extract_tmp)

    candidates = [p for p in extract_tmp.iterdir() if p.is_dir()]
    source_dir = next((p for p in candidates if (p / "conf").exists() and (p / "am").exists()), None)
    if source_dir is None:
        raise RuntimeError(f"Could not find Vosk model directory inside {archive_path}")

    model_dir.parent.mkdir(parents=True, exist_ok=True)
    if model_dir.exists():
        shutil.rmtree(model_dir)
    shutil.move(str(source_dir), str(model_dir))
    shutil.rmtree(extract_tmp, ignore_errors=True)
    print(f"Vosk model is ready: {model_dir}")


if __name__ == "__main__":
    main()
