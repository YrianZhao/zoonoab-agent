#!/usr/bin/env python3
"""Local offline ASR sidecar for ZoonoAb.

The service exposes an OpenAI-compatible /v1/audio/transcriptions endpoint.
It uses FunASR models after the first model download, so demo speech can run
without cloud ASR keys or network access.
"""

from __future__ import annotations

import argparse
import cgi
import json
import os
import tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, Tuple

MODEL_DIR = os.environ.get(
    "LOCAL_ASR_MODEL",
    "iic/SenseVoiceSmall",
)
VAD_MODEL = os.environ.get("LOCAL_ASR_VAD_MODEL", "fsmn-vad")
PUNC_MODEL = os.environ.get("LOCAL_ASR_PUNC_MODEL", "ct-punc")
DEVICE = os.environ.get("LOCAL_ASR_DEVICE", "cpu")

_MODEL = None


def load_model():
    global _MODEL
    if _MODEL is not None:
        return _MODEL
    try:
        from funasr import AutoModel
    except ImportError as exc:
        raise RuntimeError(
            "FunASR is not installed. Run `npm run asr:setup` first."
        ) from exc

    _MODEL = AutoModel(
        model=MODEL_DIR,
        vad_model=VAD_MODEL,
        punc_model=PUNC_MODEL,
        disable_update=True,
        device=DEVICE,
    )
    return _MODEL


def transcribe_file(path: str) -> str:
    model = load_model()
    result = model.generate(
        input=path,
        language="zh",
        use_itn=True,
        batch_size_s=60,
        merge_vad=True,
        merge_length_s=15,
    )
    if not result:
        return ""
    if isinstance(result, list):
        return "".join(str(item.get("text", "")) for item in result if isinstance(item, dict)).strip()
    if isinstance(result, dict):
        return str(result.get("text", "")).strip()
    return str(result).strip()


def parse_multipart(handler: BaseHTTPRequestHandler) -> Tuple[bytes, str]:
    content_type = handler.headers.get("Content-Type", "")
    _, params = cgi.parse_header(content_type)
    boundary = params.get("boundary")
    if not boundary:
        raise ValueError("missing multipart boundary")

    form = cgi.FieldStorage(
        fp=handler.rfile,
        headers=handler.headers,
        environ={
            "REQUEST_METHOD": "POST",
            "CONTENT_TYPE": content_type,
            "CONTENT_LENGTH": handler.headers.get("Content-Length", "0"),
        },
    )
    file_item = form["file"] if "file" in form else None
    if not file_item or not getattr(file_item, "file", None):
        raise ValueError("missing file field")
    filename = Path(getattr(file_item, "filename", "") or "voice.wav").name
    data = file_item.file.read()
    if not data:
        raise ValueError("empty audio")
    return data, filename


class Handler(BaseHTTPRequestHandler):
    server_version = "ZoonoAbLocalASR/1.0"

    def log_message(self, fmt: str, *args: Any) -> None:
        print("[LocalASR] " + fmt % args)

    def send_json(self, status: int, payload: Dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path.rstrip("/") == "/health":
            self.send_json(200, {"ok": True, "provider": "local", "model": MODEL_DIR})
            return
        self.send_json(404, {"error": "not_found"})

    def do_POST(self) -> None:
        if self.path.split("?")[0] != "/v1/audio/transcriptions":
            self.send_json(404, {"error": "not_found"})
            return
        try:
            audio, filename = parse_multipart(self)
            suffix = Path(filename).suffix or ".wav"
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
                tmp.write(audio)
                tmp_path = tmp.name
            try:
                text = transcribe_file(tmp_path)
            finally:
                try:
                    os.unlink(tmp_path)
                except OSError:
                    pass
            self.send_json(200, {"text": text, "provider": "local", "model": MODEL_DIR})
        except Exception as exc:
            self.send_json(500, {"error": "local_asr_failed", "message": str(exc)})


def main() -> None:
    parser = argparse.ArgumentParser(description="Run local offline ASR server.")
    parser.add_argument("--host", default=os.environ.get("LOCAL_ASR_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("LOCAL_ASR_PORT", "8765")))
    args = parser.parse_args()
    print(f"[LocalASR] Loading model: {MODEL_DIR} ({DEVICE})")
    load_model()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"[LocalASR] Ready: http://{args.host}:{args.port}/v1/audio/transcriptions")
    server.serve_forever()


if __name__ == "__main__":
    main()
