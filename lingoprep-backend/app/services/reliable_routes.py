"""Protect submission execution and commit its collected records atomically.

The same key and request replay a checkpoint; they never repeat evaluation.
An interrupted attempt without a checkpoint remains uncertain, rather than
silently invoking a paid provider for a second time.
"""

import hashlib
import asyncio
import json
import time
from uuid import UUID

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.routing import APIRoute
from fastapi.responses import JSONResponse

from app.dependencies.auth import get_optional_user
from app.services.result_storage import pending_records
from app.services.resource_limits import database_call, private_actor, workload
from app.services.supabase_client import ServerDatabaseUnavailable

SUBMISSIONS = {"/api/reading/submit", "/api/reading/submit-full", "/api/listening/submit",
               "/api/listening/submit-full", "/api/writing/submit", "/api/writing/evaluate", "/api/speaking/evaluate"}
# Emergency checkpoints only: at most 32 x 1 MiB, retained for 15 minutes.
# The durable checkpoint is authoritative across workers and restarts.
_recovery: dict[tuple[str, str], tuple[float, dict, list]] = {}


def remember(identity, response, records):
    now = time.monotonic()
    for key, (deadline, _, _) in list(_recovery.items()):
        if deadline <= now:
            del _recovery[key]
    if len(_recovery) < 32 and len(json.dumps([response, records]).encode()) <= 1048576:
        deadline = now + 900
        _recovery[identity] = (deadline, response, records)
        def expire():
            entry = _recovery.get(identity)
            if entry and entry[0] == deadline:
                _recovery.pop(identity, None)
        asyncio.get_running_loop().call_later(900, expire)
        return True
    return False


async def checkpoint(principal, key, response, records):
    await database_call("stage_submission", p_principal=principal, p_key=key,
                        p_response=response, p_records=records)


async def finish(principal, key):
    return await database_call("finish_submission", p_principal=principal, p_key=key)


async def recover_checkpoint(principal: str, key: str) -> bool:
    """Try the bounded emergency buffer without re-running an evaluation."""
    identity = (principal, key)
    cached = _recovery.get(identity)
    if not cached or cached[0] <= time.monotonic():
        _recovery.pop(identity, None)
        return False
    await checkpoint(principal, key, cached[1], cached[2])
    _recovery.pop(identity, None)
    return True


def render(checkpoint):
    return JSONResponse(checkpoint["body"], status_code=checkpoint["status"])


def application_path(scope) -> str:
    """Strip an ASGI mount/proxy prefix, retaining included-router prefixes."""
    path = scope["path"]
    root = scope.get("root_path", "").rstrip("/")
    return path[len(root):] if root and path.startswith(root + "/") else path


class ReliableRoute(APIRoute):
    def get_route_handler(self):
        original = super().get_route_handler()

        async def handle(request: Request):
            path = application_path(request.scope)
            submission = path in SUBMISSIONS and request.method == "POST"
            transcription = path == "/api/speaking/transcribe" and request.method == "POST"
            if path.startswith("/api/listening/audio/") and request.method == "GET":
                user = await get_optional_user(request.headers.get("authorization"))
                actors = [private_actor("ip:" + (request.client.host if request.client else "unknown"))]
                if user:
                    actors.append(private_actor("user:" + user.id))
                async with workload("audio_request", actors):
                    return await original(request)
            if not submission and not transcription:
                return await original(request)

            user = await get_optional_user(request.headers.get("authorization"))
            request.state.verified_authorization = request.headers.get("authorization")
            request.state.verified_user = user
            principal = private_actor("user:" + user.id) if user else private_actor("guest:" + request.headers.get("x-guest-id", ""))
            if not user:
                try:
                    UUID(request.headers.get("x-guest-id", ""))
                except ValueError:
                    raise HTTPException(422, "A valid X-Guest-Id is required.")
            # Only the server's trusted peer address is used, never a raw
            # X-Forwarded-For header supplied by a caller.
            actors = [principal, private_actor("ip:" + (request.client.host if request.client else "unknown"))]
            kind = "transcription" if transcription else "evaluation" if "/evaluate" in path or "/writing/" in path else "scoring"
            async with workload(kind, actors):
                if transcription:
                    return await original(request)
                try:
                    key = str(UUID(request.headers.get("idempotency-key", "")))
                except ValueError:
                    raise HTTPException(422, "A valid Idempotency-Key is required.")
                try:
                    payload = await request.json()
                    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), allow_nan=False)
                except (ValueError, UnicodeError):
                    raise HTTPException(422, "Invalid JSON submission.")
                fingerprint = hashlib.sha256((path + canonical).encode()).hexdigest()
                attempt = await database_call("claim_submission", p_principal=principal, p_key=key,
                                              p_fingerprint=fingerprint, p_user=user.id if user else None)
                state = attempt["state"]
                if state in {"conflict", "expired"}:
                    raise HTTPException(409, "This attempt key cannot be reused. Start a new attempt.")
                if state == "running" and await recover_checkpoint(principal, key):
                    state = "ready"
                if state == "running":
                    raise HTTPException(409, "This attempt is processing or was interrupted. It will not be evaluated again.", headers={"Retry-After": "10"})
                if state in {"ready", "done"}:
                    return render(await finish(principal, key))

                records = []
                context = pending_records.set(records)
                try:
                    try:
                        response = await original(request)
                    except HTTPException as exc:
                        response = JSONResponse({"detail": exc.detail}, status_code=exc.status_code)
                    except RequestValidationError:
                        response = JSONResponse({"detail": "Invalid submission fields."}, status_code=422)
                    body = json.loads(response.body)
                finally:
                    pending_records.reset(context)
                body["attempt_id"] = key
                body["saved"] = False
                body["save_retry_available"] = bool(user and records and response.status_code < 300)
                result = {"body": body, "status": response.status_code}
                if response.status_code >= 300:
                    records = []
                try:
                    await checkpoint(principal, key, result, records)
                except ServerDatabaseUnavailable:
                    retained = remember((principal, key), result, records)
                    body["save_retry_available"] = bool(retained and user and records and response.status_code < 300)
                    return render(result)
                try:
                    return render(await finish(principal, key))
                except ServerDatabaseUnavailable:
                    # The checkpoint is durable; another worker can retry it.
                    return render(result)
        return handle


class RequestSizeLimit:
    """Bound bytes before FastAPI parses JSON or spools a multipart upload."""
    def __init__(self, app):
        self.app = app
        self.active_uploads = 0

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope["method"] not in {"POST", "PUT", "PATCH"}:
            return await self.app(scope, receive, send)
        if self.active_uploads >= 8:
            return await JSONResponse({"detail": "Upload capacity is busy."}, status_code=503, headers={"Retry-After": "10"})(scope, receive, send)
        self.active_uploads += 1
        try:
            return await self.bounded_request(scope, receive, send)
        finally:
            self.active_uploads -= 1

    async def bounded_request(self, scope, receive, send):
        limit = 11 * 1024 * 1024 if application_path(scope) == "/api/speaking/transcribe" else 128 * 1024
        chunks = bytearray()
        try:
            async with asyncio.timeout(30):
                while True:
                    message = await receive()
                    if message["type"] == "http.disconnect":
                        return
                    chunk = message.get("body", b"")
                    if len(chunks) + len(chunk) > limit:
                        return await JSONResponse({"detail": "Request is too large."}, status_code=413)(scope, receive, send)
                    chunks.extend(chunk)
                    if not message.get("more_body", False):
                        break
        except TimeoutError:
            return await JSONResponse({"detail": "Upload timed out."}, status_code=408)(scope, receive, send)
        delivered = False
        async def bounded_receive():
            nonlocal delivered
            if not delivered:
                delivered = True
                return {"type": "http.request", "body": bytes(chunks), "more_body": False}
            return await receive()
        return await self.app(scope, bounded_receive, send)
