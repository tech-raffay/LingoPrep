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

// --- IELTS Reading Question Types ---
export type ReadingQuestionType =
  | "multiple_choice"
  | "tfng"
  | "yng"
  | "matching_headings"
  | "matching_info"
  | "matching_features"
  | "matching_sentence_endings"
  | "sentence_completion"
  | "summary_completion"
  | "note_completion"
  | "table_completion"
  | "flowchart_completion"
  | "diagram_label"
  | "short_answer";

/** Returns true for types that use option radio buttons */
export function isOptionBasedType(type: ReadingQuestionType): boolean {
  return type === "multiple_choice" || type === "tfng" || type === "yng";
}

// --- Question Bank ---
export interface MCQOption {
  id: string;
  text: string;
  label: string;
}

export interface MCQQuestion {
  id: string;
  passage_id?: string;
  question_text: string;
  question_type: ReadingQuestionType;
  question_group_label: string;
  question_data: QuestionData;
  correct_answer_text: string;
  options: MCQOption[];
  correct_option_id: string;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  sort_order: number;
}

// --- Rich question data for visual types ---
export interface QuestionData {
  // Matching Headings
  headings?: { label: string; text: string }[];
  // Matching Information
  paragraphs?: string[];
  // Matching Features
  features?: { label: string; text: string }[];
  // Matching Sentence Endings
  endings?: { label: string; text: string }[];
  // Sentence / Short Answer Completion
  max_words?: number;
  instruction?: string;
  // Summary Completion
  summary_text?: string;
  has_word_list?: boolean;
  word_list?: string[];
  // Note Completion
  notes?: { heading: string; items: string[] }[];
  // Table Completion
  columns?: string[];
  rows?: string[][];
  // Flowchart Completion
  nodes?: { text: string; is_blank: boolean }[];
  direction?: "vertical" | "horizontal";
  // Diagram Label Completion
  diagram_type?: string;
  diagram_title?: string;
  elements?: { label?: string; text?: string; position?: string; clue?: string }[];
  diagram_description?: string;
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

// --- Question Group (for rendering) ---
export interface QuestionGroup {
  label: string;
  type: ReadingQuestionType;
  questions: MCQQuestion[];
  data: QuestionData;
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
