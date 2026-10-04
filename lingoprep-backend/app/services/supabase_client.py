"""
LingoPrep API — Supabase HTTP Client
Direct HTTP client using httpx to bypass Windows AppLocker/WDAC DLL execution blocks on python-supabase SDK dependencies.
"""

import httpx
from app.config import settings

# One pooled client for the whole process. Opening a new client per query
# (as before) built a fresh TLS context and connection every time: slow, and
# on Render's 512 MB instance enough concurrent page loads ran it out of
# memory. httpx.Client is safe to share across threads.
_http = httpx.Client(
    timeout=httpx.Timeout(15.0, connect=10.0),
    limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
)


class SupabaseResponse:
    def __init__(self, data):
        self.data = data


class SupabaseTableQuery:
    def __init__(self, base_url: str, table_name: str, headers: dict):
        self.url = f"{base_url}/rest/v1/{table_name}"
        self.headers = headers.copy()
        self.params = {}
        self._single = False

    def select(self, select_str: str = "*"):
        self.params["select"] = select_str
        return self

    def eq(self, column: str, value: str):
        self.params[column] = f"eq.{value}"
        return self

    def in_(self, column: str, values: list):
        val_str = ",".join(str(v) for v in values)
        self.params[column] = f"in.({val_str})"
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

    def execute(self):
        try:
            response = _http.get(self.url, headers=self.headers, params=self.params)
            if response.status_code in (404, 406):
                return SupabaseResponse(data=None)
            if response.status_code >= 400:
                raise ValueError(f"Supabase REST error: {response.text}")

            data = response.json()
            if self._single:
                if isinstance(data, list):
                    data = data[0] if len(data) > 0 else None
            return SupabaseResponse(data=data)
        except Exception as e:
            print(f"Supabase GET execution error: {e}")
            raise

    def insert(self, data: dict | list):
        try:
            response = _http.post(self.url, headers=self.headers, json=data)
            if response.status_code >= 400:
                raise ValueError(f"Supabase insert error: {response.text}")
            return SupabaseResponse(data=response.json())
        except Exception as e:
            print(f"Supabase POST execution error: {e}")
            raise


class SupabaseHttpClient:
    def __init__(self, access_token: str | None = None):
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise ValueError(
                "Supabase credentials not configured in .env file."
            )
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_KEY
        # With a user's access token, requests run *as that user*, so the
        # row-level-security policies ("users can insert/view own sessions")
        # apply. The anon key alone can only touch rows with user_id IS NULL,
        # which is why signed-in users' results were silently never saved.
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {access_token or self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def table(self, table_name: str):
        return SupabaseTableQuery(self.url, table_name, self.headers)


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
