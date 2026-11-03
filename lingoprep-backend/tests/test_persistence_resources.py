import asyncio
import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient
from app.main import app
from app.dependencies.auth import AuthenticatedUser, get_optional_user, get_current_user
from app.services import reliable_routes, writing_service, resource_limits, tts_service
from app.services.supabase_client import ServerDatabaseUnavailable
from persistence_fakes import isolated_attempts, headers
from test_ai_contracts import VALID, ESSAY
from test_full_test_validation import ContentDatabase, patch_database
from app.services import reading_service, listening_service


class PersistenceTests(unittest.TestCase):
    def setUp(self):
        self.user = AuthenticatedUser("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "test@example.invalid")
        self.payload = {"prompt_id": "p1", "essay": ESSAY["essay_text"]}

    def tearDown(self):
        app.dependency_overrides.clear()

    def signed_in(self):
        app.dependency_overrides[get_optional_user] = lambda: self.user
        app.dependency_overrides[get_current_user] = lambda: self.user
        return patch.object(reliable_routes, "get_optional_user", new=AsyncMock(return_value=self.user))

    def test_retry_replays_feedback_and_collects_both_writing_records(self):
        with isolated_attempts() as db, self.signed_in(), TestClient(app) as client, patch.object(
            writing_service, "request_evaluation", new=AsyncMock(return_value=VALID)
        ) as provider, patch("app.services.result_storage.get_server_client") as direct_write:
            h = headers()
            first = client.post("/api/writing/submit", json=self.payload, headers=h)
            second = client.post("/api/writing/submit", json=self.payload, headers=h)
            self.assertEqual(first.status_code, 200, first.text)
            self.assertEqual(first.json(), second.json())
            self.assertTrue(first.json()["saved"])
            self.assertEqual({r["table"] for r in db.saved}, {"session_logs", "writing_submissions"})
            self.assertEqual(len(db.saved), 2)
            provider.assert_awaited_once()
            direct_write.assert_not_called()

    def test_storage_retry_does_not_evaluate_again(self):
        with isolated_attempts() as db, self.signed_in(), TestClient(app) as client, patch.object(
            writing_service, "request_evaluation", new=AsyncMock(return_value=VALID)
        ) as provider:
            db.fail_finish = True
            first = client.post("/api/writing/submit", json=self.payload, headers=headers())
            self.assertFalse(first.json()["saved"])
            self.assertTrue(first.json()["save_retry_available"])
            self.assertEqual(db.saved, [])
            db.fail_finish = False
            second = client.post(f'/api/attempts/{first.json()["attempt_id"]}/save')
            self.assertEqual(second.status_code, 200, second.text)
            self.assertTrue(second.json()["saved"])
            self.assertEqual(len(db.saved), 2)
            provider.assert_awaited_once()

    def test_checkpoint_failure_retains_feedback_for_same_worker_recovery(self):
        with isolated_attempts() as db, self.signed_in(), TestClient(app) as client, patch.object(
            writing_service, "request_evaluation", new=AsyncMock(return_value=VALID)
        ) as provider:
            db.fail_stage = True
            h = headers()
            first = client.post("/api/writing/submit", json=self.payload, headers=h)
            self.assertEqual(first.status_code, 200)
            self.assertFalse(first.json()["saved"])
            db.fail_stage = False
            second = client.post("/api/writing/submit", json=self.payload, headers=h)
            self.assertTrue(second.json()["saved"])
            provider.assert_awaited_once()

    def test_guests_replay_without_history_and_keys_cannot_change_payload(self):
        with isolated_attempts() as db, TestClient(app) as client, patch.object(
            writing_service, "request_evaluation", new=AsyncMock(return_value=VALID)
        ) as provider:
            h = headers()
            first = client.post("/api/writing/submit", json=self.payload, headers=h)
            self.assertFalse(first.json()["saved"])
            self.assertFalse(first.json()["save_retry_available"])
            second = client.post("/api/writing/submit", json={**self.payload, "essay": "Changed essay. " * 20}, headers=h)
            self.assertEqual(second.status_code, 409)
            self.assertEqual(db.saved, [])
            provider.assert_awaited_once()

    def test_quota_capacity_and_database_failures_prevent_provider_work(self):
        with isolated_attempts() as db, TestClient(app) as client, patch.object(writing_service, "request_evaluation") as provider:
            for admission, status in (("quota", 429), ("busy", 503)):
                db.admission = admission
                response = client.post("/api/writing/submit", json=self.payload, headers=headers())
                self.assertEqual(response.status_code, status)
                self.assertIn("retry-after", response.headers)
            with patch.object(resource_limits, "database_call", side_effect=ServerDatabaseUnavailable()):
                response = client.post("/api/writing/submit", json=self.payload, headers=headers())
                self.assertEqual(response.status_code, 503)
            provider.assert_not_called()

    def test_body_limits_apply_before_auth_or_parsing(self):
        with TestClient(app) as client, patch.object(reliable_routes, "get_optional_user") as auth:
            response = client.post("/api/writing/submit", content=b"x" * (128 * 1024 + 1))
            self.assertEqual(response.status_code, 413)
            auth.assert_not_called()

    def test_proxy_root_path_does_not_bypass_submission_guard(self):
        with isolated_attempts() as database, TestClient(app, root_path="/backend") as client, patch.object(
            writing_service, "request_evaluation", new=AsyncMock(return_value=VALID)
        ) as provider:
            h = headers()
            for _ in range(2):
                response = client.post("/backend/api/writing/submit", json=self.payload, headers=h)
                self.assertEqual(response.status_code, 200, response.text)
            self.assertEqual(len(database.rows), 1)
            provider.assert_awaited_once()

    def test_sync_reading_and_listening_handlers_collect_one_history_record(self):
        for module, service in (("reading", reading_service), ("listening", listening_service)):
            content = ContentDatabase()
            content.rows["passages"][0]["module"] = module
            with isolated_attempts() as database, self.signed_in(), patch_database(service, content), TestClient(app) as client:
                payload = {"exam_type": "ielts", "answers": [
                    {"question_id": "q1", "selected_option_id": "o1"},
                    {"question_id": "q2", "answer_text": "library"},
                ]}
                h = headers()
                first = client.post(f"/api/{module}/submit-full", json=payload, headers=h)
                second = client.post(f"/api/{module}/submit-full", json=payload, headers=h)
                self.assertEqual(first.status_code, 200, first.text)
                self.assertEqual(first.json(), second.json())
                self.assertTrue(first.json()["saved"])
                self.assertEqual(len(database.saved), 1)
                self.assertEqual(content.writes, [])


class ResourceAsyncTests(unittest.IsolatedAsyncioTestCase):
    async def test_duplicate_while_running_does_not_start_a_second_provider(self):
        import httpx
        started, proceed = asyncio.Event(), asyncio.Event()
        async def evaluate(*args):
            started.set()
            await proceed.wait()
            return VALID
        with isolated_attempts(), patch.object(writing_service, "request_evaluation", new=AsyncMock(side_effect=evaluate)) as provider:
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app), base_url="http://test") as client:
                h = headers()
                payload = {"prompt_id": "p1", "essay": ESSAY["essay_text"]}
                first = asyncio.create_task(client.post("/api/writing/submit", json=payload, headers=h))
                await asyncio.wait_for(started.wait(), 3)
                try:
                    second = await asyncio.wait_for(client.post("/api/writing/submit", json=payload, headers=h), 3)
                    self.assertEqual(second.status_code, 409)
                finally:
                    proceed.set()
                self.assertEqual((await first).status_code, 200)
                provider.assert_awaited_once()

    async def test_synthesis_size_limits_precede_database_or_provider(self):
        with patch.object(resource_limits, "database_call") as database, patch.object(tts_service, "_synthesize_line") as provider:
            for transcript in ("x" * 50001, "short\n" * 201, "x" * 2001):
                with self.assertRaises(ValueError):
                    await tts_service.synthesize_transcript(transcript)
            database.assert_not_called()
            provider.assert_not_called()

    async def test_request_slot_is_released_after_disconnect(self):
        middleware = reliable_routes.RequestSizeLimit(AsyncMock())
        await middleware({"type": "http", "method": "POST", "path": "/api/writing/submit"}, AsyncMock(return_value={"type": "http.disconnect"}), AsyncMock())
        self.assertEqual(middleware.active_uploads, 0)


if __name__ == "__main__":
    unittest.main()
