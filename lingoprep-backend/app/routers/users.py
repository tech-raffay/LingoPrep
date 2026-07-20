"""
LingoPrep API — Users Router
Endpoints for user profile management (placeholder — uses Supabase Auth).
"""

from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/me")
async def get_current_user():
    """
    Get the current authenticated user's profile.
    TODO: Implement Supabase Auth JWT verification.
    """
    # Placeholder — will extract user from Supabase JWT token
    return {
        "success": True,
        "data": {
            "id": "placeholder",
            "email": "user@example.com",
            "full_name": "LingoPrep User",
            "target_exam": "ielts",
            "target_score": 7.0,
        },
        "message": "Auth not yet implemented. This is placeholder data.",
    }


@router.get("/{user_id}/sessions")
async def get_user_sessions(user_id: str):
    """
    Get practice session history for a user.
    TODO: Query Supabase session_logs table.
    """
    return {
        "success": True,
        "data": [],
        "message": "Session logging not yet connected to Supabase.",
    }


@router.get("/{user_id}/stats")
async def get_user_stats(user_id: str):
    """
    Get aggregated stats for a user's dashboard.
    TODO: Compute from Supabase session_logs.
    """
    return {
        "success": True,
        "data": {
            "total_sessions": 0,
            "average_score": 0,
            "reading_avg": 0,
            "listening_avg": 0,
            "writing_avg": 0,
        },
        "message": "Stats not yet connected to Supabase.",
    }
