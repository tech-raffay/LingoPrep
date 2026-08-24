"""
LingoPrep API — Writing Service
Evaluates essays using Llama 3 via Groq Cloud API.
"""

import json
from groq import Groq
from app.config import settings
from app.schemas.models import EssaySubmissionSchema, EssayEvaluationSchema
from app.services.supabase_client import get_client



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
    is_toefl = submission.exam_type.value == "toefl"

    if not settings.GROQ_API_KEY:
        if is_toefl:
            return EssayEvaluationSchema(
                overall_band=26.0,
                task_achievement=27.0,
                coherence_cohesion=25.0,
                lexical_resource=26.0,
                grammatical_range=26.0,
                feedback="Demo Mode: Your essay is well-structured and addresses the prompt effectively. The grammar is mostly accurate with only minor errors. Vocabulary usage is appropriate for a TOEFL iBT academic essay.",
                suggestions=[
                    "Expand on your supporting details with more concrete examples.",
                    "Use more varied sentence structures to improve coherence.",
                    "Pay closer attention to article usage (a, an, the)."
                ],
                improved_version="In my opinion, the arts and humanities deserve equal support compared to STEM subjects. While STEM fields are crucial for technological advancement, the arts foster critical thinking and empathy..."
            )
        else:
            return EssayEvaluationSchema(
                overall_band=7.0,
                task_achievement=7.5,
                coherence_cohesion=7.0,
                lexical_resource=6.5,
                grammatical_range=7.0,
                feedback="Demo Mode: The essay displays a clear response to the prompt and maintains logical organization throughout. Some transition phrases can be polished.",
                suggestions=[
                    "Improve cohesion by using varied linking words.",
                    "Include more complex sentence structures.",
                    "Diversify vocabulary with synonyms of common words."
                ],
                improved_version="Some people believe that universities should focus on providing academic skills, while others think they should prepare students for employment. Discuss both views..."
            )

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

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            model=settings.GROQ_MODEL,
            temperature=0.3,
            max_tokens=1500,
            response_format={"type": "json_object"},
        )

        response_text = chat_completion.choices[0].message.content
        evaluation_data = json.loads(response_text)
        
        evaluation = EssayEvaluationSchema(**evaluation_data)

        # Log session in Supabase
        try:
            db = get_client()
            is_toefl = submission.exam_type.value == "toefl"
            max_score = 30.0 if is_toefl else 9.0
            percentage = round((evaluation.overall_band / max_score) * 100, 1)

            db.table("session_logs").insert({
                "module": "writing",
                "score": evaluation.overall_band,
                "max_score": max_score,
                "percentage": percentage,
                "band_score": evaluation.overall_band,
                "details": {
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
            }).execute()
        except Exception as e:
            print(f"Failed to log writing session: {str(e)}")

        return evaluation

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
