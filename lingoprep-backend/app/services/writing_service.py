"""
LingoPrep API — Writing Service
Evaluates essays using Llama 3 via Groq Cloud API.
"""

import logging
from app.schemas.models import EssaySubmissionSchema, EssayEvaluationSchema
from app.services.result_storage import save_owned_record
from app.services.ai_evaluation import request_evaluation
from starlette.concurrency import run_in_threadpool

logger = logging.getLogger(__name__)


async def evaluate_essay(
    submission: EssaySubmissionSchema, user_id: str | None = None, access_token: str | None = None
) -> EssayEvaluationSchema:
    """
    Evaluate an essay using Llama 3 via Groq.
    
    Args:
        submission: The essay text, prompt, and exam type.
    
    Returns:
        Structured evaluation with band scores and feedback.
    """
    is_toefl = submission.exam_type.value == "toefl"

    user_message = f"""
Exam Type: {submission.exam_type.value.upper()}
{f"Task Type: {submission.task_type}" if submission.task_type else ""}

PROMPT:
{submission.prompt}

STUDENT'S ESSAY:
{submission.essay_text}

Word count: {len(submission.essay_text.split())}
"""

    is_toefl = submission.exam_type.value == "toefl"
    max_score_text = "0-30" if is_toefl else "0-9"
    score_rules_text = "Use integer scores (e.g. 25, 26, 28) for TOEFL." if is_toefl else "Use half-band scores (e.g., 6.5, 7.0)."
    
    system_prompt = f"""You are an expert {"TOEFL iBT" if is_toefl else "IELTS"} writing examiner. Evaluate the following essay based on these criteria:

1. Task Achievement ({max_score_text}): How well does the essay address the prompt?
2. Coherence & Cohesion ({max_score_text}): Is the essay logically organized with clear transitions?
3. Lexical Resource ({max_score_text}): Does the essay use a wide range of vocabulary accurately?
4. Grammatical Range & Accuracy ({max_score_text}): Does the essay demonstrate varied and accurate grammar?

Provide your response as a JSON object with this exact structure:
{{
  "overall_band": <float>,
  "task_achievement": <float>,
  "coherence_cohesion": <float>,
  "lexical_resource": <float>,
  "grammatical_range": <float>,
  "feedback": "<detailed paragraph of feedback>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>", "<suggestion 4>"],
  "improved_version": null
}}

Be fair, constructive, and specific. {score_rules_text}
Return ONLY the JSON object, no other text.
"""

    evaluation_data = await request_evaluation(system_prompt, user_message, submission.exam_type.value, "writing")
    evaluation = EssayEvaluationSchema(**evaluation_data, saved=False)

    # Log session in Supabase
    try:
        is_toefl = submission.exam_type.value == "toefl"
        max_score = 30.0 if is_toefl else 9.0
        percentage = round((evaluation.overall_band / max_score) * 100, 1)

        # user_id and exam_type are what the results dashboard filters on;
        # without them a writing attempt never shows up in anyone's results.
        evaluation.saved = await run_in_threadpool(save_owned_record, "session_logs", {
            "user_id": user_id,
            "module": "writing",
            "score": evaluation.overall_band,
            "max_score": max_score,
            "percentage": percentage,
            "band_score": evaluation.overall_band,
            "details": {
                "exam_type": submission.exam_type.value,
                "task_type": submission.task_type,
                "prompt": submission.prompt,
                "essay_text": submission.essay_text,
                "sub_scores": {
                    "task_achievement": evaluation.task_achievement,
                    "coherence_cohesion": evaluation.coherence_cohesion,
                    "lexical_resource": evaluation.lexical_resource,
                    "grammatical_range": evaluation.grammatical_range,
                },
                "feedback": evaluation.feedback,
                "suggestions": evaluation.suggestions,
            }
        }, user_id)
    except Exception as exc:
        logger.warning("Result persistence failed (%s)", type(exc).__name__)

    return evaluation
