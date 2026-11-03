"""Strict provider contracts and bounded async evaluation requests."""
import asyncio
import json
from typing import Annotated

from groq import AsyncGroq
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from app.config import settings

EVALUATION_DEADLINE_SECONDS = 45

Score = Annotated[float, Field(strict=True, ge=0, le=30, allow_inf_nan=False)]
Text = Annotated[str, Field(min_length=1, max_length=8000)]

class EvaluationUnavailable(RuntimeError):
    pass

class InvalidEvaluation(RuntimeError):
    pass

class ProviderFeedback(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    feedback: Text
    suggestions: list[Annotated[str, Field(min_length=1, max_length=1000)]] = Field(min_length=1, max_length=8)

class WritingFeedback(ProviderFeedback):
    overall_band: Score
    task_achievement: Score
    coherence_cohesion: Score
    lexical_resource: Score
    grammatical_range: Score
    improved_version: Text | None = None

class TranscriptFeedback(ProviderFeedback):
    """Text supports language feedback, not acoustic or complete-exam grades."""


def validate_output(content: str, exam: str, module: str) -> dict:
    try:
        model = WritingFeedback if module == "writing" else TranscriptFeedback
        result = model.model_validate(json.loads(content))
        if module == "writing":
            maximum = 9 if exam == "ielts" else 30
            scores = [getattr(result, name) for name in (
                "overall_band", "task_achievement", "coherence_cohesion",
                "lexical_resource", "grammatical_range")]
            if any(score > maximum for score in scores):
                raise ValueError("Out of range")
            step = 0.5 if exam == "ielts" else 1
            if any(score / step != round(score / step) for score in scores):
                raise ValueError("Invalid score increment")
        return result.model_dump()
    except (ValueError, TypeError, ValidationError) as exc:
        raise InvalidEvaluation("The evaluation service returned an invalid result. Please retry.") from exc


async def request_evaluation(system: str, message: str, exam: str, module: str) -> dict:
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your-groq-api-key":
        raise EvaluationUnavailable("Evaluation is temporarily unavailable.")

    async def request():
        async with AsyncGroq(api_key=settings.GROQ_API_KEY, timeout=30, max_retries=1) as client:
            return await client.chat.completions.create(
                messages=[{"role": "system", "content": system}, {"role": "user", "content": message}],
                model=settings.GROQ_MODEL, temperature=0.3, max_tokens=1500,
                response_format={"type": "json_object"},
            )
    try:
        response = await asyncio.wait_for(request(), timeout=EVALUATION_DEADLINE_SECONDS)
    except Exception as exc:
        raise EvaluationUnavailable("Evaluation is temporarily unavailable. Please retry.") from exc
    try:
        choice = response.choices[0]
        if choice.finish_reason != "stop":
            raise ValueError("Incomplete evaluation")
        content = choice.message.content
        if not isinstance(content, str) or len(content) > 20000:
            raise ValueError("Invalid content")
    except (IndexError, AttributeError, TypeError, ValueError) as exc:
        raise InvalidEvaluation("The evaluation service returned an incomplete result. Please retry.") from exc
    return validate_output(content, exam, module)
