"""Store server-computed results with ownership from verified authentication."""

from app.services.supabase_client import get_server_client
from contextvars import ContextVar

# The route gathers writes before committing them together. Threadpool tasks
# inherit this context and append to the same request-owned list.
pending_records: ContextVar[list | None] = ContextVar("pending_records", default=None)


def save_owned_record(table: str, record: dict, user_id: str | None) -> bool:
    """Guests receive feedback without storing ownerless essays or results.

    Callers must obtain user_id from the authentication dependency, never the
    request body. History reads/deletes continue to use the user's RLS client.
    """
    if table not in {"session_logs", "writing_submissions"}:
        raise ValueError("Unsupported result table.")
    if not user_id:
        return False
    records = pending_records.get()
    if records is not None:
        if any(item["table"] == table for item in records):
            raise ValueError("Only one record per result table is allowed.")
        records.append({"table": table, "data": {**record, "user_id": user_id}})
        return False  # Only the transaction can confirm a save.
    get_server_client().table(table).insert({**record, "user_id": user_id})
    return True
