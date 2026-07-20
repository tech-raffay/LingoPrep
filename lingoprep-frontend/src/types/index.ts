// ==========================================
// LingoPrep — Shared TypeScript Interfaces
// ==========================================

// --- User & Auth ---
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  target_exam: "ielts" | "toefl";
  target_score?: number;
  created_at: string;
  updated_at: string;
}

// --- Question Bank ---
export interface MCQOption {
  id: string;
  text: string;
}

export interface MCQQuestion {
  id: string;
  passage_id?: string;
  question_text: string;
  options: MCQOption[];
  correct_option_id: string;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface ReadingPassage {
  id: string;
  title: string;
  content: string;
  word_count: number;
  difficulty: "easy" | "medium" | "hard";
  exam_type: "ielts" | "toefl";
  questions: MCQQuestion[];
}

export interface ListeningAudio {
  id: string;
  title: string;
  audio_url: string;
  transcript?: string;
  duration_seconds: number;
  difficulty: "easy" | "medium" | "hard";
  exam_type: "ielts" | "toefl";
  questions: MCQQuestion[];
}

// --- Session & Scoring ---
export interface SessionLog {
  id: string;
  user_id: string;
  module: "reading" | "listening" | "writing";
  score: number;
  max_score: number;
  percentage: number;
  details: Record<string, unknown>;
  created_at: string;
}

// --- Writing Module ---
export interface EssaySubmission {
  prompt: string;
  essay_text: string;
  exam_type: "ielts" | "toefl";
  task_type?: "task1" | "task2"; // IELTS specific
}

export interface EssayEvaluation {
  overall_band: number;
  task_achievement: number;
  coherence_cohesion: number;
  lexical_resource: number;
  grammatical_range: number;
  feedback: string;
  suggestions: string[];
  improved_version?: string;
}

// --- API Response Wrappers ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// --- Dashboard ---
export interface DashboardStats {
  total_sessions: number;
  average_score: number;
  reading_avg: number;
  listening_avg: number;
  writing_avg: number;
  recent_sessions: SessionLog[];
  score_trend: { date: string; score: number }[];
}
