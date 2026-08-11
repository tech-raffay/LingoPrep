"""
LingoPrep API — Reading Router
Endpoints for reading passages and MCQ scoring.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.schemas.models import MCQSubmission, MCQResult, FullTestSubmission, FullTestResult
from app.services import reading_service

router = APIRouter()


@router.get("/passages")
async def list_passages(
    exam_type: Optional[str] = Query(None, description="Filter by exam type: ielts or toefl"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: easy, medium, hard"),
):
    """Get all reading passages, optionally filtered by exam type and difficulty."""
    passages = reading_service.get_passages(exam_type=exam_type, difficulty=difficulty)
    return {"success": True, "data": passages, "count": len(passages)}


@router.get("/passages/{passage_id}")
async def get_passage(passage_id: str):
    """Get a single reading passage by ID."""
    passage = reading_service.get_passage_by_id(passage_id)
    if not passage:
        raise HTTPException(status_code=404, detail=f"Passage '{passage_id}' not found")
    return {"success": True, "data": passage}


from app.dependencies.auth import get_optional_user, AuthenticatedUser
from fastapi import Depends

@router.post("/submit", response_model=MCQResult)
async def submit_answers(
    submission: MCQSubmission,
    user: AuthenticatedUser | None = Depends(get_optional_user)
):
    """Submit answers for a reading passage and get scored results."""
    try:
        user_id = user.id if user else None
        result = reading_service.score_submission(submission, user_id=user_id)
        return result

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/submit-full", response_model=FullTestResult)
async def submit_full_test(
    submission: FullTestSubmission,
    user: AuthenticatedUser | None = Depends(get_optional_user)
):
    """Submit answers for a full 40-question Reading test and get detailed band scoring."""
    try:
        user_id = user.id if user else None
        result = reading_service.score_full_test(submission, user_id=user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

