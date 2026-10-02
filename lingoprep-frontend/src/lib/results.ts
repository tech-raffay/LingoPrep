/**
 * Results-page logic — everything the page says is derived here from the
 * candidate's real practice data, so the copy can never claim something the
 * data does not show.
 *
 * Kept free of React so each rule is easy to read and to test.
 */

import type { ExamType } from "@/lib/exam";

export const SKILLS = ["listening", "reading", "writing", "speaking"] as const;
export type Skill = (typeof SKILLS)[number];

export const SKILL_TITLE: Record<Skill, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

/** One skill's summary, as returned by /api/users/stats → <exam>.modules. */
export interface ModuleSummary {
  count: number;
  avg: number;
  first: number | null;
  latest: number | null;
  latest_at: string | null;
  latest_sub_scores: Record<string, number> | null;
}

export interface SessionRow {
  id: string;
  module: Skill;
  score: number;
  max_score: number;
  percentage: number;
  band_score: number;
  created_at: string;
  exam_type?: string;
  passage_title?: string | null;
  task_type?: string | null;
  is_full_test?: boolean;
}

/* ── Rounding ───────────────────────────────────────────────────────────── */

/**
 * IELTS rounds an average to the nearest half band, with quarters rounding
 * up: 6.25 → 6.5, 6.75 → 7.0, 6.1 → 6.0.
 */
export function roundIelts(x: number): number {
  return Math.floor(x * 2 + 0.5) / 2;
}

/** A skill's score on its own scale: IELTS half bands, TOEFL whole points. */
export function skillScore(avg: number, exam: ExamType): number {
  return exam === "ielts" ? roundIelts(avg) : Math.round(avg);
}

export function fmt(value: number, exam: ExamType): string {
  return exam === "ielts" ? value.toFixed(1) : String(Math.round(value));
}

/* ── Overall ────────────────────────────────────────────────────────────── */

export interface Overall {
  /** Score on the exam's overall scale, or null with no practice yet. */
  value: number | null;
  max: number;
  /** Fraction of the scale, 0–1, for rings and moods. */
  fraction: number;
  practised: Skill[];
}

/**
 * IELTS overall = mean of the practised skills, rounded to a half band.
 * TOEFL total  = sum of the four section scores (0–120). With fewer than four
 * sections practised the total is not comparable to a real one, so `value`
 * is still the sum but `fraction` uses the average section instead — the mood
 * and level then reflect how well the candidate did, not how much they did.
 */
export function overallFor(modules: Record<Skill, ModuleSummary>, exam: ExamType): Overall {
  const practised = SKILLS.filter((s) => modules[s].count > 0);
  if (practised.length === 0) {
    return { value: null, max: exam === "ielts" ? 9 : 120, fraction: 0, practised };
  }
  const scores = practised.map((s) => skillScore(modules[s].avg, exam));
  if (exam === "ielts") {
    const v = roundIelts(scores.reduce((a, b) => a + b, 0) / scores.length);
    return { value: v, max: 9, fraction: v / 9, practised };
  }
  const total = scores.reduce((a, b) => a + b, 0);
  const meanSection = total / scores.length;
  return { value: total, max: 120, fraction: meanSection / 30, practised };
}

/* ── Level descriptor ───────────────────────────────────────────────────── */

/** IELTS's own band descriptors, or ETS's section levels for TOEFL. */
export function levelFor(o: Overall, exam: ExamType): string {
  if (o.value === null) return "No practice yet";
  if (exam === "ielts") {
    const b = o.value;
    return b >= 9 ? "Expert user"
      : b >= 8 ? "Very good user"
      : b >= 7 ? "Good user"
      : b >= 6 ? "Competent user"
      : b >= 5 ? "Modest user"
      : b >= 4 ? "Limited user"
      : "Extremely limited user";
  }
  const section = o.fraction * 30;
  return section >= 24 ? "Advanced"
    : section >= 18 ? "High-intermediate"
    : section >= 4 ? "Low-intermediate"
    : "Below low-intermediate";
}

/* ── Mood (hero illustration) ───────────────────────────────────────────── */

export type MoodKey = "best" | "good" | "mid" | "low" | "none";

/** Same thresholds as the design (7.5 / 6.5 / 5.5 of 9), as fractions so the
 *  TOEFL scale maps onto them proportionally. */
export function moodFor(o: Overall): MoodKey {
  if (o.value === null) return "none";
  const f = o.fraction;
  return f >= 7.5 / 9 ? "best" : f >= 6.5 / 9 ? "good" : f >= 5.5 / 9 ? "mid" : "low";
}

/* ── Strongest, weakest, focus ──────────────────────────────────────────── */

/** Readable names for the criterion keys each module logs. */
const CRITERION: Record<string, string> = {
  task_achievement: "Task achievement",
  coherence_cohesion: "Coherence and cohesion",
  lexical_resource: "Lexical resource",
  grammatical_range: "Grammatical range and accuracy",
  pronunciation_fluency: "Pronunciation and fluency",
  grammar: "Grammar",
  coherence_structure: "Coherence and structure",
};

export interface Focus {
  kind: "weakest" | "untried" | "none";
  skill: Skill | null;
  score: number | null;
  /** One honest sentence explaining the choice. */
  reason: string;
}

export function focusFor(modules: Record<Skill, ModuleSummary>, exam: ExamType): Focus {
  const practised = SKILLS.filter((s) => modules[s].count > 0);
  if (practised.length === 0) {
    return { kind: "none", skill: null, score: null, reason: "" };
  }

  // With only one skill tried, the most useful next step is a new skill —
  // "lowest of one" is not a finding.
  const untried = SKILLS.filter((s) => modules[s].count === 0);
  if (practised.length === 1 && untried.length > 0) {
    const next = untried[0];
    return {
      kind: "untried",
      skill: next,
      score: null,
      reason: `You have only practised ${SKILL_TITLE[practised[0]]} so far. Try ${SKILL_TITLE[next]} to see where you stand across the test.`,
    };
  }

  const weakest = practised.reduce((lo, s) =>
    skillScore(modules[s].avg, exam) < skillScore(modules[lo].avg, exam) ? s : lo
  );
  const m = modules[weakest];
  const score = skillScore(m.avg, exam);

  // Name the weakest criterion from the latest attempt, when it was recorded.
  let reason = `${SKILL_TITLE[weakest]} is your lowest practised skill right now`;
  const subs = m.latest_sub_scores;
  if (subs && Object.keys(subs).length > 1) {
    const entries = Object.entries(subs).filter(([, v]) => typeof v === "number");
    const [key] = entries.reduce((lo, e) => (e[1] < lo[1] ? e : lo));
    const allEqual = entries.every(([, v]) => v === entries[0][1]);
    if (!allEqual && CRITERION[key]) {
      reason = `${CRITERION[key]} scored lowest in your latest ${SKILL_TITLE[weakest]} attempt.`;
      return { kind: "weakest", skill: weakest, score, reason };
    }
  }
  reason += m.count > 1 ? `, averaged over ${m.count} attempts.` : ", from one attempt.";
  return { kind: "weakest", skill: weakest, score, reason };
}

/** Strongest and weakest practised skills, when they genuinely differ. */
export function spreadFor(modules: Record<Skill, ModuleSummary>, exam: ExamType) {
  const practised = SKILLS.filter((s) => modules[s].count > 0);
  if (practised.length < 2) return null;
  const by = (s: Skill) => skillScore(modules[s].avg, exam);
  const strong = practised.reduce((hi, s) => (by(s) > by(hi) ? s : hi));
  const weak = practised.reduce((lo, s) => (by(s) < by(lo) ? s : lo));
  if (by(strong) === by(weak)) return null;
  return { strong, weak };
}

/**
 * Change since the first attempt: for every skill tried at least twice,
 * latest minus first, averaged. Null when no skill has two attempts —
 * a "change" from one data point would be invented.
 */
export function progressFor(modules: Record<Skill, ModuleSummary>, exam: ExamType): number | null {
  const deltas = SKILLS
    .filter((s) => modules[s].count >= 2 && modules[s].first !== null && modules[s].latest !== null)
    .map((s) => (modules[s].latest as number) - (modules[s].first as number));
  if (deltas.length === 0) return null;
  const mean = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  return exam === "ielts" ? Math.round(mean * 2) / 2 : Math.round(mean);
}

export function signed(n: number, exam: ExamType): string {
  const s = exam === "ielts" ? Math.abs(n).toFixed(1) : String(Math.abs(Math.round(n)));
  return n > 0 ? `+${s}` : n < 0 ? `−${s}` : exam === "ielts" ? "0.0" : "0";
}

/* ── History labels ─────────────────────────────────────────────────────── */

export function testLabel(r: SessionRow, exam: ExamType): string {
  if (r.passage_title) return r.passage_title;
  if (r.module === "writing") {
    const t = String(r.task_type ?? "").replace(/\D/g, "");
    if (exam === "ielts" && t) return `Task ${t} essay`;
    return "Essay";
  }
  if (r.module === "speaking") {
    return exam === "ielts" ? "Part 2 long turn" : "Independent response";
  }
  if (r.is_full_test) {
    if (r.module === "reading") return exam === "ielts" ? "Full test · 3 passages" : "Full test · 2 passages";
    return exam === "ielts" ? "Full test · 4 sections" : "Full test · 3 recordings";
  }
  return `${SKILL_TITLE[r.module]} practice`;
}

export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  // Fixed three-letter months ("Sep", not the locale's "Sept").
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
}
