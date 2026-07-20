"""
LingoPrep API — Speaking Service
Transcribes student audio via Groq Whisper and evaluates transcripts via Llama 3.
"""

import os
import json
import tempfile
from groq import Groq
from app.config import settings
from app.schemas.models import SpeakingSubmissionSchema, SpeakingEvaluationSchema
from app.services.supabase_client import get_client

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


async def transcribe_audio_file(audio_bytes: bytes, original_filename: str) -> str:
    """
    Upload speech audio bytes to Groq Whisper API and return raw transcription text.
    """
    client = _get_groq_client()
    
    # Securely write to a temporary file
    temp_dir = os.path.join(os.getcwd(), "temp")
    os.makedirs(temp_dir, exist_ok=True)
    
    suffix = os.path.splitext(original_filename)[1] or ".wav"
    with tempfile.NamedTemporaryFile(dir=temp_dir, suffix=suffix, delete=False) as temp_file:
        temp_file.write(audio_bytes)
        temp_file_path = temp_file.name

    try:
        with open(temp_file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=file,
                model="whisper-large-v3",
                response_format="verbose_json",
            )
        return transcription.text
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)


async def evaluate_speaking(submission: SpeakingSubmissionSchema, user_id: str = None) -> SpeakingEvaluationSchema:
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
        db = get_client()
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
            }).execute()
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
