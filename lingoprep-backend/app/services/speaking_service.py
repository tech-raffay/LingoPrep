"""
LingoPrep API — Speaking Service
Transcribes student audio via Groq Whisper and evaluates transcripts via Llama 3.
"""

import asyncio
import json

from groq import Groq, AsyncGroq
from app.config import settings
from app.schemas.models import SpeakingSubmissionSchema, SpeakingEvaluationSchema
from app.services.supabase_client import get_client

TRANSCRIPTION_DEADLINE_SECONDS = 45

EVALUATION_SYSTEM_PROMPT = """You are an expert IELTS/TOEFL speaking examiner. Evaluate the following spoken response based on the exam type.

For IELTS:
Evaluate on these four criteria:
1. Pronunciation & Fluency (0-9)
2. Grammatical Range & Accuracy (0-9)
3. Lexical Resource (0-9)
4. Coherence & Cohesion (0-9)
Overall Band: Average of the four (half-band accuracy, e.g., 6.5, 7.0).

For TOEFL:
Evaluate on these four criteria scaled to the TOEFL iBT Speaking system:
1. Delivery / Pronunciation & Fluency (0-4)
2. Language Use / Grammar (0-4)
3. Language Use / Lexical Resource (0-4)
4. Topic Development / Coherence & Structure (0-4)
Overall Score: Map to TOEFL iBT Speaking score (0-30 scaled score).
Note: Map the subscores from 0-4 as floats, but map the overall_band to the 0-30 TOEFL scale.

Provide your response as a JSON object with this exact structure:
{
  "overall_band": <float>,
  "pronunciation_fluency": <float>,
  "grammar": <float>,
  "lexical_resource": <float>,
  "coherence_structure": <float>,
  "feedback": "<detailed paragraph of feedback, highlighting filler words, grammar, and fluency issues>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>", "<suggestion 4>"]
}

Be fair, constructive, and specific. Return ONLY the JSON object, no other text.
"""


def _get_groq_client() -> Groq:
    """Initialize Groq client with API key."""
    if not settings.GROQ_API_KEY:
        raise ValueError(
            "Groq API key not configured. Set GROQ_API_KEY in your .env file."
        )
    return Groq(api_key=settings.GROQ_API_KEY)


async def transcribe_audio_file(audio_bytes: bytes, extension: str, mime: str) -> str:
    """Send validated bytes without using the caller's filename or retaining audio."""
    if not settings.GROQ_API_KEY:
        raise RuntimeError("Transcription provider is not configured.")
    async def request_transcription():
        async with AsyncGroq(api_key=settings.GROQ_API_KEY, timeout=30, max_retries=1) as client:
            transcription = await client.audio.transcriptions.create(
                file=(f"recording.{extension}", audio_bytes, mime),
                model="whisper-large-v3",
                response_format="verbose_json",
            )
            return transcription.text

    # A total deadline also bounds retries; the async client does not block the loop.
    return await asyncio.wait_for(request_transcription(), timeout=TRANSCRIPTION_DEADLINE_SECONDS)


async def evaluate_speaking(
    submission: SpeakingSubmissionSchema, user_id: str = None, access_token: str = None
) -> SpeakingEvaluationSchema:
    """
    Evaluate a spoken response transcript using Llama 3 via Groq and log session in Supabase.
    """
    client = _get_groq_client()

    user_message = f"""
Exam Type: {submission.exam_type.value.upper()}
{f"Task Type: {submission.task_type}" if submission.task_type else ""}

PROMPT / QUESTION:
{submission.prompt}

STUDENT'S SPOKEN TRANSCRIPT:
{submission.transcript}

Word count: {len(submission.transcript.split())}
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
        
        evaluation = SpeakingEvaluationSchema(**evaluation_data)

        # Log session in Supabase
        db = get_client(access_token)
        try:
            # Map score to percentage
            # For IELTS, percentage is (band / 9) * 100
            # For TOEFL, percentage is (score / 30) * 100
            is_toefl = submission.exam_type.value == "toefl"
            max_score = 30.0 if is_toefl else 9.0
            percentage = round((evaluation.overall_band / max_score) * 100, 1)

            db.table("session_logs").insert({
                "user_id": user_id,
                "module": "speaking",
                "score": evaluation.overall_band,
                "max_score": max_score,
                "percentage": percentage,
                "band_score": evaluation.overall_band,
                "details": {
                    "exam_type": submission.exam_type.value,
                    "prompt": submission.prompt,
                    "transcript": submission.transcript,
                    "sub_scores": {
                        "pronunciation_fluency": evaluation.pronunciation_fluency,
                        "grammar": evaluation.grammar,
                        "lexical_resource": evaluation.lexical_resource,
                        "coherence_structure": evaluation.coherence_structure,
                    },
                    "feedback": evaluation.feedback,
                    "suggestions": evaluation.suggestions,
                }
            })  # this client sends the insert immediately; there is no .execute()
            evaluation.saved = bool(user_id)
        except Exception as e:
            # Silent fail so user still gets feedback
            print(f"Failed to log speaking session: {str(e)}")

        return evaluation

    except json.JSONDecodeError:
        return SpeakingEvaluationSchema(
            overall_band=0,
            pronunciation_fluency=0,
            grammar=0,
            lexical_resource=0,
            coherence_structure=0,
            feedback="Error: Could not parse AI evaluation. Please try again.",
            suggestions=["Retry the evaluation"],
        )
    except Exception as e:
        raise RuntimeError(f"Groq API error: {str(e)}")
