"""
LingoPrep API — Listening Router
Endpoints for listening audio retrieval and MCQ scoring.
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import FileResponse
from typing import Optional
from uuid import UUID
import logging

from app.schemas.models import MCQSubmission, MCQResult, FullTestSubmission, FullTestResult
from app.services import listening_service, tts_service

router = APIRouter()
logger = logging.getLogger(__name__)


def _audio_response(path) -> FileResponse:
    """The cached MP3. FileResponse answers Range requests, which Safari
    needs and which make seeking (rewind on resume) work."""
    return FileResponse(
        path=str(path),
        media_type="audio/mpeg",
        headers={"Accept-Ranges": "bytes", "Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff"},
    )


@router.get("/audios")
def list_audios(
    background_tasks: BackgroundTasks,
    exam_type: Optional[str] = Query(None, description="Filter by exam type: ielts or toefl"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: easy, medium, hard"),
):
    """Get all listening audios, optionally filtered."""
    audios = listening_service.get_audios(exam_type=exam_type, difficulty=difficulty)
    for a in audios:
        a["transcript_display"] = tts_service.display_transcript(a.get("transcript") or "")

    # Generate missing current recordings before the candidate presses play.
    sources = [
        (a["id"], a.get("transcript") or "", a.get("exam_type") or "ielts")
        for a in sorted(audios, key=lambda a: a["id"])
    ]
    background_tasks.add_task(tts_service.prewarm, sources)

    return {"success": True, "data": audios, "count": len(audios)}


@router.get("/audios/{audio_id}")
def get_audio(audio_id: UUID):
    """Get a single listening audio by ID."""
    audio_id = str(audio_id)
    audio = listening_service.get_audio_by_id(audio_id)
    if not audio:
        raise HTTPException(status_code=404, detail=f"Audio '{audio_id}' not found")
    return {"success": True, "data": audio}


@router.get("/audio/{audio_id}")
async def stream_audio_file(audio_id: UUID):
    """Serve only the fingerprint of the current stored transcript and accent."""
    audio_id = str(audio_id)
    try:
        audio_record = await run_in_threadpool(listening_service.get_audio_source, audio_id)
    except Exception as exc:
        logger.warning("Audio metadata lookup failed (%s)", type(exc).__name__)
        raise HTTPException(status_code=503, detail="Audio is temporarily unavailable.") from exc
    if not audio_record:
        raise HTTPException(status_code=404, detail=f"Audio exercise '{audio_id}' not found")

    transcript = audio_record.get("transcript") or ""
    exam_type = audio_record.get("exam_type") or "ielts"

    if not transcript:
        raise HTTPException(status_code=400, detail="Exercise has no transcript to synthesize")

    # No fallback to an older fingerprint when the current recording is missing.
    try:
        file_path = await tts_service.get_or_generate_audio(audio_id, transcript, exam_type)
        return _audio_response(file_path)
    except Exception as exc:
        logger.warning("Audio generation failed (%s)", type(exc).__name__)
        raise HTTPException(status_code=503, detail="Audio is temporarily unavailable.") from exc


@router.get("/audio-info/{audio_id}")
def get_audio_info(audio_id: UUID):
    """Get metadata about accent, duration, and cache status."""
    audio_id = str(audio_id)
    audio_record = listening_service.get_audio_source(audio_id)
    if not audio_record:
        raise HTTPException(status_code=404, detail=f"Audio exercise '{audio_id}' not found")

    exam_type = audio_record.get("exam_type", "ielts")
    accent_info = tts_service.get_accent_info(exam_type)
    is_cached = tts_service.is_audio_cached(audio_id, audio_record.get("transcript") or "", exam_type)

    return {
        "audio_id": audio_id,
        "exam_type": exam_type,
        "accent_name": accent_info["accent_name"],
        "accent_code": accent_info["accent_code"],
        "is_cached": is_cached,
        "audio_url": f"/api/listening/audio/{audio_id}"
    }


from app.dependencies.auth import get_optional_user, AuthenticatedUser
from fastapi import Depends

@router.post("/submit", response_model=MCQResult)
def submit_answers(
    submission: MCQSubmission,
    user: AuthenticatedUser | None = Depends(get_optional_user)
):
    """Submit answers for a listening exercise and get scored results."""
    try:
        user_id = user.id if user else None
        result = listening_service.score_submission(
            submission, user_id=user_id, access_token=(user.token if user else None)
        )
        return result

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/submit-full", response_model=FullTestResult)
def submit_full_test(
    submission: FullTestSubmission,
    user: AuthenticatedUser | None = Depends(get_optional_user)
):
    """Submit answers for a full 40-question Listening test and get detailed band scoring."""
    try:
        user_id = user.id if user else None
        result = listening_service.score_full_test(
            submission, user_id=user_id, access_token=(user.token if user else None)
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

