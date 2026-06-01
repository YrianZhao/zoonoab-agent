#!/usr/bin/env python3
"""Local offline ASR sidecar for ZoonoAb.

The service exposes an OpenAI-compatible /v1/audio/transcriptions endpoint.
It uses FunASR models after the first model download, so demo speech can run
without cloud ASR keys or network access.
"""

from __future__ import annotations

import argparse
import cgi
from email.parser import BytesParser
from email.policy import default as email_policy
import json
import os
import tempfile
import threading
import time
import wave
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

ROOT_DIR = Path(__file__).resolve().parent.parent
ENGINE = os.environ.get("LOCAL_ASR_ENGINE", "funasr").strip().lower() or "funasr"
MODEL_DIR = os.environ.get(
    "LOCAL_ASR_MODEL",
    "vosk-model-small-cn-0.22" if ENGINE == "vosk" else "iic/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch",
)
VAD_MODEL = os.environ.get("LOCAL_ASR_VAD_MODEL", "")
PUNC_MODEL = os.environ.get("LOCAL_ASR_PUNC_MODEL", "")
DEVICE = os.environ.get("LOCAL_ASR_DEVICE", "cpu")
PRELOAD_MODEL = os.environ.get("LOCAL_ASR_PRELOAD", "1").lower() not in {"0", "false", "no", "off"}
HOTWORDS = os.environ.get(
    "LOCAL_ASR_HOTWORDS",
    "小诺同学 小诺小诺 小诺 PD-1 PD-L1 PDL1 IL-33 ST2 HER2 TNF Fab VHH 抗体 设计 候选 亲和力 阻断 通路 结构模型"
)

_MODEL = None
_MODEL_LOCK = threading.Lock()
_MODEL_STATUS = {
    "state": "not_loaded",
    "error": "",
    "loadedAt": None,
}


def normalize_optional_model(value: str) -> Optional[str]:
    normalized = str(value or "").strip()
    if normalized.lower() in {"", "0", "false", "no", "none", "off"}:
        return None
    return normalized


def set_model_status(state: str, error: str = "") -> None:
    _MODEL_STATUS["state"] = state
    _MODEL_STATUS["error"] = error
    if state == "ready":
        _MODEL_STATUS["loadedAt"] = time.time()


def get_model_status() -> Dict[str, Any]:
    return {
        "state": _MODEL_STATUS["state"],
        "ready": _MODEL_STATUS["state"] == "ready",
        "error": _MODEL_STATUS["error"],
        "loadedAt": _MODEL_STATUS["loadedAt"],
    }


def load_model():
    global _MODEL
    if _MODEL is not None:
        return _MODEL
    with _MODEL_LOCK:
        if _MODEL is not None:
            return _MODEL
        set_model_status("loading")
        if ENGINE == "vosk":
            try:
                from vosk import Model
            except ImportError as exc:
                set_model_status("error", "Vosk is not installed. Run `npm run asr:setup` first.")
                raise RuntimeError(
                    "Vosk is not installed. Run `npm run asr:setup` first."
                ) from exc

            model_path = Path(MODEL_DIR)
            if not model_path.is_absolute():
                cache_dir = Path(os.environ.get("LOCAL_ASR_CACHE_DIR", ROOT_DIR / ".runtime" / "local-asr-cache"))
                model_path = cache_dir / "vosk" / MODEL_DIR
            if not model_path.exists():
                set_model_status("error", f"Vosk model is missing: {model_path}. Run `npm run asr:setup` first.")
                raise RuntimeError(f"Vosk model is missing: {model_path}. Run `npm run asr:setup` first.")
            try:
                _MODEL = Model(str(model_path))
                set_model_status("ready")
                return _MODEL
            except Exception as exc:
                set_model_status("error", str(exc))
                raise

        try:
            from funasr import AutoModel
        except ImportError as exc:
            set_model_status("error", "FunASR is not installed. Run `npm run asr:setup` first.")
            raise RuntimeError(
                "FunASR is not installed. Run `npm run asr:setup` first."
            ) from exc

        kwargs = {
            "model": MODEL_DIR,
            "disable_update": True,
            "device": DEVICE,
        }
        vad_model = normalize_optional_model(VAD_MODEL)
        punc_model = normalize_optional_model(PUNC_MODEL)
        if vad_model:
            kwargs["vad_model"] = vad_model
        if punc_model:
            kwargs["punc_model"] = punc_model

        try:
            _MODEL = AutoModel(**kwargs)
            set_model_status("ready")
            return _MODEL
        except Exception as exc:
            set_model_status("error", str(exc))
            raise


def preload_model() -> None:
    try:
        load_model()
        print("[LocalASR] Model ready")
    except Exception as exc:
        print(f"[LocalASR] Model preload failed: {exc}")


def transcribe_file(path: str) -> str:
    model = load_model()
    if ENGINE == "vosk":
        from vosk import KaldiRecognizer

        parts = []
        with wave.open(path, "rb") as wav:
            if wav.getnchannels() != 1 or wav.getsampwidth() != 2:
                raise RuntimeError("Vosk expects 16-bit mono WAV audio.")
            rec = KaldiRecognizer(model, wav.getframerate())
            rec.SetWords(False)
            while True:
                data = wav.readframes(4000)
                if not data:
                    break
                if rec.AcceptWaveform(data):
                    try:
                        item = json.loads(rec.Result())
                        if item.get("text"):
                            parts.append(str(item["text"]))
                    except Exception:
                        pass
            try:
                final = json.loads(rec.FinalResult())
                if final.get("text"):
                    parts.append(str(final["text"]))
            except Exception:
                pass
        return "".join(parts).replace(" ", "").strip()

    kwargs = {
        "input": path,
        "use_itn": True,
        "batch_size_s": 60,
    }
    if HOTWORDS.strip():
        kwargs["hotword"] = HOTWORDS.strip()
    if normalize_optional_model(VAD_MODEL):
        kwargs.update({
            "merge_vad": True,
            "merge_length_s": 15,
        })
    result = model.generate(**kwargs)
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
    content_length = int(handler.headers.get("Content-Length", "0") or "0")
    if content_length <= 0:
        raise ValueError("missing content length")
    raw_body = handler.rfile.read(content_length)
    message = BytesParser(policy=email_policy).parsebytes(
        b"Content-Type: " + content_type.encode("utf-8") + b"\r\n"
        + b"MIME-Version: 1.0\r\n\r\n"
        + raw_body
    )
    file_part = None
    for part in message.iter_parts():
        if part.get_param("name", header="content-disposition") == "file":
            file_part = part
            break
    if file_part is None:
        raise ValueError("missing file field")
    filename = Path(file_part.get_filename() or "voice.wav").name
    data = file_part.get_payload(decode=True) or b""
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
            status = get_model_status()
            self.send_json(200, {
                "ok": True,
                "provider": "local",
                "engine": ENGINE,
                "model": MODEL_DIR,
                "device": DEVICE,
                "ready": status["ready"],
                "state": status["state"],
                "error": status["error"],
            })
            return
        self.send_json(404, {"error": "not_found"})

    def do_POST(self) -> None:
        if self.path.split("?")[0] != "/v1/audio/transcriptions":
            self.send_json(404, {"error": "not_found"})
            return
        status = get_model_status()
        if status["state"] == "loading":
            self.send_json(503, {
                "error": "local_asr_loading",
                "message": "本机离线语音模型正在加载，首次启动或首次转写需要等待模型预热完成。",
                "provider": "local",
                "engine": ENGINE,
                "model": MODEL_DIR,
                "state": status["state"],
            })
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
            self.send_json(200, {"text": text, "provider": "local", "engine": ENGINE, "model": MODEL_DIR})
        except Exception as exc:
            self.send_json(500, {"error": "local_asr_failed", "message": str(exc)})


def main() -> None:
    parser = argparse.ArgumentParser(description="Run local offline ASR server.")
    parser.add_argument("--host", default=os.environ.get("LOCAL_ASR_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("LOCAL_ASR_PORT", "8765")))
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"[LocalASR] Ready: http://{args.host}:{args.port}/v1/audio/transcriptions")
    print(f"[LocalASR] Engine: {ENGINE}; model: {MODEL_DIR} ({DEVICE})")
    print(f"[LocalASR] VAD: {normalize_optional_model(VAD_MODEL) or 'off'}; punctuation: {normalize_optional_model(PUNC_MODEL) or 'off'}")
    if PRELOAD_MODEL:
        print("[LocalASR] Preloading model in background")
        threading.Thread(target=preload_model, daemon=True).start()
    server.serve_forever()


if __name__ == "__main__":
    main()
