"""Validation and persistence for the legacy single-passage endpoints."""

import logging
from collections.abc import Callable

from app.services.result_storage import save_owned_record
from app.schemas.models import MCQResult, MCQSubmission
from app.services.submission_validation import (
    InvalidSubmission, TestContentUnavailable, OPTION_TYPES, load_full_test,
)

logger = logging.getLogger(__name__)


def score_passage(client, module: str, submission: MCQSubmission, user_id: str | None,
                  percentage_to_band: Callable[[float], float],
                  text_matches: Callable[[str, str], bool]) -> MCQResult:
    """Derive the exam from storage; never score questions outside this passage."""
    try:
        passages = client.table("passages").select("id,exam_type").eq(
            "id", submission.passage_id
        ).eq("module", module).execute().data or []
    except Exception as exc:
        logger.exception("Could not load passage for scoring")
        raise TestContentUnavailable("Test content could not be loaded. Please try again.") from exc
    if not passages:
        raise InvalidSubmission("Passage does not belong to this module.")
    exam = passages[0].get("exam_type")
    if exam not in {"ielts", "toefl"}:
        raise TestContentUnavailable("Passage exam configuration is invalid.")
    questions, correct_options, options = load_full_test(
        client, module, exam, submission.answers, passage_id=submission.passage_id
    )

    results = []
    for answer in submission.answers:
        question = questions[answer.question_id]
        kind = question.get("question_type") or "multiple_choice"
        correct_text = question.get("correct_answer_text") or ""
        correct_option = correct_options.get(answer.question_id)
        if kind in OPTION_TYPES:
            selected = options.get(answer.selected_option_id)
            correct = bool(selected and selected.get("is_correct"))
        else:
            correct = text_matches(answer.answer_text, correct_text)
        results.append({
            "question_id": answer.question_id, "question_type": kind,
            "selected": answer.selected_option_id, "answer_text": answer.answer_text,
            "correct": correct_option["id"] if correct_option else "",
            "correct_answer_text": correct_text, "is_correct": correct,
            "explanation": question.get("explanation") or "",
        })

    count = sum(result["is_correct"] for result in results)
    percentage = round(count / len(results) * 100, 1)
    # Preserve the legacy passage scale; full-test calibration is separate.
    score = round(count / len(results) * 30, 1) if exam == "toefl" else percentage_to_band(percentage)
    try:
        save_owned_record("session_logs", {
            "user_id": user_id, "module": module, "passage_id": submission.passage_id,
            "score": score, "max_score": 30.0 if exam == "toefl" else 9.0,
            "percentage": percentage, "band_score": score,
            "details": {"exam_type": exam, "results": results},
        }, user_id)
    except Exception:
        # Legacy response has no save-status field; retain feedback on save failure.
        logger.exception("Could not save %s passage result", module)
    return MCQResult(passage_id=submission.passage_id, total_questions=len(results),
                     correct_answers=count, score_percentage=percentage, results=results)
