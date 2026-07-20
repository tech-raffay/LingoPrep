"""
LingoPrep API — Reading Router
Endpoints for reading passages and MCQ scoring.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.schemas.models import MCQSubmission, MCQResult
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


@router.post("/submit", response_model=MCQResult)
async def submit_answers(submission: MCQSubmission):
    """Submit answers for a reading passage and get scored results."""
    try:
        result = reading_service.score_submission(submission)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
