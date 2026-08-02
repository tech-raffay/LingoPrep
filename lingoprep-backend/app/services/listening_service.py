"""
LingoPrep API — Listening Service
Fetches listening audio exercises from Supabase and scores MCQ submissions.
"""

from app.services.supabase_client import get_client
from app.schemas.models import MCQSubmission, MCQResult


def get_audios(exam_type: str = None, difficulty: str = None) -> list[dict]:
    """Retrieve listening audio entries with questions and options from Supabase."""
    client = get_client()

    query = client.table("passages").select("*").eq("module", "listening")
    if exam_type:
        query = query.eq("exam_type", exam_type)
    if difficulty:
        query = query.eq("difficulty", difficulty)

    audios_res = query.execute()
    audios = audios_res.data or []

    for audio in audios:
        questions_res = (
            client.table("questions")
            .select("*")
            .eq("passage_id", audio["id"])
            .order("sort_order")
            .execute()
        )
        questions = questions_res.data or []

        for q in questions:
            options_res = (
                client.table("options")
                .select("*")
                .eq("question_id", q["id"])
                .order("sort_order")
                .execute()
            )
            q["options"] = [
                {
                    "id": str(o["id"]),
                    "text": o["option_text"],
                    "label": o["option_label"],
                    "is_correct": o["is_correct"],
                }
                for o in (options_res.data or [])
            ]
            correct = next((o for o in (options_res.data or []) if o["is_correct"]), None)
            q["correct_option_id"] = str(correct["id"]) if correct else ""

        audio["questions"] = questions

    return audios


def get_audio_by_id(audio_id: str) -> dict | None:
    """Retrieve a single listening audio by ID with questions and options."""
    client = get_client()

    audio_res = (
        client.table("passages")
        .select("*")
        .eq("id", audio_id)
        .eq("module", "listening")
        .single()
        .execute()
    )
    audio = audio_res.data
    if not audio:
        return None

    questions_res = (
        client.table("questions")
        .select("*")
        .eq("passage_id", audio_id)
        .order("sort_order")
        .execute()
    )
    questions = questions_res.data or []

    for q in questions:
        options_res = (
            client.table("options")
            .select("*")
            .eq("question_id", q["id"])
            .order("sort_order")
            .execute()
        )
        q["options"] = [
            {
                "id": str(o["id"]),
                "text": o["option_text"],
                "label": o["option_label"],
                "is_correct": o["is_correct"],
            }
            for o in (options_res.data or [])
        ]
        correct = next((o for o in (options_res.data or []) if o["is_correct"]), None)
        q["correct_option_id"] = str(correct["id"]) if correct else ""

    audio["questions"] = questions
    return audio


def score_submission(submission: MCQSubmission, user_id: str = None) -> MCQResult:
    """Score listening MCQ answers against correct options in the database."""
    client = get_client()

    results = []
    for answer in submission.answers:
        option_res = (
            client.table("options")
            .select("*")
            .eq("id", answer.selected_option_id)
            .single()
            .execute()
        )
        selected_option = option_res.data

        correct_res = (
            client.table("options")
            .select("*")
            .eq("question_id", answer.question_id)
            .eq("is_correct", True)
            .single()
            .execute()
        )
        correct_option = correct_res.data

        question_res = (
            client.table("questions")
            .select("explanation")
            .eq("id", answer.question_id)
            .single()
            .execute()
        )
        question = question_res.data

        is_correct = selected_option and selected_option.get("is_correct", False)

        results.append({
            "question_id": answer.question_id,
            "selected": answer.selected_option_id,
            "correct": str(correct_option["id"]) if correct_option else "",
            "is_correct": is_correct,
            "explanation": question.get("explanation", "") if question else "",
        })

    # Fetch passage to check exam_type
    exam_type = "ielts"
    try:
        passage_res = client.table("passages").select("exam_type").eq("id", submission.passage_id).single().execute()
        if passage_res.data:
            exam_type = passage_res.data.get("exam_type", "ielts")
    except Exception:
        pass

    correct_count = sum(1 for r in results if r["is_correct"])
    total = len(results)
    percentage = round((correct_count / total * 100) if total > 0 else 0, 1)

    if exam_type == "toefl":
        band_score = round((correct_count / total * 30.0) if total > 0 else 0.0, 1)
        max_score = 30.0
    else:
        band_score = _percentage_to_band(percentage)
        max_score = 9.0

    # Log the session
    try:
        client.table("session_logs").insert({
            "user_id": user_id,
            "module": "listening",
            "passage_id": submission.passage_id,
            "score": band_score,
            "max_score": max_score,
            "percentage": percentage,
            "band_score": band_score,
            "details": {"exam_type": exam_type, "results": results},
        }).execute()
    except Exception as e:
        print(f"Failed to log listening session: {str(e)}")


    return MCQResult(
        passage_id=submission.passage_id,
        total_questions=total,
        correct_answers=correct_count,
        score_percentage=percentage,
        results=results,
    )


def _percentage_to_band(percentage: float) -> float:
    """Convert percentage to IELTS band score."""
    if percentage >= 95: return 9.0
    elif percentage >= 87: return 8.5
    elif percentage >= 80: return 8.0
    elif percentage >= 73: return 7.5
    elif percentage >= 65: return 7.0
    elif percentage >= 58: return 6.5
    elif percentage >= 50: return 6.0
    elif percentage >= 42: return 5.5
    elif percentage >= 35: return 5.0
    elif percentage >= 27: return 4.5
    elif percentage >= 20: return 4.0
    else: return 3.0
