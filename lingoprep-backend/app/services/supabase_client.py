"""
LingoPrep API — Supabase HTTP Client
Direct HTTP client using httpx to bypass Windows AppLocker/WDAC DLL execution blocks on python-supabase SDK dependencies.
"""

import httpx
from app.config import settings


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
            with httpx.Client(timeout=10.0) as client:
                response = client.get(self.url, headers=self.headers, params=self.params)
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
            with httpx.Client(timeout=10.0) as client:
                response = client.post(self.url, headers=self.headers, json=data)
                if response.status_code >= 400:
                    raise ValueError(f"Supabase insert error: {response.text}")
                return SupabaseResponse(data=response.json())
        except Exception as e:
            print(f"Supabase POST execution error: {e}")
            raise


class SupabaseHttpClient:
    def __init__(self):
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            raise ValueError(
                "Supabase credentials not configured in .env file."
            )
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_KEY
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def table(self, table_name: str):
        return SupabaseTableQuery(self.url, table_name, self.headers)


# Lazy singleton instance
_client: SupabaseHttpClient | None = None


def get_client() -> SupabaseHttpClient:
    """Get or create a singleton Supabase HTTP client."""
    global _client
    if _client is None:
        _client = SupabaseHttpClient()
    return _client
