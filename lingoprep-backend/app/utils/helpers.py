"""
LingoPrep API — Utility Helpers
Shared utility functions used across services.
"""

from datetime import datetime, timezone


def utc_now() -> datetime:
    """Get current UTC timestamp."""
    return datetime.now(timezone.utc)


def calculate_band_score(percentage: float) -> float:
    """
    Convert a percentage score to an IELTS-style band score (0-9).
    Uses approximate IELTS band conversion.
    """
    if percentage >= 95:
        return 9.0
    elif percentage >= 87:
        return 8.5
    elif percentage >= 80:
        return 8.0
    elif percentage >= 73:
        return 7.5
    elif percentage >= 65:
        return 7.0
    elif percentage >= 58:
        return 6.5
    elif percentage >= 50:
        return 6.0
    elif percentage >= 42:
        return 5.5
    elif percentage >= 35:
        return 5.0
    elif percentage >= 27:
        return 4.5
    elif percentage >= 20:
        return 4.0
    elif percentage >= 13:
        return 3.5
    elif percentage >= 7:
        return 3.0
    else:
        return 2.5
