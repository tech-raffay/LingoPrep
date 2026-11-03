"""Bound uploads before multipart parsing and recognize supported containers."""

from fastapi import HTTPException, UploadFile
from starlette.formparsers import MultiPartException
from starlette.responses import JSONResponse

MAX_AUDIO_BYTES = 10 * 1024 * 1024
MAX_REQUEST_BYTES = MAX_AUDIO_BYTES + 1024 * 1024  # Multipart fields and headers.


class AudioUploadLimitMiddleware:
    """Count actual bytes, including chunked bodies, before they reach the parser."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope["path"].rstrip("/") != "/api/speaking/transcribe":
            return await self.app(scope, receive, send)

        headers = dict(scope.get("headers", []))
        if b"content-length" in headers:
            try:
                length = int(headers[b"content-length"])
                if length < 0:
                    raise ValueError
            except ValueError:
                return await JSONResponse({"detail": "Invalid content length."}, status_code=400)(scope, receive, send)
            if length > MAX_REQUEST_BYTES:
                return await JSONResponse({"detail": "Audio upload is too large."}, status_code=413)(scope, receive, send)

        received = 0
        exceeded = False

        async def limited_receive():
            nonlocal received, exceeded
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > MAX_REQUEST_BYTES:
                    exceeded = True
                    # MultiPartException makes Starlette close already-spooled
                    # files. It normally becomes 400; limited_send maps it to 413.
                    raise MultiPartException("Audio upload is too large.")
            return message

        async def limited_send(message):
            if exceeded and message["type"] == "http.response.start":
                message = {**message, "status": 413}
            await send(message)

        await self.app(scope, limited_receive, limited_send)


def audio_format(data: bytes, content_type: str | None) -> tuple[str, str]:
    """Check container signatures, not caller filenames. Decoding is provider-side."""
    if not data:
        raise HTTPException(status_code=400, detail="Audio file is empty.")
    if len(data) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio file exceeds the 10 MiB limit.")
    mime = (content_type or "").split(";", 1)[0].strip().lower()
    formats = [
        ("webm", "audio/webm", {"audio/webm", "video/webm"}, data.startswith(b"\x1aE\xdf\xa3")),
        ("wav", "audio/wav", {"audio/wav", "audio/x-wav", "audio/wave"}, data[:4] == b"RIFF" and data[8:12] == b"WAVE"),
        ("ogg", "audio/ogg", {"audio/ogg", "application/ogg"}, data.startswith(b"OggS")),
        ("flac", "audio/flac", {"audio/flac", "audio/x-flac"}, data.startswith(b"fLaC")),
        ("mp3", "audio/mpeg", {"audio/mpeg", "audio/mp3"}, data.startswith(b"ID3") or (
            len(data) >= 2 and data[0] == 0xff and data[1] & 0xe0 == 0xe0)),
        ("m4a", "audio/mp4", {"audio/mp4", "audio/m4a", "audio/x-m4a"}, data[4:8] == b"ftyp"),
    ]
    for extension, provider_mime, allowed_mimes, matches in formats:
        if matches and (mime in allowed_mimes or mime == "application/octet-stream"):
            return extension, provider_mime
    raise HTTPException(status_code=415, detail="Unsupported audio format or mismatched content type.")


async def read_audio_upload(file: UploadFile) -> tuple[bytes, str, str]:
    """Read at most the limit plus one byte and always close the upload spool."""
    try:
        data = await file.read(MAX_AUDIO_BYTES + 1)
        extension, mime = audio_format(data, file.content_type)
        return data, extension, mime
    finally:
        await file.close()
