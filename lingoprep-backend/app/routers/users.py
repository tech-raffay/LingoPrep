"""
LingoPrep API — Users Router
Endpoints for user profile, session history, and dashboard stats.
Queries Supabase profiles and session_logs tables.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.services.supabase_client import get_client
from app.dependencies.auth import get_current_user as verify_user, AuthenticatedUser

from app.services.statistics import load_sessions, enrich_sessions, summarise_exam, slim_session, number

router = APIRouter()


@router.get("/me")
def get_current_user_profile(user: AuthenticatedUser = Depends(verify_user)):
    """
    Get the authenticated user's profile from the profiles table.
    """
    try:
        client = get_client(user.token)
        res = client.table("profiles").select("*").eq("id", user.id).single().execute()
        profile_data = res.data or {}
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Profile is temporarily unavailable.") from exc

    return {
        "success": True,
        "data": {
            "id": user.id,
            "email": user.email,
            "full_name": profile_data.get("full_name") or user.full_name or "Student",
            "target_exam": profile_data.get("target_exam", "ielts"),
            "target_score": number(profile_data.get("target_score"), 120),
        },
    }


@router.get("/sessions")
def get_all_sessions(user: AuthenticatedUser = Depends(verify_user)):
    """Get session logs for the currently authenticated user."""
    try:
        client = get_client(user.token)
        res = (
            client.table("session_logs")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )
        sessions = res.data or []

        sessions = enrich_sessions(client, sessions)

        return {"success": True, "data": sessions, "count": len(sessions)}
    except Exception as e:
        raise HTTPException(status_code=503, detail="History is temporarily unavailable.") from e


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, user: AuthenticatedUser = Depends(verify_user)):
    """Remove one of the user's own test results from their history.

    Runs as the user, so the row-level policy "Users can delete own sessions"
    (migration_delete_sessions.sql) decides what can go."""
    try:
        client = get_client(user.token)
        res = (
            client.table("session_logs")
            .eq("id", session_id)
            .eq("user_id", user.id)
            .delete()
        )
        deleted = res.data or []
    except Exception as e:
        raise HTTPException(status_code=503, detail="History is temporarily unavailable.") from e
    if not deleted:
        raise HTTPException(status_code=404, detail="That result was not found, or is not yours to delete.")
    return {"success": True, "deleted": len(deleted)}


@router.get("/stats")
def get_user_stats(user: AuthenticatedUser = Depends(verify_user)):
    """Summarize owned history, keeping unknown exams and missing grades explicit."""
    try:
        client = get_client(user.token)
        sessions = enrich_sessions(client, load_sessions(client, user.id))
        profile = client.table("profiles").select("target_exam").eq("id", user.id).single().execute().data or {}
        active_track = "toefl" if profile.get("target_exam") == "toefl" else "ielts"
        summaries = {exam: summarise_exam([s for s in sessions if s["exam_type"] == exam], exam)
                     for exam in ("ielts", "toefl")}
        recent = sorted(sessions, key=lambda row: (row.get("created_at") or "", row.get("id") or ""), reverse=True)[:10]
        return {"success": True, "data": {
            **summaries[active_track], **summaries, "active_track": active_track,
            "unclassified_sessions": sum(s["exam_type"] is None for s in sessions),
            "recent_sessions": [slim_session(s) for s in recent],
        }}
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Statistics are temporarily unavailable.") from exc
