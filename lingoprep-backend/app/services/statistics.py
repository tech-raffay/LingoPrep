"""Dashboard calculations over historical records, without inventing missing grades."""

import math
from app.services.supabase_client import DatabaseUnavailable

MODULES = ("listening", "reading", "writing", "speaking")
MAX_STATS_ROWS = 10000
PAGE_SIZE = 500


def number(value, maximum):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    return float(value) if math.isfinite(value) and 0 <= value <= maximum else None


def details(row):
    value = row.get("details")
    return value if isinstance(value, dict) else {}


def load_sessions(client, user_id):
    """Page until an empty page, even when the server caps pages below our limit.

    The explicit ceiling fails closed instead of returning partial statistics.
    Offset reads are not a transaction snapshot during concurrent history edits.
    """
    rows = []
    while len(rows) <= MAX_STATS_ROWS:
        page = (client.table("session_logs").select("*").eq("user_id", user_id)
                .order("id").range(len(rows), len(rows) + PAGE_SIZE - 1).execute().data)
        if not page:
            return rows
        rows.extend(page)
    raise DatabaseUnavailable("History is too large for the current statistics service.")


def enrich_sessions(client, rows):
    passage_ids = sorted({s["passage_id"] for s in rows if s.get("passage_id")})
    passages = {}
    # Batch enrichment avoids one network request per attempt.
    for start in range(0, len(passage_ids), 50):
        found = (client.table("passages").select("id,title,exam_type")
                 .in_("id", passage_ids[start:start + 50]).execute().data or [])
        passages.update({p["id"]: p for p in found})
    result = []
    for row in rows:
        row = dict(row)
        passage = passages.get(row.get("passage_id"), {})
        exam = details(row).get("exam_type") or row.get("exam_type") or passage.get("exam_type")
        row["exam_type"] = exam if exam in ("ielts", "toefl") else None
        row["passage_title"] = passage.get("title", "")
        result.append(row)
    return result


def slim_session(row):
    result = {key: row.get(key) for key in (
        "id", "module", "score", "max_score", "percentage", "band_score",
        "created_at", "exam_type", "passage_title")}
    maximum = 30 if row.get("exam_type") == "toefl" else 9
    result["band_score"] = number(row.get("band_score"), maximum)
    for key in ("score", "max_score", "percentage"):
        result[key] = number(row.get(key), 100 if key == "percentage" else 100000)
    result.update(task_type=details(row).get("task_type"),
                  is_full_test=details(row).get("is_full_test") is True)
    return result


def summarise_exam(rows, exam):
    maximum = 9 if exam == "ielts" else 30  # Existing legacy scale; not 2026 TOEFL conversion.
    ordered = sorted(rows, key=lambda row: (row.get("created_at") or "", row.get("id") or ""))
    modules = {}
    for module in MODULES:
        attempts = [row for row in ordered if row.get("module") == module]
        graded = [(row, number(row.get("band_score"), maximum)) for row in attempts]
        graded = [(row, score) for row, score in graded if score is not None]
        scores = [score for _, score in graded]
        latest = graded[-1][0] if graded else None
        raw_subscores = details(latest).get("sub_scores") if latest else None
        subscores = ({key: value for key, raw in raw_subscores.items()
                      if (value := number(raw, maximum)) is not None}
                     if isinstance(raw_subscores, dict) else None)
        modules[module] = {
            "count": len(scores), "attempt_count": len(attempts),
            "unscored_count": len(attempts) - len(scores),
            "avg": round(sum(scores) / len(scores), 2) if scores else 0,
            "first": scores[0] if scores else None, "latest": scores[-1] if scores else None,
            "latest_at": latest.get("created_at") if latest else None,
            "latest_sub_scores": subscores,
        }
    active = [m["avg"] for m in modules.values() if m["count"]]
    overall = (sum(active) / len(active) if exam == "ielts" else sum(active)) if active else 0
    percentages = [value for row in rows if (value := number(row.get("percentage"), 100)) is not None]
    return {
        "modules": modules, "total_sessions": len(rows),
        "average_percentage": round(sum(percentages) / len(percentages), 1) if percentages else 0,
        "overall_band": round(overall, 1), "scored_module_count": len(active),
        "is_complete_summary": len(active) == len(MODULES),
        "summary_kind": "practice_history",  # Never represents one complete mock exam.
        "recent_sessions": [slim_session(row) for row in reversed(ordered[-10:])],
        **{f"{module}_avg": round(value["avg"], 1) for module, value in modules.items()},
    }
