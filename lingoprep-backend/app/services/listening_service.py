"""
LingoPrep API — Listening Service
Fetches listening audio exercises from Supabase and scores MCQ submissions.
"""

from app.services.supabase_client import get_client
from app.schemas.models import MCQSubmission, MCQResult, FullTestSubmission, FullTestResult


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


def _listening_raw_to_band(correct: int) -> float:
    """Convert IELTS Listening raw score (0-40) to band score."""
    if correct >= 39: return 9.0
    elif correct >= 37: return 8.5
    elif correct >= 35: return 8.0
    elif correct >= 32: return 7.5
    elif correct >= 30: return 7.0
    elif correct >= 27: return 6.5
    elif correct >= 23: return 6.0
    elif correct >= 19: return 5.5
    elif correct >= 16: return 5.0
    elif correct >= 13: return 4.5
    elif correct >= 10: return 4.0
    elif correct >= 8: return 3.5
    elif correct >= 6: return 3.0
    elif correct >= 4: return 2.5
    elif correct >= 3: return 2.0
    elif correct >= 2: return 1.5
    elif correct >= 1: return 1.0
    return 0.0


def _toefl_listening_raw_to_scaled(correct: int, total: int) -> float:
    """Convert TOEFL iBT Listening raw score to 0-30 scaled score."""
    if total <= 0:
        return 0.0
    ratio = correct / total
    if ratio >= 1.0: return 30.0
    elif ratio >= 0.95: return 29.0
    elif ratio >= 0.90: return 27.0
    elif ratio >= 0.85: return 26.0
    elif ratio >= 0.80: return 25.0
    elif ratio >= 0.75: return 23.0
    elif ratio >= 0.70: return 22.0
    elif ratio >= 0.65: return 20.0
    elif ratio >= 0.60: return 18.0
    elif ratio >= 0.55: return 16.0
    elif ratio >= 0.50: return 15.0
    elif ratio >= 0.45: return 13.0
    elif ratio >= 0.40: return 11.0
    elif ratio >= 0.35: return 9.0
    elif ratio >= 0.30: return 7.0
    elif ratio >= 0.25: return 5.0
    elif ratio >= 0.20: return 4.0
    elif ratio >= 0.15: return 3.0
    elif ratio >= 0.10: return 2.0
    elif ratio >= 0.05: return 1.0
    return 0.0


def score_full_test(submission: FullTestSubmission, user_id: str = None) -> FullTestResult:
    """Score a full Listening test, calculate band/scaled score, and log the session."""
    client = get_client()
    exam_type = getattr(submission, 'exam_type', 'ielts') or 'ielts'

    question_ids = [ans.question_id for ans in submission.answers]
    selected_option_ids = [ans.selected_option_id for ans in submission.answers if ans.selected_option_id]

    # Batch fetch all correct options
    correct_map = {}
    try:
        correct_res = (
            client.table("options")
            .select("id, question_id")
            .in_("question_id", question_ids)
            .eq("is_correct", True)
            .execute()
        )
        if correct_res and correct_res.data:
            correct_map = {opt["question_id"]: opt for opt in correct_res.data}
    except Exception as e:
        print(f"Error fetching correct options batch: {e}")

    # Batch fetch all questions explanations
    question_map = {}
    try:
        questions_res = (
            client.table("questions")
            .select("id, explanation")
            .in_("id", question_ids)
            .execute()
        )
        if questions_res and questions_res.data:
            question_map = {q["id"]: q for q in questions_res.data}
    except Exception as e:
        print(f"Error fetching questions batch: {e}")

    # Batch fetch user selected options details
    selected_map = {}
    if selected_option_ids:
        try:
            selected_res = (
                client.table("options")
                .select("id, is_correct")
                .in_("id", selected_option_ids)
                .execute()
            )
            if selected_res and selected_res.data:
                selected_map = {opt["id"]: opt for opt in selected_res.data}
        except Exception as e:
            print(f"Error fetching selected options batch: {e}")

    results = []
    for answer in submission.answers:
        selected_option = selected_map.get(answer.selected_option_id)
        correct_option = correct_map.get(answer.question_id)
        question = question_map.get(answer.question_id)

        is_correct = selected_option and selected_option.get("is_correct", False) or False

        results.append({
            "question_id": answer.question_id,
            "selected": answer.selected_option_id,
            "correct": str(correct_option["id"]) if correct_option else "",
            "is_correct": is_correct,
            "explanation": question.get("explanation", "") if question else "",
        })

    correct_count = sum(1 for r in results if r["is_correct"])
    total = len(results)
    percentage = round((correct_count / total * 100) if total > 0 else 0, 1)

    # Use appropriate scoring scale
    if exam_type == "toefl":
        band_score = _toefl_listening_raw_to_scaled(correct_count, total)
        max_score = 30.0
    else:
        band_score = _listening_raw_to_band(correct_count)
        max_score = 9.0

    # Log the session
    try:
        client.table("session_logs").insert({
            "user_id": user_id,
            "module": "listening",
            "passage_id": None,
            "score": band_score,
            "max_score": max_score,
            "percentage": percentage,
            "band_score": band_score,
            "details": {"exam_type": exam_type, "results": results, "is_full_test": True},
        })
    except Exception as e:
        print(f"Failed to log full listening session: {str(e)}")

    return FullTestResult(
        total_questions=total,
        correct_answers=correct_count,
        score_percentage=percentage,
        band_score=band_score,
        results=results,
    )


