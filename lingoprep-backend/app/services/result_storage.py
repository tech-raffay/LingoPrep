"""Store server-computed results with ownership from verified authentication."""

from app.services.supabase_client import get_server_client


def save_owned_record(table: str, record: dict, user_id: str | None) -> bool:
    """Guests receive feedback without storing ownerless essays or results.

    Callers must obtain user_id from the authentication dependency, never the
    request body. History reads/deletes continue to use the user's RLS client.
    """
    if table not in {"session_logs", "writing_submissions"}:
        raise ValueError("Unsupported result table.")
    if not user_id:
        return False
    get_server_client().table(table).insert({**record, "user_id": user_id})
    return True
