"""
LingoPrep API — Main Application Entry Point

Run with: uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import reading, listening, writing, users

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered IELTS & TOEFL preparation backend — evaluates reading, listening, and writing skills using Llama 3 via Groq.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow the Next.js frontend
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
app.include_router(users.router, prefix="/api/users", tags=["Users"])


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
    """Detailed health check with dependency status."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "supabase_configured": bool(settings.SUPABASE_URL),
        "groq_configured": bool(settings.GROQ_API_KEY),
    }
