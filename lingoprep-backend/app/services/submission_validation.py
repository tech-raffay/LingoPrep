"""Load authoritative test content before any scoring or result writes."""

import logging

logger = logging.getLogger(__name__)
OPTION_TYPES = {"multiple_choice", "tfng", "yng"}


class InvalidSubmission(ValueError):
    """The supplied answers do not belong to the requested test."""


class TestContentUnavailable(RuntimeError):
    """Authoritative test content could not be loaded safely."""


def load_full_test(client, module: str, exam: str, answers: list):
    """Return question, correct-option and selected-option maps.

    The current UI presents every passage for one module/exam as one test.
    Derive that same inventory on the server instead of trusting submitted IDs.
    Blank answers are valid, but every expected question must appear once.
    """
    ids = [answer.question_id for answer in answers]
    if not ids or len(ids) != len(set(ids)):
        raise InvalidSubmission("Include each test question exactly once.")

    try:
        passages = client.table("passages").select("id").eq(
            "module", module
        ).eq("exam_type", exam).execute().data or []
        if not passages:
            raise TestContentUnavailable("Test content is unavailable. Please reload the test.")
        questions = client.table("questions").select("*").in_(
            "passage_id", [p["id"] for p in passages]
        ).execute().data or []
        if not questions:
            raise TestContentUnavailable("Test content is unavailable. Please reload the test.")
        question_map = {q["id"]: q for q in questions}
        if set(ids) != set(question_map):
            raise InvalidSubmission("Questions do not match the current test. Please reload it.")
        options = client.table("options").select("*").in_(
            "question_id", list(question_map)
        ).execute().data or []
    except (InvalidSubmission, TestContentUnavailable):
        raise
    except Exception as exc:
        logger.exception("Could not load %s test content", module)
        raise TestContentUnavailable("Test content could not be loaded. Please try again.") from exc

    option_map = {o["id"]: o for o in options}
    correct_map = {}
    for option in options:
        if option.get("is_correct"):
            question_id = option["question_id"]
            if question_id in correct_map:
                raise TestContentUnavailable("Test answer configuration is invalid.")
            correct_map[question_id] = option

    for answer in answers:
        question = question_map[answer.question_id]
        if (question.get("question_type") or "multiple_choice") in OPTION_TYPES:
            if answer.question_id not in correct_map:
                raise TestContentUnavailable("Test answer configuration is incomplete.")
            if answer.answer_text:
                raise InvalidSubmission("Choose an option for option-based questions.")
            if answer.selected_option_id:
                option = option_map.get(answer.selected_option_id)
                if not option or option["question_id"] != answer.question_id:
                    raise InvalidSubmission("A selected option does not belong to its question.")
        else:
            if not question.get("correct_answer_text"):
                raise TestContentUnavailable("Test answer configuration is incomplete.")
            if answer.selected_option_id:
                raise InvalidSubmission("Provide text for text-answer questions.")

    return question_map, correct_map, option_map
