"""
LingoPrep API — Users Router
Endpoints for user profile, session history, and dashboard stats.
Queries Supabase profiles and session_logs tables.
"""

from fastapi import APIRouter, HTTPException
from app.services.supabase_client import get_client

router = APIRouter()


@router.get("/me")
async def get_current_user():
    """
    Get a demo user profile.
    TODO: Replace with Supabase Auth JWT verification when auth is wired.
    """
    return {
        "success": True,
        "data": {
            "id": "demo-user",
            "email": "demo@lingoprep.com",
            "full_name": "Demo User",
            "target_exam": "ielts",
            "target_score": 7.0,
        },
        "message": "Demo mode — sign up to track your progress.",
    }


@router.get("/sessions")
async def get_all_sessions():
    """Get all session logs (demo mode — no user filter)."""
    try:
        client = get_client()
        res = (
            client.table("session_logs")
            .select("*")
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )
        sessions = res.data or []

        # Enrich with passage titles
        for session in sessions:
            if session.get("passage_id"):
                passage_res = (
                    client.table("passages")
                    .select("title")
                    .eq("id", session["passage_id"])
                    .single()
                    .execute()
                )
                session["passage_title"] = (
                    passage_res.data.get("title", "") if passage_res.data else ""
                )

        return {"success": True, "data": sessions, "count": len(sessions)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_user_stats():
    """Get aggregated stats for the dashboard (demo mode)."""
    try:
        client = get_client()
        res = client.table("session_logs").select("*").execute()
        sessions = res.data or []

        # Separate into ielts and toefl sessions
        ielts_sessions = []
        toefl_sessions = []
        
        for s in sessions:
            details = s.get("details") or {}
            exam_type = details.get("exam_type")
            
            # If not in details, try to fetch from passage:
            if not exam_type and s.get("passage_id"):
                try:
                    passage_res = client.table("passages").select("exam_type").eq("id", s["passage_id"]).single().execute()
                    if passage_res.data:
                        exam_type = passage_res.data.get("exam_type", "ielts")
                except Exception:
                    pass
            
            if not exam_type:
                exam_type = "ielts"  # fallback
                
            s["exam_type"] = exam_type
            if exam_type == "toefl":
                toefl_sessions.append(s)
            else:
                ielts_sessions.append(s)

        # IELTS Averages
        ielts_total = len(ielts_sessions)
        ielts_avg_pct = sum(s.get("percentage", 0) for s in ielts_sessions) / ielts_total if ielts_total > 0 else 0
        ielts_reading = [s for s in ielts_sessions if s.get("module") == "reading"]
        ielts_listening = [s for s in ielts_sessions if s.get("module") == "listening"]
        ielts_writing = [s for s in ielts_sessions if s.get("module") == "writing"]
        ielts_speaking = [s for s in ielts_sessions if s.get("module") == "speaking"]
        
        ielts_reading_avg = sum(s.get("band_score", 0) for s in ielts_reading) / len(ielts_reading) if ielts_reading else 0
        ielts_listening_avg = sum(s.get("band_score", 0) for s in ielts_listening) / len(ielts_listening) if ielts_listening else 0
        ielts_writing_avg = sum(s.get("band_score", 0) for s in ielts_writing) / len(ielts_writing) if ielts_writing else 0
        ielts_speaking_avg = sum(s.get("band_score", 0) for s in ielts_speaking) / len(ielts_speaking) if ielts_speaking else 0
        
        ielts_active_modules = [b for b in [ielts_reading_avg, ielts_listening_avg, ielts_writing_avg, ielts_speaking_avg] if b > 0]
        ielts_overall = round(sum(ielts_active_modules) / len(ielts_active_modules), 1) if ielts_active_modules else 0

        # TOEFL Averages
        toefl_total = len(toefl_sessions)
        toefl_avg_pct = sum(s.get("percentage", 0) for s in toefl_sessions) / toefl_total if toefl_total > 0 else 0
        toefl_reading = [s for s in toefl_sessions if s.get("module") == "reading"]
        toefl_listening = [s for s in toefl_sessions if s.get("module") == "listening"]
        toefl_writing = [s for s in toefl_sessions if s.get("module") == "writing"]
        toefl_speaking = [s for s in toefl_sessions if s.get("module") == "speaking"]
        
        toefl_reading_avg = sum(s.get("band_score", 0) for s in toefl_reading) / len(toefl_reading) if toefl_reading else 0
        toefl_listening_avg = sum(s.get("band_score", 0) for s in toefl_listening) / len(toefl_listening) if toefl_listening else 0
        toefl_writing_avg = sum(s.get("band_score", 0) for s in toefl_writing) / len(toefl_writing) if toefl_writing else 0
        toefl_speaking_avg = sum(s.get("band_score", 0) for s in toefl_speaking) / len(toefl_speaking) if toefl_speaking else 0
        
        toefl_overall = round(toefl_reading_avg + toefl_listening_avg + toefl_writing_avg + toefl_speaking_avg, 1)

        # Backwards compatibility flat values
        if toefl_total > ielts_total:
            flat_total = toefl_total
            flat_avg_pct = toefl_avg_pct
            flat_overall = toefl_overall
            flat_reading = toefl_reading_avg
            flat_listening = toefl_listening_avg
            flat_writing = toefl_writing_avg
            flat_speaking = toefl_speaking_avg
            active_track = "toefl"
        else:
            flat_total = ielts_total
            flat_avg_pct = ielts_avg_pct
            flat_overall = ielts_overall
            flat_reading = ielts_reading_avg
            flat_listening = ielts_listening_avg
            flat_writing = ielts_writing_avg
            flat_speaking = ielts_speaking_avg
            active_track = "ielts"

        # Recent sessions
        recent = sorted(sessions, key=lambda s: s.get("created_at", ""), reverse=True)[:10]
        for s in recent:
            if s.get("passage_id"):
                try:
                    p_res = client.table("passages").select("title, exam_type").eq("id", s["passage_id"]).single().execute()
                    if p_res.data:
                        s["passage_title"] = p_res.data.get("title", "")
                        if not s.get("details"):
                            s["details"] = {}
                        if not s["details"].get("exam_type"):
                            s["details"]["exam_type"] = p_res.data.get("exam_type", "ielts")
                except Exception:
                    pass

        return {
            "success": True,
            "data": {
                "active_track": active_track,
                "total_sessions": flat_total,
                "average_percentage": round(flat_avg_pct, 1),
                "overall_band": flat_overall,
                "reading_avg": round(flat_reading, 1),
                "listening_avg": round(flat_listening, 1),
                "writing_avg": round(flat_writing, 1),
                "speaking_avg": round(flat_speaking, 1),
                "ielts": {
                    "total_sessions": ielts_total,
                    "average_percentage": round(ielts_avg_pct, 1),
                    "overall_band": ielts_overall,
                    "reading_avg": round(ielts_reading_avg, 1),
                    "listening_avg": round(ielts_listening_avg, 1),
                    "writing_avg": round(ielts_writing_avg, 1),
                    "speaking_avg": round(ielts_speaking_avg, 1),
                },
                "toefl": {
                    "total_sessions": toefl_total,
                    "average_percentage": round(toefl_avg_pct, 1),
                    "overall_band": toefl_overall,
                    "reading_avg": round(toefl_reading_avg, 1),
                    "listening_avg": round(toefl_listening_avg, 1),
                    "writing_avg": round(toefl_writing_avg, 1),
                    "speaking_avg": round(toefl_speaking_avg, 1),
                },
                "recent_sessions": recent,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
