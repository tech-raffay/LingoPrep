"""
LingoPrep API — Writing Router
Endpoints for writing prompts, essay submission, and AI-powered evaluation.
"""

from app.services.ai_evaluation import InvalidEvaluation, EvaluationUnavailable
from starlette.concurrency import run_in_threadpool
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
import random
import logging

from app.schemas.models import EssaySubmissionSchema, EssayEvaluationSchema
from app.services import writing_service
from app.services.result_storage import save_owned_record
from app.dependencies.auth import get_optional_user, AuthenticatedUser

from app.services.reliable_routes import ReliableRoute
from app.services.prompts import list_writing_prompts, get_writing_prompt

router = APIRouter(route_class=ReliableRoute)


@router.get("/prompts")
def get_prompts(exam_type: Literal["ielts", "toefl"] = "ielts"):
    prompts = list_writing_prompts(exam_type)
    return {"success": True, "data": prompts, "count": len(prompts)}


@router.get("/prompt/random")
def get_random_prompt(exam_type: Literal["ielts", "toefl"] = "ielts"):
    return {"success": True, "data": random.choice(list_writing_prompts(exam_type))}


class WritingSubmitRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    prompt_id: str = Field(..., min_length=1, max_length=100)
    essay: str = Field(..., min_length=50, max_length=20000)
    user_id: Optional[str] = None


@router.post("/submit")
async def submit_essay(
    req: WritingSubmitRequest,
    user: AuthenticatedUser | None = Depends(get_optional_user)
):

    """
    Submit an essay for AI evaluation and save the result to writing_submissions.
    
    1. Fetches the original prompt from writing_samples or static prompts.
    2. Calls Llama 3 (via Groq) to evaluate the essay.
    3. Saves user_essay, ai_feedback, and score into writing_submissions.
    4. Returns the AI feedback to the frontend.
    """
    prompt_data = await run_in_threadpool(get_writing_prompt, req.prompt_id)

    if not prompt_data:
        raise HTTPException(status_code=404, detail="Prompt not found.")

    prompt_question = prompt_data.get("question", "")
    exam_type = prompt_data.get("exam_type", "ielts")

    # 2. Call the existing evaluate_essay service (Llama 3 via Groq)
    try:
        submission = EssaySubmissionSchema(
            prompt=prompt_question,
            essay_text=req.essay,
            exam_type=exam_type,
            task_type=prompt_data.get("task_type", "2"),
        )
        evaluation = await writing_service.evaluate_essay(
            submission,
            user_id=(user.id if user else None),
            access_token=(user.token if user else None),
        )
    except ValueError as e:
        raise HTTPException(status_code=503, detail="Writing prompt configuration is unavailable.") from e
    except InvalidEvaluation as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    except EvaluationUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e)) from e

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
        "prompt": prompt_question,
        "essay_text": req.essay,
        "exam_type": exam_type,
        "task_type": prompt_data.get("task_type", "2"),
        "word_count": len(req.essay.split()),
        "overall_band": evaluation.overall_band,
        "task_achievement": evaluation.task_achievement,
        "coherence_cohesion": evaluation.coherence_cohesion,
        "lexical_resource": evaluation.lexical_resource,
        "grammatical_range": evaluation.grammatical_range,
        "feedback": evaluation.feedback,
        "suggestions": evaluation.suggestions,
    }
    # Determine user_id
    # Only the verified identity may own a server-written row. Ignore req.user_id.
    current_uid = user.id if user else None
    if current_uid:
        insert_data["user_id"] = current_uid

    try:
        await run_in_threadpool(save_owned_record, "writing_submissions", insert_data, current_uid)
    except Exception as e:
        logging.getLogger(__name__).warning("Writing archive persistence failed (%s)", type(e).__name__)

    # 4. Return feedback to frontend
    return {
        "success": True,
        "feedback": feedback_json,
        "score": evaluation.overall_band,
        # Whether this attempt now appears in the candidate's results.
        "saved": evaluation.saved,
    }


@router.post("/evaluate", response_model=EssayEvaluationSchema)
async def evaluate_essay(submission: EssaySubmissionSchema, user: AuthenticatedUser | None = Depends(get_optional_user)):
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
        evaluation = await writing_service.evaluate_essay(submission, user_id=user.id if user else None)
        return evaluation
    except ValueError as e:
        raise HTTPException(status_code=503, detail="Writing prompt configuration is unavailable.") from e
    except InvalidEvaluation as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    except EvaluationUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
