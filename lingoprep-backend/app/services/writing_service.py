"""
LingoPrep API — Writing Service
Evaluates essays using Llama 3 via Groq Cloud API.
"""

import json
from groq import Groq
from app.config import settings
from app.schemas.models import EssaySubmissionSchema, EssayEvaluationSchema


EVALUATION_SYSTEM_PROMPT = """You are an expert IELTS/TOEFL writing examiner. Evaluate the following essay based on these criteria:

1. Task Achievement (0-9): How well does the essay address the prompt?
2. Coherence & Cohesion (0-9): Is the essay logically organized with clear transitions?
3. Lexical Resource (0-9): Does the essay use a wide range of vocabulary accurately?
4. Grammatical Range & Accuracy (0-9): Does the essay demonstrate varied and accurate grammar?

Provide your response as a JSON object with this exact structure:
{
  "overall_band": <float>,
  "task_achievement": <float>,
  "coherence_cohesion": <float>,
  "lexical_resource": <float>,
  "grammatical_range": <float>,
  "feedback": "<detailed paragraph of feedback>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>", "<suggestion 4>"],
  "improved_version": null
}

Be fair, constructive, and specific. Use half-band scores (e.g., 6.5, 7.0).
Return ONLY the JSON object, no other text.
"""


def _get_groq_client() -> Groq:
    """Initialize Groq client with API key."""
    if not settings.GROQ_API_KEY:
        raise ValueError(
            "Groq API key not configured. Set GROQ_API_KEY in your .env file."
        )
    return Groq(api_key=settings.GROQ_API_KEY)


async def evaluate_essay(submission: EssaySubmissionSchema) -> EssayEvaluationSchema:
    """
    Evaluate an essay using Llama 3 via Groq.
    
    Args:
        submission: The essay text, prompt, and exam type.
    
    Returns:
        Structured evaluation with band scores and feedback.
    """
    client = _get_groq_client()

    user_message = f"""
Exam Type: {submission.exam_type.value.upper()}
{f"Task Type: {submission.task_type}" if submission.task_type else ""}

PROMPT:
{submission.prompt}

STUDENT'S ESSAY:
{submission.essay_text}

Word count: {len(submission.essay_text.split())}
"""

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": EVALUATION_SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            model=settings.GROQ_MODEL,
            temperature=0.3,
            max_tokens=1500,
            response_format={"type": "json_object"},
        )

        response_text = chat_completion.choices[0].message.content
        evaluation_data = json.loads(response_text)

        return EssayEvaluationSchema(**evaluation_data)

    except json.JSONDecodeError:
        # Fallback if LLM doesn't return valid JSON
        return EssayEvaluationSchema(
            overall_band=0,
            task_achievement=0,
            coherence_cohesion=0,
            lexical_resource=0,
            grammatical_range=0,
            feedback="Error: Could not parse AI evaluation. Please try again.",
            suggestions=["Retry the evaluation"],
        )
    except Exception as e:
        raise RuntimeError(f"Groq API error: {str(e)}")
