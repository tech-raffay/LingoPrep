"""Decode uploads locally before paying for transcription.

FFmpeg is a deployment dependency. Output, execution time, input protocols and
accepted demuxers are bounded. Missing decoders fail closed, never skip limits.
"""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

from fastapi import HTTPException

MAX_SECONDS = 600
SAMPLE_RATE = 16000


def validate_audio_duration(data: bytes, extension: str) -> None:
    override = os.getenv("FFMPEG_BINARY")
    decoder = shutil.which(override or "ffmpeg")
    if not decoder and not override:
        try:
            from imageio_ffmpeg import get_ffmpeg_exe
            decoder = get_ffmpeg_exe()
        except (ImportError, RuntimeError):
            pass
    if not decoder:
        raise HTTPException(503, "Audio validation is temporarily unavailable.")
    with tempfile.TemporaryDirectory(prefix="lingoprep-audio-") as directory:
        source = Path(directory) / f"recording.{extension}"
        decoded = Path(directory) / "decoded.pcm"
        source.write_bytes(data)
        try:
            process = subprocess.run([
                decoder, "-nostdin", "-v", "error", "-threads", "1", "-filter_threads", "1",
                "-max_alloc", "33554432", "-protocol_whitelist", "file,pipe",
                "-format_whitelist", "wav,matroska,webm,ogg,flac,mp3,mov",
                "-i", str(source), "-map", "0:a:0", "-vn", "-t", str(MAX_SECONDS + 1),
                "-ac", "1", "-ar", str(SAMPLE_RATE), "-f", "s16le", str(decoded),
            ], stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
               timeout=20, check=False, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
        except (OSError, subprocess.TimeoutExpired) as exc:
            raise HTTPException(422, "Audio could not be decoded within the processing limit.") from exc
        if process.returncode or not decoded.exists() or decoded.stat().st_size == 0:
            raise HTTPException(422, "Audio recording is invalid.")
        if decoded.stat().st_size > MAX_SECONDS * SAMPLE_RATE * 2:
            raise HTTPException(413, "Audio recording exceeds the ten-minute limit.")
