"""Authentication and AI contract tests with isolated provider/database fixtures."""
import asyncio
import json
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch
import httpx
from fastapi import HTTPException
from fastapi.testclient import TestClient
from app.main import app
from persistence_fakes import isolated_attempts, headers
from app.dependencies import auth
from app.services import ai_evaluation as ai, writing_service, speaking_service
from app.schemas.models import EssaySubmissionSchema, SpeakingSubmissionSchema

VALID = dict(overall_band=7, task_achievement=7, coherence_cohesion=7,
             lexical_resource=7, grammatical_range=7, feedback="Clear structure.", suggestions=["Add examples."])
ESSAY = dict(prompt="Discuss education", essay_text="A thoughtful argument about education. " * 5, exam_type="ielts")

class ContractTests(unittest.TestCase):
    def test_valid_scores_and_boundaries(self):
        for exam, maximum in (("ielts", 9), ("toefl", 30)):
            for score in (0, maximum):
                data = {**VALID, **{key: score for key in VALID if key not in ("feedback", "suggestions")}}
                self.assertEqual(ai.validate_output(json.dumps(data), exam, "writing")["overall_band"], score)

    def test_invalid_provider_results_are_rejected(self):
        cases = [{**VALID, "overall_band": value} for value in (-1, 25, float("inf"), float("nan"), True, "7", 7.1)]
        cases += [{**VALID, "saved": True}, {**VALID, "feedback": "   "}, {**VALID, "suggestions": []}, {"feedback": "only feedback"}]
        for data in cases:
            with self.subTest(data=data), self.assertRaises(ai.InvalidEvaluation):
                ai.validate_output(json.dumps(data), "ielts", "writing")
        with self.assertRaises(ai.InvalidEvaluation):
            ai.validate_output("broken JSON", "ielts", "writing")

    def test_request_limits_and_whitespace(self):
        with isolated_attempts(), TestClient(app) as client, patch.object(writing_service, "request_evaluation") as provider:
            for payload in ({**ESSAY, "essay_text": " " * 100}, {**ESSAY, "essay_text": "x" * 20001}, {**ESSAY, "exam_type": "other"}):
                self.assertEqual(client.post("/api/writing/evaluate", json=payload, headers=headers()).status_code, 422)
        provider.assert_not_called()

    def test_failures_return_safe_errors_and_never_save(self):
        with isolated_attempts(), TestClient(app) as client, patch("app.services.result_storage.get_server_client") as database:
            for error, status in ((ai.InvalidEvaluation("Invalid evaluation. Please retry."), 502), (ai.EvaluationUnavailable("Evaluation unavailable."), 503)):
                with patch.object(writing_service, "request_evaluation", new=AsyncMock(side_effect=error)):
                    response = client.post("/api/writing/submit", json={"prompt_id": "p1", "essay": ESSAY["essay_text"]}, headers=headers())
                    self.assertEqual(response.status_code, status)
                    self.assertNotIn("score", response.json())
        database.assert_not_called()

    def test_legacy_route_rejects_invalid_authorization(self):
        with TestClient(app) as client, patch.object(writing_service, "request_evaluation") as provider:
            self.assertEqual(client.post("/api/writing/evaluate", json=ESSAY, headers={"Authorization": "Basic nope"}).status_code, 401)
        provider.assert_not_called()

class AsyncContracts(unittest.IsolatedAsyncioTestCase):
    async def test_auth_upstream_status_and_identity(self):
        for status in (401, 403, 429, 500):
            manager = AsyncMock()
            manager.__aenter__.return_value.get.return_value = httpx.Response(status, json={})
            with patch.object(auth.httpx, "AsyncClient", return_value=manager):
                with self.assertRaises(HTTPException) as error:
                    await auth.get_optional_user("Bearer token")
            self.assertEqual(error.exception.status_code, 401 if status in (401, 403) else 503)
        for data in ([], {}, {"id": "invalid", "email": "x"}):
            manager.__aenter__.return_value.get.return_value = httpx.Response(200, json=data)
            with patch.object(auth.httpx, "AsyncClient", return_value=manager):
                with self.assertRaises(HTTPException) as error:
                    await auth.get_current_user("Bearer token")
            self.assertEqual(error.exception.status_code, 503)
        manager.__aenter__.return_value.get.return_value = httpx.Response(200, json={"id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "email": "x@example.invalid"})
        with patch.object(auth.httpx, "AsyncClient", return_value=manager):
            user = await auth.get_current_user("Bearer token")
        self.assertEqual(user.token, "token")

    async def test_provider_error_is_redacted_and_client_closed(self):
        manager = AsyncMock()
        manager.__aenter__.return_value.chat.completions.create.side_effect = RuntimeError("secret provider diagnostics")
        with patch.object(ai, "AsyncGroq", return_value=manager), patch.object(ai.settings, "GROQ_API_KEY", "test-only"):
            with self.assertRaises(ai.EvaluationUnavailable) as error:
                await ai.request_evaluation("system", "text", "ielts", "writing")
        self.assertNotIn("secret", str(error.exception))
        manager.__aexit__.assert_awaited_once()

    async def test_missing_configuration_never_calls_provider(self):
        with patch.object(ai.settings, "GROQ_API_KEY", ""), patch.object(ai, "AsyncGroq") as provider:
            with self.assertRaises(ai.EvaluationUnavailable):
                await ai.request_evaluation("system", "text", "ielts", "writing")
        provider.assert_not_called()

    async def test_failed_storage_does_not_claim_saved(self):
        with patch.object(writing_service, "request_evaluation", new=AsyncMock(return_value=VALID)), patch.object(writing_service, "save_owned_record", side_effect=RuntimeError("database down")):
            result = await writing_service.evaluate_essay(EssaySubmissionSchema(**ESSAY), user_id="user")
        self.assertFalse(result.saved)
        self.assertEqual(result.overall_band, 7)

    async def test_speaking_returns_feedback_without_fabricated_grade_or_write(self):
        with patch.object(speaking_service, "request_evaluation", new=AsyncMock(return_value={"feedback": "Language review", "suggestions": ["Use examples"]})), patch("app.services.result_storage.get_server_client") as database:
            result = await speaking_service.evaluate_speaking(SpeakingSubmissionSchema(prompt="Education", transcript="My spoken response", exam_type="ielts"), user_id="user")
        self.assertIsNone(result.overall_band)
        self.assertIsNone(result.pronunciation_fluency)
        self.assertFalse(result.saved)
        database.assert_not_called()

    async def test_provider_deadline_closes_client_and_keeps_loop_responsive(self):
        manager = AsyncMock()
        async def delayed(**kwargs):
            await asyncio.sleep(60)
        manager.__aenter__.return_value.chat.completions.create.side_effect = delayed
        with patch.object(ai, "AsyncGroq", return_value=manager), patch.object(ai.settings, "GROQ_API_KEY", "test-only"), patch.object(ai, "EVALUATION_DEADLINE_SECONDS", 0.03):
            task = asyncio.create_task(ai.request_evaluation("system", "text", "ielts", "writing"))
            await asyncio.sleep(0.005)
            self.assertFalse(task.done())
            with self.assertRaises(ai.EvaluationUnavailable):
                await task
        manager.__aexit__.assert_awaited_once()

    async def test_provider_envelope_validation(self):
        manager = AsyncMock()
        for choices in ([], [SimpleNamespace(finish_reason="length", message=SimpleNamespace(content=json.dumps(VALID)))],
                        [SimpleNamespace(finish_reason="stop", message=SimpleNamespace(content=None))]):
            manager.__aenter__.return_value.chat.completions.create.return_value = SimpleNamespace(choices=choices)
            with patch.object(ai, "AsyncGroq", return_value=manager), patch.object(ai.settings, "GROQ_API_KEY", "test-only"):
                with self.assertRaises(ai.InvalidEvaluation):
                    await ai.request_evaluation("system", "text", "ielts", "writing")
        manager.__aenter__.return_value.chat.completions.create.return_value = SimpleNamespace(choices=[SimpleNamespace(finish_reason="stop", message=SimpleNamespace(content=json.dumps(VALID)))])
        with patch.object(ai, "AsyncGroq", return_value=manager), patch.object(ai.settings, "GROQ_API_KEY", "test-only"):
            result = await ai.request_evaluation("system", "text", "ielts", "writing")
        self.assertEqual(result["overall_band"], 7)

    async def test_slow_storage_does_not_block_event_loop(self):
        import threading
        entered, release = threading.Event(), threading.Event()
        def store(*args):
            entered.set()
            release.wait(2)
            return True
        with patch.object(writing_service, "request_evaluation", new=AsyncMock(return_value=VALID)), patch.object(writing_service, "save_owned_record", side_effect=store):
            task = asyncio.create_task(writing_service.evaluate_essay(EssaySubmissionSchema(**ESSAY), user_id="user"))
            try:
                for _ in range(100):
                    if entered.is_set():
                        break
                    await asyncio.sleep(0.001)
                self.assertTrue(entered.is_set())
                self.assertFalse(task.done())
            finally:
                release.set()
                await task

    async def test_auth_network_failure_remains_dependency_error(self):
        manager = AsyncMock()
        manager.__aenter__.return_value.get.side_effect = httpx.ConnectError("secret internal URL")
        with patch.object(auth.httpx, "AsyncClient", return_value=manager):
            with self.assertRaises(HTTPException) as error:
                await auth.get_optional_user("Bearer token")
        self.assertEqual(error.exception.status_code, 503)
        self.assertNotIn("secret", error.exception.detail)
