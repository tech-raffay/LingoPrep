"""
LingoPrep API — Writing Router
Endpoints for writing prompts, essay submission, and AI-powered evaluation.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.schemas.models import EssaySubmissionSchema, EssayEvaluationSchema
from app.services import writing_service
from app.services.supabase_client import get_client

router = APIRouter()


@router.get("/prompts")
async def get_prompts():
    """Get writing prompts from the writing_samples table in Supabase."""
    try:
        db = get_client()
        res = db.table("writing_samples").select("id,task_type,question,overall").limit(50).execute()
        prompts = res.data or []
    except Exception:
        prompts = []

    # Fallback to static prompts if DB is empty or fails
    if not prompts:
        prompts = [
            {
                "id": "p1",
                "exam_type": "ielts",
                "task_type": "task2",
                "question": "Some people believe that universities should focus on providing academic skills, while others think they should prepare students for employment. Discuss both views and give your opinion.",
                "overall": 0,
            },
        ]

    return {"success": True, "data": prompts, "count": len(prompts)}


@router.get("/prompt/random")
async def get_random_prompt():
    """Get a single random writing prompt from writing_samples."""
    try:
        db = get_client()
        res = db.table("writing_samples").select("*").limit(20).execute()
        data = res.data or []
    except Exception:
        data = []

    if not data:
        raise HTTPException(status_code=404, detail="No writing prompts found in the database.")

    import random
    prompt = random.choice(data)
    return {"success": True, "data": prompt}


class WritingSubmitRequest(BaseModel):
    prompt_id: str
    essay: str
    user_id: Optional[str] = None


@router.post("/submit")
async def submit_essay(req: WritingSubmitRequest):
    """
    Submit an essay for AI evaluation and save the result to writing_submissions.
    
    1. Fetches the original prompt from writing_samples by prompt_id.
    2. Calls Llama 3 (via Groq) to evaluate the essay.
    3. Saves user_essay, ai_feedback, and score into writing_submissions.
    4. Returns the AI feedback to the frontend.
    """
    db = get_client()

    # 1. Fetch the prompt text from writing_samples
    try:
        prompt_res = db.table("writing_samples").select("*").eq("id", req.prompt_id).single().execute()
        prompt_data = prompt_res.data
    except Exception:
        prompt_data = None

    if not prompt_data:
        raise HTTPException(status_code=404, detail="Prompt not found.")

    prompt_question = prompt_data.get("question", "")

    # 2. Call the existing evaluate_essay service (Llama 3 via Groq)
    try:
        submission = EssaySubmissionSchema(
            prompt=prompt_question,
            essay_text=req.essay,
            exam_type="ielts",
            task_type=prompt_data.get("task_type", "2"),
        )
        evaluation = await writing_service.evaluate_essay(submission)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    # 3. Save to writing_submissions table
    feedback_json = {
        "overall_band": evaluation.overall_band,
        "task_achievement": evaluation.task_achievement,
        "coherence_cohesion": evaluation.coherence_cohesion,
        "lexical_resource": evaluation.lexical_resource,
        "grammatical_range": evaluation.grammatical_range,
        "feedback": evaluation.feedback,
        "suggestions": evaluation.suggestions,
    }
    insert_data = {
        "prompt_id": req.prompt_id,
        "user_essay": req.essay,
        "ai_feedback": feedback_json,
        "score": evaluation.overall_band,
    }
    if req.user_id:
        insert_data["user_id"] = req.user_id

    try:
        db.table("writing_submissions").insert(insert_data).execute()
    except Exception as e:
        print(f"Failed to save writing submission: {e}")

    # 4. Return feedback to frontend
    return {
        "success": True,
        "feedback": feedback_json,
        "score": evaluation.overall_band,
    }


@router.post("/evaluate", response_model=EssayEvaluationSchema)
async def evaluate_essay(submission: EssaySubmissionSchema):
    """
    Submit an essay for AI evaluation (legacy endpoint).
    
    The essay is evaluated by Llama 3 (via Groq) on four IELTS criteria:
    - Task Achievement
    - Coherence & Cohesion
    - Lexical Resource
    - Grammatical Range & Accuracy
    
    Returns band scores, detailed feedback, and improvement suggestions.
    """
    try:
        evaluation = await writing_service.evaluate_essay(submission)
        return evaluation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
