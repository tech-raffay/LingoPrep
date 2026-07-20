"""
LingoPrep API — Writing Router
Endpoints for essay submission and AI-powered evaluation.
"""

from fastapi import APIRouter, HTTPException

from app.schemas.models import EssaySubmissionSchema, EssayEvaluationSchema
from app.services import writing_service

router = APIRouter()


@router.post("/evaluate", response_model=EssayEvaluationSchema)
async def evaluate_essay(submission: EssaySubmissionSchema):
    """
    Submit an essay for AI evaluation.
    
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


@router.get("/prompts")
async def get_prompts():
    """Get available writing prompts."""
    # Sample prompts — will be fetched from Supabase
    prompts = [
        {
            "id": "p1",
            "exam_type": "ielts",
            "task_type": "task2",
            "prompt": "Some people believe that universities should focus on providing academic skills, while others think they should prepare students for employment. Discuss both views and give your opinion.",
            "min_words": 250,
        },
        {
            "id": "p2",
            "exam_type": "toefl",
            "task_type": "independent",
            "prompt": "Do you agree or disagree with the following statement? Technology has made our lives more complicated rather than simpler. Use specific reasons and examples to support your answer.",
            "min_words": 300,
        },
    ]
    return {"success": True, "data": prompts, "count": len(prompts)}
