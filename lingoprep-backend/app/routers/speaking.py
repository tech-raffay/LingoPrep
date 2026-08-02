"""
LingoPrep API — Speaking Router
Endpoints for speaking test prompts, audio transcription, and AI-powered evaluation.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from typing import Optional

from app.schemas.models import SpeakingSubmissionSchema, SpeakingEvaluationSchema
from app.services import speaking_service
from app.services.supabase_client import get_client

router = APIRouter()


@router.get("/prompts")
async def list_prompts(
    exam_type: Optional[str] = Query(None, description="Filter by exam type: ielts or toefl"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: easy, medium, hard"),
):
    """Get all speaking test prompts, optionally filtered."""
    try:
        db = get_client()
        query = db.table("passages").select("*").eq("module", "speaking")
        if exam_type:
            query = query.eq("exam_type", exam_type)
        if difficulty:
            query = query.eq("difficulty", difficulty)
        
        res = query.execute()
        prompts = res.data or []
    except Exception:
        prompts = []

    # Fallback to static prompts if DB is empty or fails
    if not prompts:
        prompts = [
            {
                "id": "s1111111-1111-1111-1111-111111111111",
                "title": "IELTS Speaking: Describe a book you read recently",
                "content": "Describe a book you read recently that you found useful. You should say: what the book was, when you read it, what it was about, and explain why you found it useful.",
                "module": "speaking",
                "difficulty": "medium",
                "exam_type": "ielts"
            },
            {
                "id": "s2222222-2222-2222-2222-222222222222",
                "title": "TOEFL Speaking: Online vs In-person Education",
                "content": "Some people prefer to study online, while others prefer to attend traditional face-to-face classes. Which do you prefer and why? Use specific reasons and examples to support your choice.",
                "module": "speaking",
                "difficulty": "medium",
                "exam_type": "toefl"
            }
        ]

    return {"success": True, "data": prompts, "count": len(prompts)}


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe user speaking recording using Groq Whisper."""
    try:
        audio_bytes = await file.read()
        transcript = await speaking_service.transcribe_audio_file(audio_bytes, file.filename)
        return {"success": True, "transcript": transcript}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from app.dependencies.auth import get_optional_user, AuthenticatedUser
from fastapi import Depends

@router.post("/evaluate", response_model=SpeakingEvaluationSchema)
async def evaluate_speaking(
    submission: SpeakingSubmissionSchema,
    user: AuthenticatedUser | None = Depends(get_optional_user)
):
    """Evaluate speech transcript with Llama 3 via Groq."""
    try:
        user_id = user.id if user else None
        evaluation = await speaking_service.evaluate_speaking(submission, user_id=user_id)
        return evaluation

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
