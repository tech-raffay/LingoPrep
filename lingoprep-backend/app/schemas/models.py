"""
LingoPrep API — Pydantic Schemas (Request/Response Models)
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# --- Enums ---

class ExamType(str, Enum):
    IELTS = "ielts"
    TOEFL = "toefl"


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ModuleType(str, Enum):
    READING = "reading"
    LISTENING = "listening"
    WRITING = "writing"


# --- MCQ / Questions ---

class MCQOptionSchema(BaseModel):
    id: str
    text: str


class MCQQuestionSchema(BaseModel):
    id: str
    question_text: str
    options: list[MCQOptionSchema]
    correct_option_id: str
    explanation: Optional[str] = None
    difficulty: Difficulty


class ReadingPassageSchema(BaseModel):
    id: str
    title: str
    content: str
    word_count: int
    difficulty: Difficulty
    exam_type: ExamType
    questions: list[MCQQuestionSchema]


class ListeningAudioSchema(BaseModel):
    id: str
    title: str
    audio_url: str
    transcript: Optional[str] = None
    duration_seconds: int
    difficulty: Difficulty
    exam_type: ExamType
    questions: list[MCQQuestionSchema]


# --- Answer Submission ---

class AnswerSubmission(BaseModel):
    question_id: str
    selected_option_id: str


class MCQSubmission(BaseModel):
    """Submit answers for a reading or listening passage."""
    passage_id: str
    answers: list[AnswerSubmission]


class MCQResult(BaseModel):
    passage_id: str
    total_questions: int
    correct_answers: int
    score_percentage: float
    results: list[dict]


# --- Writing Module ---

class EssaySubmissionSchema(BaseModel):
    prompt: str
    essay_text: str = Field(..., min_length=50)
    exam_type: ExamType
    task_type: Optional[str] = None  # e.g., "task1", "task2" for IELTS


class EssayEvaluationSchema(BaseModel):
    overall_band: float
    task_achievement: float
    coherence_cohesion: float
    lexical_resource: float
    grammatical_range: float
    feedback: str
    suggestions: list[str]
    improved_version: Optional[str] = None


# --- Session Logs ---

class SessionLogSchema(BaseModel):
    id: Optional[str] = None
    user_id: str
    module: ModuleType
    score: float
    max_score: float
    percentage: float
    details: Optional[dict] = None
    created_at: Optional[datetime] = None


# --- User ---

class UserSchema(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    target_exam: ExamType
    target_score: Optional[float] = None
    created_at: Optional[datetime] = None


class UserUpdateSchema(BaseModel):
    full_name: Optional[str] = None
    target_exam: Optional[ExamType] = None
    target_score: Optional[float] = None


# --- Generic API Response ---

class ApiResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[dict] = None
    error: Optional[str] = None
