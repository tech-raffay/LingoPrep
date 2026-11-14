"""Regression tests using synthetic content; never contact external services."""

import unittest
from copy import deepcopy
from contextlib import contextmanager
from types import SimpleNamespace
from unittest.mock import patch

from pydantic import ValidationError
from app.schemas.models import AnswerSubmission, FullTestSubmission
from app.services import reading_service, listening_service
from app.services.submission_validation import (
    InvalidSubmission, TestContentUnavailable, load_full_test,
)


class ContentDatabase:
    def __init__(self):
        self.rows = {
            "passages": [{"id": "p1", "module": "reading", "exam_type": "ielts"}],
            "questions": [
                {"id": "q1", "passage_id": "p1", "question_type": "multiple_choice"},
                {"id": "q2", "passage_id": "p1", "question_type": "note_completion", "correct_answer_text": "library"},
            ],
            "options": [{"id": "o1", "question_id": "q1", "is_correct": True}],
        }
        self.failed_table = None
        self.writes = []

    def table(self, name):
        return Query(self, name)


class Query:
    def __init__(self, database, table):
        self.database, self.name = database, table
        self.filters = []
        self.is_single = False

    def select(self, fields):
        return self

    def eq(self, field, value):
        self.filters.append(lambda row: row.get(field) == value)
        return self

    def in_(self, field, values):
        self.filters.append(lambda row: row.get(field) in values)
        return self

    def single(self):
        self.is_single = True
        return self

    def execute(self):
        if self.name == self.database.failed_table:
            raise RuntimeError("Synthetic database failure")
        rows = deepcopy([row for row in self.database.rows[self.name]
                         if all(check(row) for check in self.filters)])
        return SimpleNamespace(data=(rows[0] if rows else None) if self.is_single else rows)

    def insert(self, row):
        self.database.writes.append(row)
        return SimpleNamespace(data=[row])


@contextmanager
def patch_database(service, database):
    with patch.object(service, "get_server_client", return_value=database), patch(
        "app.services.result_storage.get_server_client", return_value=database
    ):
        yield


class FullTestValidationTests(unittest.TestCase):
    def setUp(self):
        self.database = ContentDatabase()
        self.answers = [AnswerSubmission(question_id="q1", selected_option_id="o1"),
                        AnswerSubmission(question_id="q2", answer_text="library")]

    def test_valid_answers_score_and_save_for_both_modules(self):
        for module, service in (("reading", reading_service), ("listening", listening_service)):
            with self.subTest(module=module):
                self.database.rows["passages"][0]["module"] = module
                with patch_database(service, self.database):
                    result = service.score_full_test(FullTestSubmission(answers=self.answers), user_id="user")
                self.assertEqual(result.correct_answers, 2)
                self.assertTrue(result.saved)

    def test_blank_answers_are_allowed_but_still_counted(self):
        blank = [AnswerSubmission(question_id="q1"), AnswerSubmission(question_id="q2")]
        with patch_database(reading_service, self.database):
            result = reading_service.score_full_test(FullTestSubmission(answers=blank))
        self.assertEqual(result.total_questions, 2)
        self.assertEqual(result.correct_answers, 0)

    def test_duplicates_missing_and_unknown_questions_are_rejected(self):
        for answers in (self.answers * 2, self.answers[:1],
                        [*self.answers, AnswerSubmission(question_id="unknown")]):
            with self.subTest(answers=answers), self.assertRaises(InvalidSubmission):
                load_full_test(self.database, "reading", "ielts", answers)

    def test_option_from_another_question_is_rejected(self):
        self.database.rows["options"].append({"id": "foreign", "question_id": "q2", "is_correct": False})
        self.answers[0].selected_option_id = "foreign"
        with self.assertRaises(InvalidSubmission):
            load_full_test(self.database, "reading", "ielts", self.answers)

    def test_wrong_exam_cannot_reuse_question_ids(self):
        with self.assertRaises(TestContentUnavailable):
            load_full_test(self.database, "reading", "toefl", self.answers)

    def test_lookup_failure_never_saves_a_score(self):
        for table in ("passages", "questions", "options"):
            for service in (reading_service, listening_service):
                self.database.rows["passages"][0]["module"] = "reading" if service is reading_service else "listening"
                self.database.failed_table = table
                with self.subTest(table=table, service=service.__name__), patch_database(service, self.database):
                    with self.assertLogs("app.services.submission_validation", level="ERROR"):
                        with self.assertRaises(TestContentUnavailable):
                            service.score_full_test(FullTestSubmission(answers=self.answers))
        self.assertEqual(self.database.writes, [])

    def test_missing_answer_key_is_not_treated_as_wrong_answer(self):
        self.database.rows["options"] = []
        with self.assertRaises(TestContentUnavailable):
            load_full_test(self.database, "reading", "ielts", self.answers)

    def test_request_rejects_empty_oversized_and_unknown_exam(self):
        for payload in ({"answers": []}, {"answers": self.answers * 101},
                        {"answers": self.answers, "exam_type": "invented"}):
            with self.subTest(payload=payload), self.assertRaises(ValidationError):
                FullTestSubmission(**payload)


if __name__ == "__main__":
    unittest.main()
