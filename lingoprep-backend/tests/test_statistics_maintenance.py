"""Regression tests for historical statistics, adapter boundaries and maintenance."""
import asyncio
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

import httpx
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.services import statistics, supabase_client as db, prompts, tts_service
from app.dependencies.auth import get_current_user, AuthenticatedUser


class StatisticsTests(unittest.TestCase):
    def test_zero_scores_count_but_missing_malformed_scores_do_not(self):
        rows = [{"module": "reading", "band_score": 9},
                {"module": "listening", "band_score": 0},
                *[{"module": "writing", "band_score": score, "details": ["bad"]}
                  for score in (None, "bad", True, float("nan"), float("inf"), -1, 10)]]
        result = statistics.summarise_exam(rows, "ielts")
        self.assertEqual(result["overall_band"], 4.5)
        self.assertEqual(result["modules"]["listening"]["count"], 1)
        self.assertEqual(result["modules"]["writing"]["count"], 0)
        self.assertEqual(result["modules"]["writing"]["unscored_count"], 7)
        self.assertFalse(result["is_complete_summary"])

    def test_first_latest_and_percentages_ignore_invalid_grades(self):
        rows = [{"module": "reading", "band_score": value, "percentage": value,
                 "created_at": str(index), "details": "bad"}
                for index, value in enumerate((0, None, 6, None))]
        result = statistics.summarise_exam(rows, "ielts")
        self.assertEqual(result["modules"]["reading"]["first"], 0)
        self.assertEqual(result["modules"]["reading"]["latest"], 6)
        self.assertEqual(result["average_percentage"], 3)
        self.assertIsNone(result["recent_sessions"][0]["band_score"])

    def test_small_server_page_cap_does_not_truncate_statistics(self):
        client = Mock()
        query = client.table.return_value
        for name in ("select", "eq", "order", "range"):
            getattr(query, name).return_value = query
        query.execute.side_effect = [SimpleNamespace(data=[{"id": i} for i in range(2)]),
                                     SimpleNamespace(data=[{"id": 3}]), SimpleNamespace(data=[])]
        self.assertEqual(len(statistics.load_sessions(client, "owner")), 3)
        self.assertEqual(query.range.call_args_list[1].args[0], 2)
        query.eq.assert_called_with("user_id", "owner")

    def test_ceiling_fails_instead_of_returning_partial_stats(self):
        client = Mock()
        query = client.table.return_value
        for name in ("select", "eq", "order", "range"):
            getattr(query, name).return_value = query
        query.execute.return_value = SimpleNamespace(data=[{}] * 3)
        with patch.object(statistics, "MAX_STATS_ROWS", 2), self.assertRaises(db.DatabaseUnavailable):
            statistics.load_sessions(client, "owner")

    def test_unknown_exam_not_silently_classified_and_enrichment_batched(self):
        client = Mock()
        client.table.return_value.select.return_value.in_.return_value.execute.return_value.data = [
            {"id": "p", "exam_type": "toefl", "title": "Title"}]
        rows = statistics.enrich_sessions(client, [{"passage_id": "p"}, {"passage_id": "p"}, {"details": []}])
        self.assertEqual([r["exam_type"] for r in rows], ["toefl", "toefl", None])
        self.assertEqual(client.table.call_count, 1)

    def test_authenticated_stats_endpoint_keeps_existing_response_contract(self):
        app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser("owner", "example@invalid", token="token")
        rows = [{"id": "1", "module": "reading", "band_score": 9, "details": {"exam_type": "ielts"}},
                {"id": "2", "module": "listening", "band_score": 0, "details": {"exam_type": "ielts"}}]

        def database_response(request):
            self.assertEqual(request.headers["authorization"], "Bearer token")
            if request.url.path.endswith("/profiles"):
                return httpx.Response(200, json=[{"target_exam": "ielts"}])
            self.assertEqual(request.url.params["user_id"], "eq.owner")
            return httpx.Response(200, json=rows if request.url.params["offset"] == "0" else [])

        try:
            with TestClient(app) as api, httpx.Client(transport=httpx.MockTransport(database_response)) as pool, patch.object(db, "_http", pool):
                response = api.get("/api/users/stats")
                self.assertEqual(response.status_code, 200)
                data = response.json()["data"]
                self.assertEqual(data["overall_band"], 4.5)
                self.assertEqual(data["ielts"]["modules"]["listening"]["count"], 1)
                self.assertEqual(data["total_sessions"], 2)
                self.assertIn("toefl", data)
        finally:
            app.dependency_overrides.clear()

    def test_stats_failure_is_safe_503(self):
        app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser("owner", "example@invalid", token="token")
        try:
            with TestClient(app) as api, patch("app.routers.users.get_client", side_effect=RuntimeError("PRIVATE detail")):
                response = api.get("/api/users/stats")
                self.assertEqual(response.status_code, 503)
                self.assertNotIn("PRIVATE", response.text)
        finally:
            app.dependency_overrides.clear()


class AdapterTests(unittest.TestCase):
    def test_http_errors_not_mistaken_for_missing_rows(self):
        for status in (404, 406, 500):
            with self.subTest(status=status), patch.object(db._http, "get", return_value=httpx.Response(
                status, text="PRIVATE body", request=httpx.Request("GET", "https://example.invalid"))):
                with self.assertRaises(db.DatabaseUnavailable) as raised:
                    db.SupabaseTableQuery("https://example.invalid", "test", {}).single().execute()
                self.assertNotIn("PRIVATE", str(raised.exception))

    def test_optional_single_checks_cardinality(self):
        for rows, expected in (([], None), ([{"id": 1}], {"id": 1})):
            with patch.object(db, "_request", return_value=rows):
                self.assertEqual(db.SupabaseTableQuery("", "test", {}).single().execute().data, expected)
        with patch.object(db, "_request", return_value=[{}, {}]), self.assertRaises(db.DatabaseCardinalityError):
            db.SupabaseTableQuery("", "test", {}).single().execute()

    def test_delete_requires_real_predicate(self):
        with patch.object(db, "_request", return_value=[]) as request:
            with self.assertRaises(ValueError):
                db.SupabaseTableQuery("", "test", {}).select("*").limit(1).delete()
            request.assert_not_called()
            db.SupabaseTableQuery("", "test", {}).eq("id", "owned").delete()
            request.assert_called_once()


class PromptAndLifecycleTests(unittest.TestCase):
    def test_writing_list_random_submit_share_fallback(self):
        client = Mock()
        query = client.table.return_value
        for name in ("select", "eq", "order", "limit"):
            getattr(query, name).return_value = query
        query.execute.return_value.data = []
        with patch.object(prompts, "get_client", return_value=client), TestClient(app) as api:
            listed = api.get("/api/writing/prompts").json()["data"]
            picked = api.get("/api/writing/prompt/random").json()["data"]
            self.assertIn(picked, listed)
            self.assertEqual(prompts.get_writing_prompt(picked["id"]), picked)
            self.assertEqual(api.get("/api/writing/prompts?exam_type=invalid").status_code, 422)
        with patch.object(prompts, "get_client", side_effect=db.DatabaseUnavailable("Unavailable")), TestClient(app) as api:
            self.assertEqual(api.get("/api/writing/prompts").status_code, 503)

    def test_speaking_fallback_applies_both_filters(self):
        client = Mock()
        query = client.table.return_value
        query.select.return_value = query
        query.eq.return_value = query
        query.execute.return_value.data = []
        with patch("app.routers.speaking.get_client", return_value=client), TestClient(app) as api:
            rows = api.get("/api/speaking/prompts?exam_type=ielts").json()["data"]
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["exam_type"], "ielts")
            self.assertEqual(api.get("/api/speaking/prompts?difficulty=easy").json()["data"], [])

    def test_readiness_distinct_from_liveness_and_pool_closed(self):
        with patch.object(settings, "SUPABASE_SERVICE_ROLE_KEY", ""), TestClient(app) as api:
            self.assertFalse(db._http.is_closed)
            self.assertEqual(api.get("/health").status_code, 200)
            response = api.get("/ready")
            self.assertEqual(response.status_code, 503)
            self.assertEqual(response.json()["scope"], "configuration_only")
        self.assertTrue(db._http.is_closed)


class ShutdownTests(unittest.IsolatedAsyncioTestCase):
    async def test_synthesis_and_prewarm_cancelled_and_awaited(self):
        tasks = [asyncio.create_task(asyncio.sleep(60)) for _ in range(2)]
        tts_service._inflight["test"] = tasks[0]
        tts_service._background.add(tasks[1])
        await tts_service.shutdown_audio_tasks()
        self.assertTrue(all(t.cancelled() for t in tasks))
        self.assertFalse(tts_service._inflight)
        self.assertFalse(tts_service._background)
