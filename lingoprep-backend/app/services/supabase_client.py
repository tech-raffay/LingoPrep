"""
LingoPrep API — Supabase Client Service
Provides a configured Supabase client for database and auth operations.
"""

from supabase import create_client, Client
from app.config import settings


def get_supabase_client() -> Client:
    """
    Create and return a Supabase client instance.
    Raises a warning if credentials are not configured.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise ValueError(
            "Supabase credentials not configured. "
            "Set SUPABASE_URL and SUPABASE_KEY in your .env file."
        )

    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


# Lazy singleton — initialized on first use
_client: Client | None = None


def get_client() -> Client:
    """Get or create a singleton Supabase client."""
    global _client
    if _client is None:
        _client = get_supabase_client()
    return _client
