"""
LingoPrep API — Main Application Entry Point

Run with: uvicorn app.main:app --reload
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.services.supabase_client import ServerDatabaseUnavailable, DatabaseUnavailable, start_http_client, close_http_client
from app.services.tts_service import shutdown_audio_tasks

from app.services.reliable_routes import RequestSizeLimit
from app.config import settings
from app.routers import reading, listening, writing, users, speaking, attempts

@asynccontextmanager
async def lifespan(app):
    start_http_client()
    try:
        yield
    finally:
        try:
            await shutdown_audio_tasks()
        finally:
            close_http_client()


app = FastAPI(
    lifespan=lifespan,
    title=settings.APP_NAME,
    description="AI-powered IELTS & TOEFL preparation backend. Evaluates reading, listening, writing, and speaking skills using Llama 3 and Whisper via Groq.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

@app.exception_handler(DatabaseUnavailable)
async def database_unavailable(request, exc):
    return JSONResponse(status_code=503, content={"detail": "Database operation is temporarily unavailable."})


# CORS — allow the Next.js frontend
@app.exception_handler(ServerDatabaseUnavailable)
async def protected_database_unavailable(request, exc):
    return JSONResponse(status_code=503, content={"detail": "Protected database access is unavailable."})


app.add_middleware(RequestSizeLimit)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(reading.router, prefix="/api/reading", tags=["Reading"])
app.include_router(listening.router, prefix="/api/listening", tags=["Listening"])
app.include_router(writing.router, prefix="/api/writing", tags=["Writing"])
app.include_router(speaking.router, prefix="/api/speaking", tags=["Speaking"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(attempts.router, prefix="/api/attempts", tags=["Attempts"])


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "message": f"{settings.APP_NAME} is running",
        "version": settings.APP_VERSION,
        "status": "healthy",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Process liveness only; configuration checks live at /ready."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "supabase_configured": bool(settings.SUPABASE_URL),
        "groq_configured": bool(settings.GROQ_API_KEY),
    }


@app.get("/ready", tags=["Health"])
def readiness():
    """Configuration readiness only; no provider calls or claim of dependency health."""
    checks = {
        "supabase": bool(settings.SUPABASE_URL and settings.SUPABASE_KEY),
        "server_database": bool(settings.SUPABASE_SERVICE_ROLE_KEY
                                and settings.SUPABASE_SERVICE_ROLE_KEY != settings.SUPABASE_KEY),
        "resource_limits": len(settings.RESOURCE_LIMIT_SECRET) >= 32,
        "evaluation": bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY != "your-groq-api-key"),
    }
    ready = all(checks.values())
    return JSONResponse(status_code=200 if ready else 503, content={
        "status": "configured" if ready else "not_ready", "checks": checks,
        "scope": "configuration_only",
    })
