"""
Loads passages (reading) or audio sections (listening) together with their
questions and options in three queries: passages, then all their questions,
then all those questions' options.

The old loaders issued one query per passage and one per question (about 45
round trips for a single IELTS listening test). Each round trip was slow, and
with a new connection per query the backend could run out of memory.
"""

from app.services.supabase_client import get_client


def _option_view(o: dict) -> dict:
    return {
        "id": str(o["id"]),
        "text": o["option_text"],
        "label": o["option_label"],
        "is_correct": o["is_correct"],
    }


def attach_questions(passages: list[dict], reading_defaults: bool = False) -> list[dict]:
    """Attach ordered questions (with ordered options and correct_option_id)
    to each passage, in place. Returns the same list."""
    if not passages:
        return passages
    client = get_client()

    passage_ids = [p["id"] for p in passages]
    questions = (
        client.table("questions").select("*").in_("passage_id", passage_ids).execute().data
        or []
    )
    questions.sort(key=lambda q: (q.get("sort_order") or 0))

    options = []
    question_ids = [q["id"] for q in questions]
    if question_ids:
        options = (
            client.table("options").select("*").in_("question_id", question_ids).execute().data
            or []
        )
    options.sort(key=lambda o: (o.get("sort_order") or 0))

    options_by_q: dict[str, list[dict]] = {}
    for o in options:
        options_by_q.setdefault(o["question_id"], []).append(o)

    questions_by_p: dict[str, list[dict]] = {pid: [] for pid in passage_ids}
    for q in questions:
        if reading_defaults:
            # New columns default sensibly even if the migration has not run.
            q.setdefault("question_type", "multiple_choice")
            q.setdefault("question_group_label", "")
            q.setdefault("correct_answer_text", "")
            q.setdefault("question_data", {})
        opts = options_by_q.get(q["id"], [])
        q["options"] = [_option_view(o) for o in opts]
        correct = next((o for o in opts if o["is_correct"]), None)
        q["correct_option_id"] = str(correct["id"]) if correct else ""
        questions_by_p.setdefault(q["passage_id"], []).append(q)

    for p in passages:
        p["questions"] = questions_by_p.get(p["id"], [])
    return passages
