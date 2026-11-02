"""Single-passage routes must enforce the same answer ownership as full tests."""
import unittest
from unittest.mock import patch
from app.schemas.models import MCQSubmission
from app.services import reading_service, listening_service
from app.services.submission_validation import InvalidSubmission, TestContentUnavailable
from test_full_test_validation import ContentDatabase


class PassageScoringTests(unittest.TestCase):
    def test_valid_mixed_answers_save_once_for_each_module(self):
        for module, service in (("reading", reading_service), ("listening", listening_service)):
            database = ContentDatabase()
            database.rows["passages"][0]["module"] = module
            submission = MCQSubmission(passage_id="p1", answers=[
                {"question_id": "q1", "selected_option_id": "o1"},
                {"question_id": "q2", "answer_text": "Library"},
            ])
            with self.subTest(module=module), patch.object(service, "get_client", return_value=database):
                result = service.score_submission(submission, user_id="user")
            self.assertEqual(result.correct_answers, 2)
            self.assertEqual(len(database.writes), 1)
            self.assertEqual(database.writes[0]["user_id"], "user")

    def test_invalid_answers_and_read_failures_never_write(self):
        for failure in ("duplicate", "foreign", "database"):
            database = ContentDatabase()
            answers = [{"question_id": "q1", "selected_option_id": "o1"}, {"question_id": "q2"}]
            if failure == "duplicate":
                answers *= 2
            elif failure == "foreign":
                answers[0]["selected_option_id"] = "foreign"
            else:
                database.failed_table = "questions"
            with self.subTest(failure=failure), patch.object(reading_service, "get_client", return_value=database):
                with self.assertRaises((InvalidSubmission, TestContentUnavailable)):
                    reading_service.score_submission(MCQSubmission(passage_id="p1", answers=answers))
            self.assertEqual(database.writes, [])

    def test_other_passages_do_not_expand_the_expected_question_set(self):
        database = ContentDatabase()
        database.rows["passages"].append({"id": "p2", "module": "reading", "exam_type": "ielts"})
        database.rows["questions"].append({"id": "q3", "passage_id": "p2"})
        with patch.object(reading_service, "get_client", return_value=database):
            result = reading_service.score_submission(MCQSubmission(passage_id="p1", answers=[
                {"question_id": "q1"}, {"question_id": "q2"},
            ]))
        self.assertEqual(result.total_questions, 2)

    def test_wrong_module_and_foreign_questions_never_write(self):
        for failure in ("wrong_module", "foreign_question"):
            database = ContentDatabase()
            if failure == "wrong_module":
                database.rows["passages"][0]["module"] = "listening"
            question_id = "foreign" if failure == "foreign_question" else "q1"
            submission = MCQSubmission(passage_id="p1", answers=[
                {"question_id": question_id}, {"question_id": "q2"},
            ])
            with self.subTest(failure=failure), patch.object(reading_service, "get_client", return_value=database):
                with self.assertRaises(InvalidSubmission):
                    reading_service.score_submission(submission)
            self.assertEqual(database.writes, [])
