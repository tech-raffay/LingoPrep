"""
LingoPrep API — Supabase HTTP Client
Direct HTTP client using httpx to bypass Windows AppLocker/WDAC DLL execution blocks on python-supabase SDK dependencies.
"""

import httpx
from threading import Lock
from app.config import settings

# One pooled client for the whole process. Opening a new client per query
# (as before) built a fresh TLS context and connection every time: slow, and
# on Render's 512 MB instance enough concurrent page loads ran it out of
# memory. httpx.Client is safe to share across threads.
_http = httpx.Client(
    timeout=httpx.Timeout(15.0, connect=10.0),
    limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
)
_http_lock = Lock()


def start_http_client():
    """Reopen the pool when an application lifespan is started again."""
    global _http
    with _http_lock:
        if _http.is_closed:
            _http = httpx.Client(timeout=httpx.Timeout(15.0, connect=10.0),
                                 limits=httpx.Limits(max_connections=20, max_keepalive_connections=10))


def close_http_client():
    _http.close()


class DatabaseUnavailable(RuntimeError):
    """A database request failed; diagnostic response bodies stay private."""


class DatabaseCardinalityError(DatabaseUnavailable):
    """An optional single-row lookup unexpectedly matched multiple rows."""


def _request(method, url, **kwargs):
    try:
        response = getattr(_http, method)(url, **kwargs)
        response.raise_for_status()
        return response.json() if response.content else []
    except (httpx.HTTPError, ValueError) as exc:
        raise DatabaseUnavailable("Database operation is temporarily unavailable.") from exc



class SupabaseResponse:
    def __init__(self, data):
        self.data = data


class SupabaseTableQuery:
    def __init__(self, base_url: str, table_name: str, headers: dict):
        self.url = f"{base_url}/rest/v1/{table_name}"
        self.headers = headers.copy()
        self.params = {}
        self._single = False
        self._filters = set()

    def select(self, select_str: str = "*"):
        self.params["select"] = select_str
        return self

    def eq(self, column: str, value: str):
        self.params[column] = f"eq.{value}"
        self._filters.add(column)
        return self

    def in_(self, column: str, values: list):
        val_str = ",".join(str(v) for v in values)
        self.params[column] = f"in.({val_str})"
        self._filters.add(column)
        return self

    def order(self, column: str, desc: bool = False):
        self.params["order"] = f"{column}.{'desc' if desc else 'asc'}"
        return self

    def limit(self, limit_val: int):
        self.params["limit"] = str(limit_val)
        return self

    def single(self):
        self._single = True
        return self

    def range(self, start: int, end: int):
        """Inclusive row range. Callers must supply deterministic ordering."""
        if start < 0 or end < start:
            raise ValueError("Invalid result range")
        self.params["offset"] = str(start)
        self.params["limit"] = str(end - start + 1)
        return self

    def execute(self):
        data = _request("get", self.url, headers=self.headers, params=self.params)
        if not isinstance(data, list):
            raise DatabaseUnavailable("Invalid database result.")
        if self._single:
            if len(data) > 1:
                raise DatabaseCardinalityError("Expected at most one database record.")
            data = data[0] if data else None
        return SupabaseResponse(data=data)

    def delete(self):
        """Terminal operation: require a row predicate, not select/order/limit."""
        if not self._filters:
            raise ValueError("Refusing to delete without a row filter")
        return SupabaseResponse(_request("delete", self.url, headers=self.headers, params=self.params))

    def insert(self, data: dict | list):
        """Terminal operation; do not chain execute() after this call."""
        return SupabaseResponse(_request("post", self.url, headers=self.headers, json=data))


class SupabaseHttpClient:
    def __init__(self, access_token: str | None = None, *, server_key: str | None = None):
        key = server_key or settings.SUPABASE_KEY
        if not settings.SUPABASE_URL or not key:
            raise DatabaseUnavailable(
                "Database access is not configured."
            )
        self.url = settings.SUPABASE_URL
        self.key = key
        # User clients retain RLS for history reads/deletes. Server clients
        # are separate and must never inherit a caller's bearer token.
        if server_key and access_token:
            raise ValueError("Server credentials cannot be combined with a user token.")
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {access_token or self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def table(self, table_name: str):
        return SupabaseTableQuery(self.url, table_name, self.headers)

    def rpc(self, name: str, parameters: dict):
        """Call a backend-owned transaction without exposing database diagnostics."""
        try:
            response = _http.post(f"{self.url}/rest/v1/rpc/{name}", headers=self.headers, json=parameters)
            response.raise_for_status()
            return response.json() if response.content else None
        except (httpx.HTTPError, ValueError) as exc:
            raise ServerDatabaseUnavailable("Protected database operation is unavailable.") from exc


# Lazy singleton instance
_client: SupabaseHttpClient | None = None


def get_client(access_token: str | None = None) -> SupabaseHttpClient:
    """The shared anon client, or — given a user's access token — a client
    that acts as that user (needed for anything touching their own rows)."""
    if access_token:
        return SupabaseHttpClient(access_token)
    global _client
    if _client is None:
        _client = SupabaseHttpClient()
    return _client


class ServerDatabaseUnavailable(RuntimeError):
    """Protected database access is not configured."""


def get_server_client() -> SupabaseHttpClient:
    """Server-only answer reads and trusted writes; never fall back to anon."""
    key = settings.SUPABASE_SERVICE_ROLE_KEY
    if not key or key == settings.SUPABASE_KEY:
        raise ServerDatabaseUnavailable("Protected database access is unavailable.")
    return SupabaseHttpClient(server_key=key)
