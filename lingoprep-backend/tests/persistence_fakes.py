"""Isolated API fixtures. SQL transaction semantics are tested with PostgreSQL."""
from contextlib import contextmanager
from copy import deepcopy
from unittest.mock import patch
from uuid import uuid4

from app.config import settings
from app.services import reliable_routes, resource_limits
from app.services.supabase_client import ServerDatabaseUnavailable


def headers():
    return {"X-Guest-Id": str(uuid4()), "Idempotency-Key": str(uuid4())}


class AttemptDatabase:
    def __init__(self):
        self.rows = {}
        self.saved = []
        self.admission = "ok"
        self.fail_stage = False
        self.fail_finish = False
        self.releases = 0

    async def call(self, name, **p):
        if name == "acquire_workload":
            return self.admission
        if name == "release_workload":
            self.releases += 1
            return None
        identity = (p["p_principal"], p["p_key"])
        if name == "claim_submission":
            row = self.rows.get(identity)
            if row:
                if row["fingerprint"] != p["p_fingerprint"]:
                    return {"state": "conflict"}
                return deepcopy(row)
            self.rows[identity] = {"state": "running", "fingerprint": p["p_fingerprint"], "user": p["p_user"]}
            return {"state": "new"}
        row = self.rows[identity]
        if name == "stage_submission":
            if self.fail_stage:
                raise ServerDatabaseUnavailable()
            row.update(state="ready", response=deepcopy(p["p_response"]), records=deepcopy(p["p_records"]))
        elif name == "finish_submission":
            if self.fail_finish:
                raise ServerDatabaseUnavailable()
            if row["state"] == "ready":
                self.saved.extend(row["records"])
                row["response"]["body"]["saved"] = bool(row["user"] and row["records"])
                row["response"]["body"]["save_retry_available"] = False
                row["state"] = "done"
            return deepcopy(row["response"])
        return None


@contextmanager
def isolated_attempts():
    database = AttemptDatabase()
    reliable_routes._recovery.clear()
    with patch.object(settings, "RESOURCE_LIMIT_SECRET", "unit-test-only-" * 3), patch.object(
        reliable_routes, "database_call", side_effect=database.call
    ), patch.object(resource_limits, "database_call", side_effect=database.call):
        yield database
    reliable_routes._recovery.clear()
