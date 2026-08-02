"""
LingoPrep API — Reading Service
Fetches reading passages from Supabase and scores MCQ submissions.
"""

from app.services.supabase_client import get_client
from app.schemas.models import MCQSubmission, MCQResult


def get_passages(exam_type: str = None, difficulty: str = None) -> list[dict]:
    """Retrieve reading passages with their questions and options from Supabase."""
    client = get_client()

    # Fetch passages filtered by module=reading
    query = client.table("passages").select("*").eq("module", "reading")
    if exam_type:
        query = query.eq("exam_type", exam_type)
    if difficulty:
        query = query.eq("difficulty", difficulty)

    passages_res = query.execute()
    passages = passages_res.data or []

    # For each passage, fetch questions + options
    for passage in passages:
        questions_res = (
            client.table("questions")
            .select("*")
            .eq("passage_id", passage["id"])
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
            # Build correct_option_id for frontend compatibility
            correct = next((o for o in (options_res.data or []) if o["is_correct"]), None)
            q["correct_option_id"] = str(correct["id"]) if correct else ""

        passage["questions"] = questions

    return passages


def get_passage_by_id(passage_id: str) -> dict | None:
    """Retrieve a single reading passage by ID with questions and options."""
    client = get_client()

    passage_res = (
        client.table("passages")
        .select("*")
        .eq("id", passage_id)
        .eq("module", "reading")
        .single()
        .execute()
    )
    passage = passage_res.data
    if not passage:
        return None

    questions_res = (
        client.table("questions")
        .select("*")
        .eq("passage_id", passage_id)
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

    passage["questions"] = questions
    return passage


def score_submission(submission: MCQSubmission, user_id: str = None) -> MCQResult:
    """Score MCQ answers by checking against correct options in the database."""
    client = get_client()

    results = []
    for answer in submission.answers:
        # Look up the option the user selected
        option_res = (
            client.table("options")
            .select("*")
            .eq("id", answer.selected_option_id)
            .single()
            .execute()
        )
        selected_option = option_res.data

        # Find the correct option for this question
        correct_res = (
            client.table("options")
            .select("*")
            .eq("question_id", answer.question_id)
            .eq("is_correct", True)
            .single()
            .execute()
        )
        correct_option = correct_res.data

        # Get the question for its explanation
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
            "module": "reading",
            "passage_id": submission.passage_id,
            "score": band_score,
            "max_score": max_score,
            "percentage": percentage,
            "band_score": band_score,
            "details": {"exam_type": exam_type, "results": results},
        }).execute()
    except Exception as e:
        print(f"Failed to log reading session: {str(e)}")


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
