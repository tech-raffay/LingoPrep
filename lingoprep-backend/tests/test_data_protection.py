"""Exercise public responses and credential/ownership boundaries without a network."""

import json
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch

from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.config import settings
from app.dependencies.auth import AuthenticatedUser, get_optional_user
from app.main import app
from app.routers import writing
from app.schemas.models import FullTestSubmission, EssaySubmissionSchema, SpeakingSubmissionSchema
from app.services import content_loader, reading_service, listening_service, supabase_client, writing_service, speaking_service
from app.services.result_storage import save_owned_record
from test_full_test_validation import ContentDatabase, patch_database


class ContentProtectionTests(unittest.TestCase):
    def test_list_and_detail_responses_exclude_answer_keys(self):
        database = ContentDatabase()
        database.rows["questions"][0].update({
            "question_text": "Choose a building", "explanation": "SECRET explanation",
            "correct_option_id": "SECRET option", "future_answer_key": "SECRET future",
            "question_data": {
                "instruction": "Choose one answer", "answers": ["SECRET nested"],
                "headings": [{"label": "A", "text": "A library", "answer": "SECRET heading"}],
                "notes": [{"heading": "Place", "items": ["___"], "solution": "SECRET note"}],
            },
        })
        database.rows["options"][0].update(option_text="Library", option_label="A")
        with TestClient(app) as api, patch.object(content_loader, "get_server_client", return_value=database), patch.object(
            reading_service, "get_client", return_value=database
        ), patch.object(listening_service, "get_client", return_value=database), patch(
            "app.services.tts_service.prewarm", new=AsyncMock()
        ):
            for module, path in (("reading", "passages"), ("listening", "audios")):
                database.rows["passages"][0]["module"] = module
                for suffix in (path, f"{path}/p1"):
                    with self.subTest(module=module, path=suffix):
                        response = api.get(f"/api/{module}/{suffix}")
                        self.assertEqual(response.status_code, 200)
                        body = response.json()["data"]
                        passage = body[0] if isinstance(body, list) else body
                        question = passage["questions"][0]
                        self.assertEqual(question["options"], [{"id": "o1", "text": "Library", "label": "A"}])
                        self.assertEqual(question["question_data"]["headings"], [{"label": "A", "text": "A library"}])
                        for forbidden in ("is_correct", "correct_option_id", "correct_answer_text", "explanation", "SECRET"):
                            self.assertNotIn(forbidden, response.text)
        self.assertEqual(database.rows["questions"][1]["correct_answer_text"], "library")

    def test_guest_can_score_but_does_not_store_a_record(self):
        database = ContentDatabase()
        submission = FullTestSubmission(answers=[{"question_id": "q1"}, {"question_id": "q2"}])
        for module, service in (("reading", reading_service), ("listening", listening_service)):
            database.rows["passages"][0]["module"] = module
            with self.subTest(module=module), patch_database(service, database):
                result = service.score_full_test(submission)
            self.assertFalse(result.saved)
            self.assertEqual(database.writes, [])
            self.assertIn("correct_answer_text", result.results[0])  # Review remains available after submission.

    def test_missing_server_key_returns_503_without_anon_fallback(self):
        with patch.object(settings, "SUPABASE_SERVICE_ROLE_KEY", ""), TestClient(app) as api, patch.object(
            supabase_client._http, "get"
        ) as network:
            response = api.post("/api/reading/submit-full", json={"answers": [{"question_id": "q1"}]})
        self.assertEqual(response.status_code, 503)
        network.assert_not_called()


class RecordProtectionTests(unittest.TestCase):
    def test_guest_records_are_not_persisted(self):
        with patch("app.services.result_storage.get_server_client") as server:
            for table in ("session_logs", "writing_submissions"):
                self.assertFalse(save_owned_record(table, {"user_id": "forged"}, None))
        server.assert_not_called()

    def test_verified_owner_overrides_record_fields(self):
        database = ContentDatabase()
        with patch("app.services.result_storage.get_server_client", return_value=database):
            self.assertTrue(save_owned_record("session_logs", {"user_id": "forged", "score": 7}, "verified"))
        self.assertEqual(database.writes, [{"user_id": "verified", "score": 7}])

    def test_server_and_user_clients_keep_separate_credentials(self):
        with patch.object(settings, "SUPABASE_SERVICE_ROLE_KEY", "test-server-key"), patch.object(
            settings, "SUPABASE_KEY", "test-public-key"
        ):
            server = supabase_client.get_server_client()
            user = supabase_client.get_client("user-token")
            self.assertEqual(server.headers["Authorization"], "Bearer test-server-key")
            self.assertEqual(server.headers["apikey"], "test-server-key")
            self.assertEqual(user.headers["Authorization"], "Bearer user-token")
            self.assertEqual(user.headers["apikey"], "test-public-key")
            with self.assertRaises(ValueError):
                supabase_client.SupabaseHttpClient("user-token", server_key="test-server-key")


class AuthenticationProtectionTests(unittest.IsolatedAsyncioTestCase):
    async def test_only_absent_credentials_enable_guest_access(self):
        self.assertIsNone(await get_optional_user(None))
        for header in ("", "Basic abc", "Bearer", "Bearer a b"):
            with self.subTest(header=header), self.assertRaises(HTTPException) as error:
                await get_optional_user(header)
            self.assertEqual(error.exception.status_code, 401)

    async def test_invalid_token_and_auth_outage_are_not_downgraded_to_guest(self):
        for status in (401, 503):
            with patch("app.dependencies.auth.get_current_user", new=AsyncMock(side_effect=HTTPException(status_code=status))):
                with self.assertRaises(HTTPException) as error:
                    await get_optional_user("Bearer test-token")
            self.assertEqual(error.exception.status_code, status)

    async def test_writing_ignores_forged_request_owner(self):
        evaluation = SimpleNamespace(overall_band=7, task_achievement=7, coherence_cohesion=7,
                                     lexical_resource=7, grammatical_range=7, feedback="Review",
                                     suggestions=[], saved=True)
        user = AuthenticatedUser("verified", "test@example.invalid", token="verified-token")
        with patch.object(
            writing.writing_service, "evaluate_essay", new=AsyncMock(return_value=evaluation)
        ) as evaluate, patch.object(writing, "save_owned_record") as save:
            await writing.submit_essay(writing.WritingSubmitRequest(
                prompt_id="p1", essay="A sample essay for the ownership regression test. " * 3,
                user_id="forged",
            ), user)
        self.assertEqual(evaluate.call_args.kwargs["user_id"], "verified")
        self.assertEqual(save.call_args.args[2], "verified")
        self.assertNotIn("forged", json.dumps(save.call_args.args[1]))

    async def test_validated_writing_result_uses_server_save_state(self):
        data = dict(overall_band=7, task_achievement=7, coherence_cohesion=7,
                    lexical_resource=7, grammatical_range=7, feedback="Review", suggestions=["Improve examples"])
        submission = EssaySubmissionSchema(prompt="Prompt", essay_text="Sample essay. " * 10, exam_type="ielts")
        for owner in (None, "verified"):
            database = ContentDatabase()
            with patch.object(writing_service, "request_evaluation", new=AsyncMock(return_value=data)), patch(
                "app.services.result_storage.get_server_client", return_value=database
            ):
                result = await writing_service.evaluate_essay(submission, user_id=owner)
            self.assertEqual(result.saved, bool(owner))
            self.assertEqual(len(database.writes), 1 if owner else 0)
