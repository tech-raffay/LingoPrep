"use client";

/**
 * Score report — the screen shown the moment any test is submitted.
 * From "frontend pages svg illustrations/Listening Score Report.dc.html",
 * generalised so all four skills share one report:
 *
 *  - Reading / Listening pass `sections`: the design's section tabs, the
 *    All / Incorrect / Correct filter, the learning-materials panel (passage
 *    or transcript) and a "Your answer / Correct answer / Why" card per item.
 *  - Writing / Speaking pass `review` instead: their criterion breakdown and
 *    feedback, inside the same frame.
 *
 * The hero card's mascot and wording follow the score; "Saved to your
 * results" is shown only when the backend confirms the save (`saved`), so the
 * report never claims a link to the Results page that did not happen.
 */

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useExam } from "@/components/theme/ExamThemeProvider";
import Icon from "@/components/brand/Icon";
import Art from "@/components/brand/Art";
import Reveal from "@/components/brand/Reveal";
import { mascotArt, skillArt, type MascotMood, type SkillKey } from "@/lib/illustrations";
import { HUES } from "@/lib/skillHues";

/* ── Public types ───────────────────────────────────────────────────────── */

export interface ReviewItem {
  id: string;
  num: number;
  question: string;
  /** null when the candidate left it blank. */
  your: string | null;
  answer: string;
  ok: boolean;
  why?: string | null;
}

export interface ReviewSection {
  title: string;
  items: ReviewItem[];
  material?: { kind: "transcript" | "passage"; text: string };
}

export interface ReportFact {
  label: string;
  value: string;
}

const SKILL_TITLE: Record<SkillKey, string> = {
  listening: "Listening", reading: "Reading", writing: "Writing", speaking: "Speaking",
};

/* ── Mood ───────────────────────────────────────────────────────────────── */

const MOOD: Record<MascotMood, {
  sub: string; lead: string; bg: string; fg: string; anim: string; spark?: string;
}> = {
  best: { sub: "OUTSTANDING", lead: "Brilliant result.", bg: "#FFF4DE", fg: "#8A4B06", spark: "#F59E0B",
    anim: "lp-jump 1.6s cubic-bezier(.45,0,.3,1) infinite" },
  good: { sub: "GREAT WORK", lead: "Strong result.", bg: "var(--success-tint)", fg: "#15803D", spark: "#22C55E",
    anim: "lp-sway 3.2s ease-in-out infinite" },
  mid: { sub: "GETTING THERE", lead: "Good progress.", bg: "var(--accent-tint)", fg: "var(--accent-on-tint)",
    anim: "lp-breathe 4s ease-in-out infinite" },
  low: { sub: "KEEP PRACTISING", lead: "Every test helps.", bg: "#EEF0F6", fg: "var(--n-700)",
    anim: "lp-droop 5s ease-in-out infinite" },
};

/** The design's band thresholds (7.5 / 6.5 / 5.5 of 9), as fractions so the
 *  TOEFL 0–30 scale maps onto them proportionally. */
function moodFor(fraction: number): MascotMood {
  return fraction >= 7.5 / 9 ? "best" : fraction >= 6.5 / 9 ? "good" : fraction >= 5.5 / 9 ? "mid" : "low";
}

const ACCENT_GRADIENT =
  "linear-gradient(180deg, color-mix(in srgb, var(--accent) 88%, white), color-mix(in srgb, var(--accent) 88%, black))";

/* ═══════════════════════════════════════════════════════════════════════ */

export default function ScoreReport({
  skill,
  score,
  correct,
  total,
  percentage,
  facts,
  saved,
  sections,
  review,
  onRetake,
}: {
  skill: SkillKey;
  /** Band (IELTS) or section score (TOEFL). */
  score: number;
  correct?: number;
  total?: number;
  percentage?: number;
  /** Rows beside the ring; defaults to raw score + percentage. */
  facts?: ReportFact[];
  /** Backend-confirmed save. Undefined when the backend did not say. */
  saved?: boolean;
  sections?: ReviewSection[];
  review?: ReactNode;
  onRetake: () => void;
}) {
  const { exam, withExam } = useExam();
  const { user } = useAuth();
  const max = exam === "ielts" ? 9 : 30;
  const fraction = Math.max(0, Math.min(1, score / max));
  const moodKey = moodFor(fraction);
  const mood = MOOD[moodKey];
  const title = SKILL_TITLE[skill];
  const shown = exam === "ielts" ? score.toFixed(1) : String(Math.round(score));
  const scale = exam === "ielts"
    ? `Scored on the IELTS ${title} band scale.`
    : `Scored on the TOEFL iBT ${title} 0–30 scale.`;

  const rows: ReportFact[] = facts ?? [
    ...(correct !== undefined && total !== undefined
      ? [{ label: "Raw score", value: `${correct} / ${total} correct` }] : []),
    ...(percentage !== undefined ? [{ label: "Percentage", value: `${Math.round(percentage)}%` }] : []),
  ];

  return (
    <>
      {/* ═══ Hero card ═══════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden border-b"
        style={{
          background: "color-mix(in srgb, var(--accent-tint) 45%, white)",
          borderColor: "color-mix(in srgb, var(--accent) 10%, var(--n-200))",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: "radial-gradient(color-mix(in srgb, var(--accent) 12%, transparent) 1.2px, transparent 1.2px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(ellipse 60% 70% at 50% 40%, #000 15%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 70% at 50% 40%, #000 15%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-7 pt-8 sm:pt-11 pb-10 sm:pb-14 flex justify-center">
          <Reveal
            className="relative w-full max-w-[640px] rounded-[28px] bg-n-0 border px-5 pt-7 pb-7 sm:px-9 sm:pt-8 sm:pb-9 flex flex-col items-center text-center gap-5"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 10%, var(--n-200))",
              boxShadow: "0 30px 70px -24px color-mix(in srgb, var(--accent) 25%, transparent), 0 4px 14px rgb(18 23 43 / .04)",
            }}
          >
            {/* Mascot */}
            <div
              key={moodKey}
              className="relative w-[150px] h-[150px] -mb-2"
              style={{ animation: "lp-pop .5s cubic-bezier(.2,.8,.2,1.2)" }}
            >
              <div
                className="absolute left-[28%] right-[28%] bottom-[3%] h-[5%] rounded-[50%] bg-ink opacity-20 blur-[4px]"
                aria-hidden="true"
                style={{ animation: moodKey === "best" ? "lp-jump-shadow 1.6s cubic-bezier(.45,0,.3,1) infinite" : undefined }}
              />
              <div className="relative w-full h-full origin-bottom" style={{ animation: mood.anim }}>
                <Art art={mascotArt(exam, moodKey)} priority sizes="150px" className="w-full h-full object-contain" />
              </div>
              {mood.spark && ([[-6, 18, 0, 16], [92, 26, 0.5, 14], [0, 70, 1.1, 12], [90, 72, 0.8, 14]] as const).map(([x, y, d, s], i) => (
                <svg
                  key={i} width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" className="absolute"
                  style={{ left: `${x}%`, top: `${y}%`, animation: `lp-twinkle ${moodKey === "best" ? 1.4 : 2.4}s ease-in-out ${d}s infinite` }}
                >
                  <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill={i % 2 ? "var(--accent)" : mood.spark} />
                </svg>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2">
              <span
                className="rounded-full px-3 py-[5px] text-[11.5px] font-bold tracking-[.12em] whitespace-nowrap"
                style={{ background: mood.bg, color: mood.fg }}
              >
                {mood.sub}
              </span>
              <h1 className="text-[26px] sm:text-[34px] leading-[1.15] tracking-[-0.035em]">
                Your {title} Score Report
              </h1>
              <p className="text-[15px] text-n-600">{mood.lead} {scale}</p>
            </div>

            {/* Ring + facts */}
            <div className="w-full flex flex-wrap items-center justify-center gap-x-8 gap-y-5 py-[22px] border-y border-[#F1F3F7]">
              <div
                className="w-[132px] h-[132px] rounded-full flex items-center justify-center shrink-0"
                style={{ background: `conic-gradient(var(--accent) 0 ${(fraction * 100).toFixed(1)}%, var(--accent-tint) ${(fraction * 100).toFixed(1)}% 100%)` }}
                role="img"
                aria-label={`${exam === "ielts" ? "Band" : "Score"} ${shown} out of ${max}`}
              >
                <div className="w-[108px] h-[108px] rounded-full bg-n-0 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-[10.5px] font-bold tracking-[.14em] text-n-500">
                    {exam === "ielts" ? "IELTS BAND" : "TOEFL SCORE"}
                  </span>
                  <span className="t-numeric text-[36px] tracking-[-0.03em] leading-none text-ink">{shown}</span>
                  {exam === "toefl" && <span className="text-[11px] font-bold text-n-500">out of 30</span>}
                </div>
              </div>
              {rows.length > 0 && (
                <dl className="flex flex-col gap-3 text-left">
                  {rows.map((r) => (
                    <div key={r.label} className="flex items-baseline gap-3.5">
                      <dt className="text-[14px] font-bold text-n-500 w-[92px] shrink-0">{r.label}</dt>
                      <dd className="text-[17px] font-bold text-ink whitespace-nowrap">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto justify-center">
              <button
                type="button"
                onClick={onRetake}
                className="inline-flex items-center justify-center gap-2.5 h-[50px] px-[22px] rounded-full border border-n-300 bg-n-0 text-[15px] font-bold text-ink cursor-pointer
                           transition-[border-color,transform] duration-200 hover:border-ink hover:-translate-y-0.5"
              >
                <Icon name="retry" size={16} />
                Retake test
              </button>
              <Link
                href={withExam("/dashboard")}
                className="inline-flex items-center justify-center gap-3 rounded-full py-1.5 pr-1.5 pl-[22px] text-[15px] font-bold text-accent-on hover:text-accent-on whitespace-nowrap
                           transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5"
                style={{
                  background: ACCENT_GRADIENT,
                  boxShadow: "inset 0 1px 0 rgb(255 255 255 / .25), 0 10px 24px color-mix(in srgb, var(--accent) 30%, transparent)",
                }}
              >
                See your results
                <span className="w-[38px] h-[38px] rounded-full bg-n-0 text-accent flex items-center justify-center">
                  <Icon name="next" size={16} />
                </span>
              </Link>
            </div>

            <SaveStatus signedIn={!!user} saved={saved} />
          </Reveal>
        </div>
      </section>

      {/* ═══ Review ══════════════════════════════════════════════════════ */}
      <div className="bg-n-50">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-7 pt-12 sm:pt-14 pb-20 sm:pb-24">
          {sections ? <AnswerReview skill={skill} sections={sections} /> : review}
        </div>
      </div>
    </>
  );
}

/* ── Save status ────────────────────────────────────────────────────────── */

function SaveStatus({ signedIn, saved }: { signedIn: boolean; saved?: boolean }) {
  if (!signedIn) {
    return (
      <p className="flex flex-wrap items-center justify-center gap-x-1.5 text-[13px] font-bold text-n-600">
        <Icon name="info" size={16} className="text-n-500" />
        Practising as a guest, so this score isn&rsquo;t saved.
        <Link href="/auth/login" className="text-accent hover:text-accent-strong">Sign in to keep your results</Link>
      </p>
    );
  }
  if (saved === false) {
    return (
      <p className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-[#92400E]">
        <Icon name="warning" size={16} className="shrink-0" />
        We couldn&rsquo;t save this attempt to your results. Your score above is still correct.
      </p>
    );
  }
  if (saved === true) {
    return (
      <p className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-success">
        <Icon name="check" size={16} className="shrink-0" />
        Saved to your results
      </p>
    );
  }
  return null;
}

/* ── Answer review (Reading / Listening) ────────────────────────────────── */

type Filter = "All" | "Incorrect" | "Correct";

function AnswerReview({ skill, sections }: { skill: SkillKey; sections: ReviewSection[] }) {
  const { exam } = useExam();
  const [sec, setSec] = useState(0);
  const [filter, setFilter] = useState<Filter>("All");
  const [open, setOpen] = useState(false);
  const active = sections[sec] ?? sections[0];
  const hue = HUES[skill];
  const unit = skill === "listening" ? "Section" : "Passage";

  const items = useMemo(
    () => active.items.filter((q) => filter === "All" || (filter === "Correct" ? q.ok : !q.ok)),
    [active, filter]
  );

  const materialLabel = active.material?.kind === "passage" ? "passage" : "transcript";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-[22px]">
        <div>
          <span className="t-label text-accent text-[12.5px] tracking-[.16em]">Detailed review</span>
          <h2 className="text-[26px] sm:text-[30px] mt-2">Review your answers</h2>
        </div>
        <div className="flex gap-1 p-1 rounded-full bg-n-0 border border-[#E9ECF2]" role="tablist" aria-label="Filter answers">
          {(["All", "Incorrect", "Correct"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-[13.5px] font-bold whitespace-nowrap cursor-pointer transition-colors duration-200 ${
                filter === f ? "bg-ink text-white" : "text-n-600 hover:text-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Section tabs */}
      {sections.length > 1 && (
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2.5 mb-6">
          {sections.map((s, n) => {
            const on = n === sec;
            const right = s.items.filter((q) => q.ok).length;
            return (
              <button
                key={n}
                type="button"
                onClick={() => { setSec(n); setOpen(false); }}
                aria-pressed={on}
                className="lg:flex-[1_1_200px] min-w-0 flex items-center gap-3 px-3.5 sm:px-4 py-3 rounded-2xl border text-left cursor-pointer transition-colors duration-200"
                style={{
                  borderColor: on ? "color-mix(in srgb, var(--accent) 28%, white)" : "#E9ECF2",
                  background: on ? "#fff" : "var(--n-50)",
                }}
              >
                <span
                  className="w-[34px] h-[34px] rounded-[11px] t-numeric text-[14px] flex items-center justify-center shrink-0"
                  style={{ background: on ? "var(--accent)" : "#F1F3F7", color: on ? "var(--accent-on)" : "var(--n-600)" }}
                >
                  {n + 1}
                </span>
                <span className="flex flex-col min-w-0 flex-1">
                  <span className="text-[14px] font-bold text-ink truncate">{s.title}</span>
                  <span className="text-[12px] font-bold text-n-500">{right}/{s.items.length} correct</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Learning materials */}
        <aside className="w-full lg:w-[320px] lg:shrink-0 lg:sticky lg:top-[80px] rounded-[22px] bg-n-0 border border-[#E9ECF2] overflow-hidden">
          <div className="relative h-[150px] flex items-center justify-center overflow-hidden" style={{ background: hue.tint }}>
            <div className="absolute inset-0" aria-hidden="true"
              style={{ backgroundImage: `radial-gradient(${hue.dot} 1.3px, transparent 1.3px)`, backgroundSize: "18px 18px" }} />
            <div className="absolute w-[140px] h-[140px] bg-white/85" aria-hidden="true"
              style={{ borderRadius: "44% 56% 50% 50% / 55% 45% 55% 45%" }} />
            <Art art={skillArt(exam, skill)} sizes="132px" className="relative h-[132px] w-auto" />
          </div>
          <div className="px-[22px] pt-5 pb-[22px] flex flex-col gap-3">
            <span className="t-label text-n-500 text-[12px] tracking-[.14em]">
              {unit} {sec + 1} · Learning materials
            </span>
            <h3 className="text-[18px] leading-[1.3]">{active.title}</h3>
            {active.material ? (
              <>
                {open ? (
                  <div className="max-h-[420px] overflow-y-auto rounded-xl bg-n-50 border border-n-200 p-4 text-[14px] leading-[1.75] text-n-700 whitespace-pre-line">
                    {active.material.text}
                  </div>
                ) : (
                  <p className="text-[14px] leading-[1.7] text-n-600">
                    Open the {materialLabel} to read it in full and see where each answer comes from.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  aria-expanded={open}
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent-tint px-4 py-[11px] text-[14px] font-bold text-accent cursor-pointer transition-colors duration-200 hover:text-accent-strong"
                >
                  <Icon name="report" size={16} />
                  {open ? `Hide ${materialLabel}` : `Show ${materialLabel}`}
                </button>
              </>
            ) : (
              <p className="text-[14px] leading-[1.7] text-n-600">No {materialLabel} is available for this {unit.toLowerCase()}.</p>
            )}
          </div>
        </aside>

        {/* Question cards */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
          {items.map((q) => <QuestionCard key={q.id} q={q} />)}
          {items.length === 0 && (
            <div className="rounded-[20px] bg-n-0 border border-dashed border-n-300 p-9 text-center text-[14.5px] text-n-600">
              {filter === "Incorrect"
                ? `Every answer in this ${unit.toLowerCase()} is correct.`
                : `No correct answers in this ${unit.toLowerCase()} yet.`}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function QuestionCard({ q }: { q: ReviewItem }) {
  const skipped = !q.ok && (q.your === null || q.your.trim() === "");
  const status = q.ok ? "CORRECT" : skipped ? "UNANSWERED" : "INCORRECT";
  // Semantic colours, never the exam accent (§07): green right, red wrong.
  const tint = q.ok ? "var(--success-tint)" : skipped ? "#F1F3F7" : "var(--error-tint)";
  const fg = q.ok ? "#15803D" : skipped ? "var(--n-600)" : "#B91C1C";
  const iconPath = q.ok ? "M20 6 9 17 4 12" : skipped ? "M5 12h14" : "M18 6 6 18M6 6l12 12";

  return (
    <div className="rounded-[20px] bg-n-0 border border-[#E9ECF2] px-4 py-[18px] sm:px-[22px] sm:py-5 flex gap-3 sm:gap-4
                    transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-14px_rgb(18_23_43/0.18)]">
      <span className="w-8 h-8 rounded-full t-numeric text-[13px] flex items-center justify-center shrink-0" style={{ background: tint, color: fg }}>
        {q.num}
      </span>
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
          <h4 className="text-[15.5px] sm:text-[16px] leading-[1.45] tracking-[-0.01em]">{q.question}</h4>
          <span
            className="self-start inline-flex items-center gap-[5px] rounded-full px-2.5 py-[5px] text-[11.5px] font-bold tracking-[.08em] whitespace-nowrap shrink-0"
            style={{ background: tint, color: fg }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={iconPath} />
            </svg>
            {status}
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <div className="rounded-xl px-3.5 py-2.5" style={{ background: q.ok ? "#F0FAF4" : skipped ? "var(--n-100)" : "#FFF5F6" }}>
            <div className="text-[11px] font-bold tracking-[.1em] text-n-500">YOUR ANSWER</div>
            <div className="text-[14.5px] font-bold mt-[3px] break-words" style={{ color: q.ok ? "#15803D" : skipped ? "var(--n-500)" : "#B91C1C" }}>
              {skipped ? "No answer" : q.your}
            </div>
          </div>
          <div className="rounded-xl px-3.5 py-2.5 bg-[#F0FAF4]">
            <div className="text-[11px] font-bold tracking-[.1em] text-n-500">CORRECT ANSWER</div>
            <div className="text-[14.5px] font-bold mt-[3px] text-[#15803D] break-words">{q.answer || "—"}</div>
          </div>
        </div>
        {q.why && (
          <p className="text-[13.5px] leading-[1.6] text-n-600">
            <strong className="text-ink">Why:</strong> {q.why}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Criteria review (Writing / Speaking) ───────────────────────────────── */

/** The AI's feedback leans on em-dashes; show them as plain commas so the
 *  report reads like an examiner, not a chatbot. */
const plain = (t: string) => t.replace(/\s*—\s*/g, ", ");

export interface Criterion {
  label: string;
  value: number;
  max: number;
}

/**
 * The review half of the report for AI-scored skills: one card per criterion
 * (lowest flagged as the focus), the examiner-style feedback, and the
 * suggestions — beside the candidate's own response, as the learning
 * material.
 */
export function CriteriaReview({
  skill,
  prompt,
  response,
  responseLabel,
  criteria,
  feedback,
  suggestions,
}: {
  skill: SkillKey;
  prompt?: string;
  response?: string;
  responseLabel: string;
  criteria: Criterion[];
  feedback?: string;
  suggestions?: string[];
}) {
  const { exam } = useExam();
  const [open, setOpen] = useState(false);
  const hue = HUES[skill];
  const fmt = (v: number, max: number) => (max <= 9 ? v.toFixed(1) : String(Math.round(v)));
  const lowest = criteria.length > 1
    ? criteria.reduce((lo, c) => (c.value / c.max < lo.value / lo.max ? c : lo))
    : null;
  const allEqual = criteria.every((c) => c.value / c.max === criteria[0]?.value / criteria[0]?.max);

  return (
    <>
      <div className="mb-[22px]">
        <span className="t-label text-accent text-[12.5px] tracking-[.16em]">Detailed review</span>
        <h2 className="text-[26px] sm:text-[30px] mt-2">How you were scored</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <aside className="w-full lg:w-[320px] lg:shrink-0 lg:sticky lg:top-[80px] rounded-[22px] bg-n-0 border border-[#E9ECF2] overflow-hidden">
          <div className="relative h-[150px] flex items-center justify-center overflow-hidden" style={{ background: hue.tint }}>
            <div className="absolute inset-0" aria-hidden="true"
              style={{ backgroundImage: `radial-gradient(${hue.dot} 1.3px, transparent 1.3px)`, backgroundSize: "18px 18px" }} />
            <div className="absolute w-[140px] h-[140px] bg-white/85" aria-hidden="true"
              style={{ borderRadius: "44% 56% 50% 50% / 55% 45% 55% 45%" }} />
            <Art art={skillArt(exam, skill)} sizes="132px" className="relative h-[132px] w-auto" />
          </div>
          <div className="px-[22px] pt-5 pb-[22px] flex flex-col gap-3">
            <span className="t-label text-n-500 text-[12px] tracking-[.14em]">Learning materials</span>
            {prompt && <p className="text-[14px] leading-[1.7] text-n-700"><strong className="text-ink">Task:</strong> {prompt}</p>}
            {response ? (
              <>
                {open && (
                  <div className="max-h-[420px] overflow-y-auto rounded-xl bg-n-50 border border-n-200 p-4 text-[14px] leading-[1.75] text-n-700 whitespace-pre-line">
                    {response}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  aria-expanded={open}
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent-tint px-4 py-[11px] text-[14px] font-bold text-accent cursor-pointer transition-colors duration-200 hover:text-accent-strong"
                >
                  <Icon name="report" size={16} />
                  {open ? `Hide ${responseLabel}` : `Show ${responseLabel}`}
                </button>
              </>
            ) : null}
          </div>
        </aside>

        <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            {criteria.map((c) => {
              const focus = !allEqual && lowest?.label === c.label;
              return (
                <div key={c.label} className="rounded-[20px] bg-n-0 border border-[#E9ECF2] px-5 py-[18px] flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[15px] font-bold text-ink leading-[1.35]">{c.label}</span>
                    <span className="t-numeric text-[20px] text-ink leading-none">{fmt(c.value, c.max)}</span>
                  </div>
                  <div className="h-[7px] rounded-full bg-[#F1F3F7] overflow-hidden" role="meter"
                    aria-valuemin={0} aria-valuemax={c.max} aria-valuenow={c.value} aria-label={c.label}>
                    <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (c.value / c.max) * 100)}%` }} />
                  </div>
                  {focus && (
                    <span className="self-start inline-flex items-center gap-1.5 rounded-full bg-ai-tint text-ai px-2.5 py-1 text-[11.5px] font-bold tracking-[.06em]">
                      <Icon name="target" size={16} />
                      Focus here next
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {feedback && (
            <div className="rounded-[20px] bg-n-0 border border-[#E9ECF2] px-5 py-5 sm:px-[22px]">
              <div className="flex items-center gap-2.5 mb-2.5">
                <Icon name="ai" size={20} className="text-ai" />
                <h3 className="text-[16px]">Examiner-style feedback</h3>
              </div>
              <p className="text-[14.5px] leading-[1.75] text-n-700 whitespace-pre-line">{plain(feedback)}</p>
            </div>
          )}

          {suggestions && suggestions.length > 0 && (
            <div className="rounded-[20px] bg-n-0 border border-[#E9ECF2] px-5 py-5 sm:px-[22px]">
              <div className="flex items-center gap-2.5 mb-3">
                <Icon name="lightbulb" size={20} className="text-amber-500" />
                <h3 className="text-[16px]">How to improve</h3>
              </div>
              <ul className="flex flex-col gap-2.5">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14.5px] leading-[1.65] text-n-700">
                    <Icon name="check" size={16} className="text-success shrink-0 mt-[3px]" />
                    <span>{plain(s)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="flex items-center gap-2 text-[12.5px] font-bold text-ai px-1">
            <Icon name="sparkle" size={16} className="shrink-0" />
            AI-generated practice estimate, not an official result.
          </p>
        </div>
      </div>
    </>
  );
}
