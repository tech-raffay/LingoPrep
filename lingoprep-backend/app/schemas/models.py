"""
LingoPrep API — Pydantic Schemas (Request/Response Models)
"""

from pydantic import BaseModel, Field, ConfigDict, model_validator
from typing import Optional, Literal
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
    SPEAKING = "speaking"


# --- MCQ / Questions ---

class MCQOptionSchema(BaseModel):
    id: str
    text: str


class MCQQuestionSchema(BaseModel):
    id: str
    question_text: str
    options: list[MCQOptionSchema]
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
    question_id: str = Field(..., min_length=1, max_length=100)
    selected_option_id: str = Field("", max_length=100)  # For MCQ / TFNG / YNG types
    answer_text: str = Field("", max_length=2000)  # For text-input / matching / completion types


class MCQSubmission(BaseModel):
    """Submit answers for a reading or listening passage."""
    passage_id: str = Field(..., min_length=1, max_length=100)
    answers: list[AnswerSubmission] = Field(..., min_length=1, max_length=200)


class AttemptResult(BaseModel):
    """Persistence metadata supplied by the reliable submission route."""
    attempt_id: Optional[str] = None
    saved: bool = False
    save_retry_available: bool = False


class MCQResult(AttemptResult):
    passage_id: str
    total_questions: int
    correct_answers: int
    score_percentage: float
    results: list[dict]


class FullTestSubmission(BaseModel):
    """Submit answers for a full IELTS/TOEFL exam."""
    answers: list[AnswerSubmission] = Field(..., min_length=1, max_length=200)
    exam_type: Literal["ielts", "toefl"] = "ielts"  # "ielts" or "toefl"


class FullTestResult(AttemptResult):
    total_questions: int
    correct_answers: int
    score_percentage: float
    band_score: float
    results: list[dict]
    # True only when the attempt was stored against a signed-in user, so the
    # score report can say "Saved to your results" truthfully.
    saved: bool = False


# --- Writing Module ---

class EssaySubmissionSchema(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    prompt: str = Field(..., min_length=1, max_length=4000)
    essay_text: str = Field(..., min_length=50, max_length=20000)
    exam_type: ExamType
    task_type: Optional[str] = Field(None, max_length=40)  # e.g., "task1", "task2" for IELTS


    @model_validator(mode="after")
    def validate_task(self):
        allowed = {"ielts": {"1", "2", "task1", "task2"}, "toefl": {"1", "2", "3", "task1", "task2", "task3"}}
        if self.task_type is not None and self.task_type not in allowed[self.exam_type.value]:
            raise ValueError("Unsupported writing task for this exam.")
        return self


class EssayEvaluationSchema(AttemptResult):
    overall_band: float
    task_achievement: float
    coherence_cohesion: float
    lexical_resource: float
    grammatical_range: float
    feedback: str
    suggestions: list[str]
    # True only when the attempt was stored against a signed-in user, so the
    # score report can say "Saved to your results" truthfully.
    saved: bool = False
    improved_version: Optional[str] = None





# --- Speaking Module ---

class SpeakingSubmissionSchema(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    prompt: str = Field(..., min_length=1, max_length=4000)
    transcript: str = Field(..., min_length=10, max_length=12000)
    exam_type: ExamType
    task_type: Optional[str] = Field(None, max_length=40)  # e.g., "part1", "part2", "independent", "integrated"


    @model_validator(mode="after")
    def validate_task(self):
        allowed = {"ielts": {"part1", "part2", "part3"}, "toefl": {"independent", "integrated", "listen_repeat", "interview"}}
        if self.task_type is not None and self.task_type not in allowed[self.exam_type.value]:
            raise ValueError("Unsupported speaking task for this exam.")
        return self


class SpeakingEvaluationSchema(AttemptResult):
    feedback: str
    suggestions: list[str]
    assessment_type: Literal["transcript_feedback"] = "transcript_feedback"
    overall_band: None = None
    pronunciation_fluency: None = None
    saved: Literal[False] = False


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
