"""
LingoPrep API — Listening Router
Endpoints for listening audio retrieval and MCQ scoring.
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from typing import Optional

from app.schemas.models import MCQSubmission, MCQResult, FullTestSubmission, FullTestResult
from app.services import listening_service, tts_service

router = APIRouter()


@router.get("/audios")
def list_audios(
    exam_type: Optional[str] = Query(None, description="Filter by exam type: ielts or toefl"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: easy, medium, hard"),
):
    """Get all listening audios, optionally filtered."""
    audios = listening_service.get_audios(exam_type=exam_type, difficulty=difficulty)
    return {"success": True, "data": audios, "count": len(audios)}


@router.get("/audios/{audio_id}")
def get_audio(audio_id: str):
    """Get a single listening audio by ID."""
    audio = listening_service.get_audio_by_id(audio_id)
    if not audio:
        raise HTTPException(status_code=404, detail=f"Audio '{audio_id}' not found")
    return {"success": True, "data": audio}


@router.get("/audio/{audio_id}")
async def stream_audio_file(audio_id: str):
    """Stream authentic regional accent MP3 audio for this exercise (British for IELTS, US for TOEFL)."""
    # 1. Check if already cached
    cached_path = tts_service.get_audio_file_path(audio_id)
    if cached_path.exists() and cached_path.stat().st_size > 0:
        return FileResponse(
            path=str(cached_path),
            media_type="audio/mpeg",
            headers={"Accept-Ranges": "bytes"}
        )

    # 2. If not, fetch transcript and exam_type from DB
    audio_record = listening_service.get_audio_by_id(audio_id)
    if not audio_record:
        raise HTTPException(status_code=404, detail=f"Audio exercise '{audio_id}' not found")

    transcript = audio_record.get("transcript", "")
    exam_type = audio_record.get("exam_type", "ielts")

    if not transcript:
        raise HTTPException(status_code=400, detail="Exercise has no transcript to synthesize")

    # 3. Synthesize and cache
    try:
        file_path = await tts_service.get_or_generate_audio(audio_id, transcript, exam_type)
        return FileResponse(
            path=str(file_path),
            media_type="audio/mpeg",
            headers={"Accept-Ranges": "bytes"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate accented audio: {str(e)}")


@router.get("/audio-info/{audio_id}")
def get_audio_info(audio_id: str):
    """Get metadata about accent, duration, and cache status."""
    audio_record = listening_service.get_audio_by_id(audio_id)
    if not audio_record:
        raise HTTPException(status_code=404, detail=f"Audio exercise '{audio_id}' not found")

    exam_type = audio_record.get("exam_type", "ielts")
    accent_info = tts_service.get_accent_info(exam_type)
    is_cached = tts_service.is_audio_cached(audio_id)

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

