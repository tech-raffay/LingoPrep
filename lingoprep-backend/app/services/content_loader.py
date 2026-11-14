"""
Loads passages (reading) or audio sections (listening) together with their
questions and options in three queries: passages, then all their questions,
then all those questions' options.

The old loaders issued one query per passage and one per question (about 45
round trips for a single IELTS listening test). Each round trip was slow, and
with a new connection per query the backend could run out of memory.
"""

from app.services.supabase_client import get_server_client
from app.schemas.public_content import PUBLIC_QUESTION_COLUMNS, PUBLIC_OPTION_COLUMNS, public_question


def _option_view(o: dict) -> dict:
    return {
        "id": str(o["id"]),
        "text": o["option_text"],
        "label": o["option_label"],
    }


def attach_questions(passages: list[dict]) -> list[dict]:
    """Attach ordered public questions and options, without grading keys,
    to each passage, in place. Returns the same list."""
    if not passages:
        return passages
    client = get_server_client()

    passage_ids = [p["id"] for p in passages]
    questions = (
        client.table("questions").select(PUBLIC_QUESTION_COLUMNS).in_("passage_id", passage_ids).execute().data
        or []
    )
    questions.sort(key=lambda q: (q.get("sort_order") or 0))

    options = []
    question_ids = [q["id"] for q in questions]
    if question_ids:
        options = (
            client.table("options").select(PUBLIC_OPTION_COLUMNS).in_("question_id", question_ids).execute().data
            or []
        )
    options.sort(key=lambda o: (o.get("sort_order") or 0))

    options_by_q: dict[str, list[dict]] = {}
    for o in options:
        options_by_q.setdefault(o["question_id"], []).append(o)

    questions_by_p: dict[str, list[dict]] = {pid: [] for pid in passage_ids}
    for q in questions:
        opts = options_by_q.get(q["id"], [])
        q = public_question(q)
        q["options"] = [_option_view(o) for o in opts]
        questions_by_p.setdefault(q["passage_id"], []).append(q)

    for p in passages:
        p["questions"] = questions_by_p.get(p["id"], [])
    return passages
