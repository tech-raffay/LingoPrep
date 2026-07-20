"""
LingoPrep API — Listening Service
Handles listening audio retrieval and MCQ scoring.
"""

from app.schemas.models import MCQSubmission, MCQResult


SAMPLE_AUDIOS = [
    {
        "id": "la1",
        "title": "University Lecture: Introduction to Renewable Energy",
        "audio_url": "",  # Will point to Supabase Storage
        "transcript": "Good morning, everyone. Today we're going to discuss...",
        "duration_seconds": 225,
        "difficulty": "medium",
        "exam_type": "ielts",
        "questions": [
            {
                "id": "lq1",
                "question_text": "What is the main topic of the lecture?",
                "options": [
                    {"id": "a", "text": "Nuclear energy safety protocols"},
                    {"id": "b", "text": "Fundamentals of renewable energy sources"},
                    {"id": "c", "text": "History of fossil fuel consumption"},
                    {"id": "d", "text": "Economic impact of oil prices"},
                ],
                "correct_option_id": "b",
                "explanation": "The speaker states they will discuss renewable energy fundamentals.",
                "difficulty": "easy",
            },
        ],
    }
]


def get_audios(exam_type: str = None, difficulty: str = None) -> list[dict]:
    """Retrieve listening audios, optionally filtered."""
    audios = SAMPLE_AUDIOS
    if exam_type:
        audios = [a for a in audios if a["exam_type"] == exam_type]
    if difficulty:
        audios = [a for a in audios if a["difficulty"] == difficulty]
    return audios


def get_audio_by_id(audio_id: str) -> dict | None:
    """Retrieve a single audio by ID."""
    for a in SAMPLE_AUDIOS:
        if a["id"] == audio_id:
            return a
    return None


def score_submission(submission: MCQSubmission) -> MCQResult:
    """Score listening MCQ answers."""
    audio = get_audio_by_id(submission.passage_id)
    if not audio:
        raise ValueError(f"Audio '{submission.passage_id}' not found")

    questions = {q["id"]: q for q in audio["questions"]}
    results = []

    for answer in submission.answers:
        question = questions.get(answer.question_id)
        if not question:
            continue
        is_correct = answer.selected_option_id == question["correct_option_id"]
        results.append({
            "question_id": answer.question_id,
            "selected": answer.selected_option_id,
            "correct": question["correct_option_id"],
            "is_correct": is_correct,
            "explanation": question.get("explanation", ""),
        })

    correct_count = sum(1 for r in results if r["is_correct"])
    total = len(results)

    return MCQResult(
        passage_id=submission.passage_id,
        total_questions=total,
        correct_answers=correct_count,
        score_percentage=round((correct_count / total * 100) if total > 0 else 0, 1),
        results=results,
    )
