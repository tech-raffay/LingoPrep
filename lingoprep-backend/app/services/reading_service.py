"""
LingoPrep API — Reading Service
Handles reading passage retrieval and MCQ scoring logic.
"""

from app.schemas.models import MCQSubmission, MCQResult


# Sample passage data — will be replaced with Supabase queries
SAMPLE_PASSAGES = [
    {
        "id": "rp1",
        "title": "The Impact of Climate Change on Marine Ecosystems",
        "content": "Climate change has emerged as one of the most significant threats...",
        "word_count": 320,
        "difficulty": "medium",
        "exam_type": "ielts",
        "questions": [
            {
                "id": "q1",
                "question_text": "What happens when water temperatures rise 1-2°C above normal?",
                "options": [
                    {"id": "a", "text": "Coral reefs grow faster"},
                    {"id": "b", "text": "Corals undergo bleaching"},
                    {"id": "c", "text": "Marine species migrate"},
                    {"id": "d", "text": "Phytoplankton increase"},
                ],
                "correct_option_id": "b",
                "explanation": "Corals expel symbiotic algae causing bleaching.",
                "difficulty": "medium",
            },
        ],
    }
]


def get_passages(exam_type: str = None, difficulty: str = None) -> list[dict]:
    """Retrieve reading passages, optionally filtered."""
    passages = SAMPLE_PASSAGES
    if exam_type:
        passages = [p for p in passages if p["exam_type"] == exam_type]
    if difficulty:
        passages = [p for p in passages if p["difficulty"] == difficulty]
    return passages


def get_passage_by_id(passage_id: str) -> dict | None:
    """Retrieve a single passage by ID."""
    for p in SAMPLE_PASSAGES:
        if p["id"] == passage_id:
            return p
    return None


def score_submission(submission: MCQSubmission) -> MCQResult:
    """Score a set of MCQ answers against the correct answers."""
    passage = get_passage_by_id(submission.passage_id)
    if not passage:
        raise ValueError(f"Passage '{submission.passage_id}' not found")

    questions = {q["id"]: q for q in passage["questions"]}
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
