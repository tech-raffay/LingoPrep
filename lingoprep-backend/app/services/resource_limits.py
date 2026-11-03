"""Database-backed admission limits; no unbounded queue or per-worker quota."""

from contextlib import asynccontextmanager
import hashlib
import hmac
import logging
from uuid import uuid4

from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool

from app.config import settings
from app.services.supabase_client import get_server_client, ServerDatabaseUnavailable

logger = logging.getLogger(__name__)
# Requests per hour and simultaneous jobs, shared by all workers.
LIMITS = {"evaluation": (30, 4), "scoring": (120, 12), "transcription": (30, 2), "tts": (60, 2), "audio_request": (120, 12)}


async def database_call(name: str, **parameters):
    return await run_in_threadpool(lambda: get_server_client().rpc(name, parameters))


def private_actor(value: str) -> str:
    # A keyed hash prevents stored IP addresses from being dictionary decoded.
    key = settings.RESOURCE_LIMIT_SECRET
    if len(key) < 32:
        raise ServerDatabaseUnavailable("Resource protection is not configured.")
    return hmac.new(key.encode(), value.encode(), hashlib.sha256).hexdigest()


@asynccontextmanager
async def workload(kind: str, actors: list[str]):
    limit, capacity = LIMITS[kind]
    token = str(uuid4())
    state = await database_call("acquire_workload", p_actors=sorted(set(actors)), p_kind=kind,
                                p_token=token, p_limit=limit, p_capacity=capacity)
    if state != "ok":
        raise HTTPException(429 if state == "quota" else 503,
                            "Request limit reached. Try again later." if state == "quota" else "The service is busy. Try again shortly.",
                            headers={"Retry-After": "60" if state == "quota" else "10"})
    try:
        yield
    finally:
        try:
            await database_call("release_workload", p_token=token)
        except Exception:
            # The lease expires even if the process or database disappears.
            logger.warning("Workload lease release unavailable")
