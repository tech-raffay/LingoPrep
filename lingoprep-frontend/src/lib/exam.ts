/**
 * LingoPrep — exam theme, single source of truth.
 *
 * Brand book §07: "The interface reads one accent token. Selecting TOEFL swaps
 * crimson for blue across buttons, badges, radios, progress bars and score
 * circles — layout and neutrals never change. Never mix both accents on one
 * screen."
 *
 * Before this file, eight components each declared their own `examColors` map
 * and the values had already drifted (#fef2f2 vs the brand book's #FEF2F4,
 * #a50d24 vs #96091F). Every accent value now lives here and in globals.css,
 * and nowhere else.
 *
 * Prefer the CSS variables (var(--accent), or Tailwind bg-accent / text-accent
 * / border-accent / bg-accent-tint) over importing these hex values. They are
 * re-bound by [data-exam] on <html>, so a component written against them can
 * never render the wrong exam's colour. The values below exist for the few
 * places CSS cannot reach — SVG gradient stops, canvas, chart libraries.
 */

export type ExamType = "ielts" | "toefl";

/** localStorage key holding the candidate's chosen exam. */
export const EXAM_STORAGE_KEY = "lingoprep_exam";

/** The default exam when nothing has been chosen (brand book: scheme 01). */
export const DEFAULT_EXAM: ExamType = "ielts";

export interface ExamTheme {
  /** URL/storage value. */
  id: ExamType;
  /** Display name, safe to render as plain descriptive text (§14). */
  name: string;
  /** Full name with the ® mark — use on first mention on a page (§14). */
  legalName: string;
  /** Accent — brand book §07 exam theme accents. */
  accent: string;
  /** Hover / pressed states, and accent text on tint. */
  accentStrong: string;
  /** Selected rows, badges, section headers. */
  accentTint: string;
  /** Text colour that meets 4.5:1 on `accent`. */
  accentOn: string;

  /* ── Scoring — the two exams score on different scales (§10) ───────── */
  /** Highest score for a single module. */
  moduleMax: number;
  /** Highest overall score. */
  overallMax: number;
  /** Decimal places for a score. "One decimal for IELTS, integer for TOEFL." */
  scoreDecimals: number;
  /** Label above a score circle. */
  scoreLabel: string;
  /** Word for a single module's score: "band score" / "section score" (§02). */
  scoreNoun: string;
  /** Human-readable range, e.g. "Band 1–9". */
  scoreRange: string;
}

const IELTS: ExamTheme = {
  id: "ielts",
  name: "IELTS",
  legalName: "IELTS®",
  accent: "#C8102E",
  accentStrong: "#96091F",
  accentTint: "#FEF2F4",
  accentOn: "#FFFFFF",
  moduleMax: 9,
  overallMax: 9,
  scoreDecimals: 1,
  scoreLabel: "IELTS band",
  scoreNoun: "band score",
  scoreRange: "Band 1–9",
};

const TOEFL: ExamTheme = {
  id: "toefl",
  name: "TOEFL",
  legalName: "TOEFL iBT®",
  accent: "#0057B8",
  accentStrong: "#004494",
  accentTint: "#EFF6FF",
  accentOn: "#FFFFFF",
  moduleMax: 30,
  overallMax: 120,
  scoreDecimals: 0,
  scoreLabel: "TOEFL score",
  scoreNoun: "section score",
  scoreRange: "Score 0–120",
};

export const EXAM_THEMES: Record<ExamType, ExamTheme> = {
  ielts: IELTS,
  toefl: TOEFL,
};

/** Narrow any unknown value to a valid ExamType, falling back to the default. */
export function normalizeExam(value: unknown): ExamType {
  return value === "toefl" || value === "ielts" ? value : DEFAULT_EXAM;
}

/** True only for an exact, valid exam id — use when `null` must stay `null`. */
export function isExamType(value: unknown): value is ExamType {
  return value === "ielts" || value === "toefl";
}

/** The theme for an exam, tolerant of junk input. */
export function themeFor(exam: unknown): ExamTheme {
  return EXAM_THEMES[normalizeExam(exam)];
}

/**
 * Format a score on the exam's own scale — one decimal for IELTS bands,
 * a whole number for TOEFL section and total scores (§10).
 */
export function formatScore(value: number | null | undefined, exam: ExamType): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(EXAM_THEMES[exam].scoreDecimals);
}

/** A score as a 0–1 fraction of its scale, clamped. For bars and rings. */
export function scoreFraction(value: number, max: number): number {
  if (!Number.isFinite(value) || max <= 0) return 0;
  return Math.min(1, Math.max(0, value / max));
}
