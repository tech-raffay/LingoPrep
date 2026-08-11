"""
LingoPrep API — Listening Router
Endpoints for listening audio retrieval and MCQ scoring.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.schemas.models import MCQSubmission, MCQResult, FullTestSubmission, FullTestResult
from app.services import listening_service

router = APIRouter()


@router.get("/audios")
async def list_audios(
    exam_type: Optional[str] = Query(None, description="Filter by exam type: ielts or toefl"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: easy, medium, hard"),
):
    """Get all listening audios, optionally filtered."""
    audios = listening_service.get_audios(exam_type=exam_type, difficulty=difficulty)
    return {"success": True, "data": audios, "count": len(audios)}


@router.get("/audios/{audio_id}")
async def get_audio(audio_id: str):
    """Get a single listening audio by ID."""
    audio = listening_service.get_audio_by_id(audio_id)
    if not audio:
        raise HTTPException(status_code=404, detail=f"Audio '{audio_id}' not found")
    return {"success": True, "data": audio}


from app.dependencies.auth import get_optional_user, AuthenticatedUser
from fastapi import Depends

@router.post("/submit", response_model=MCQResult)
async def submit_answers(
    submission: MCQSubmission,
    user: AuthenticatedUser | None = Depends(get_optional_user)
):
    """Submit answers for a listening exercise and get scored results."""
    try:
        user_id = user.id if user else None
        result = listening_service.score_submission(submission, user_id=user_id)
        return result

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/submit-full", response_model=FullTestResult)
async def submit_full_test(
    submission: FullTestSubmission,
    user: AuthenticatedUser | None = Depends(get_optional_user)
):
    """Submit answers for a full 40-question Listening test and get detailed band scoring."""
    try:
        user_id = user.id if user else None
        result = listening_service.score_full_test(submission, user_id=user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

