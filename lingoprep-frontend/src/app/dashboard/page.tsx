"use client";

/**
 * Results — "frontend pages svg illustrations/IELTS Results.dc.html".
 *
 * Everything shown is derived from the candidate's own practice data by
 * src/lib/results.ts; the design's sample numbers are not used anywhere.
 *
 * ── How the page adapts ─────────────────────────────────────────────────────
 * - Exam: the page shows the exam you are viewing (crimson IELTS bands or blue
 *   TOEFL scores). The backend returns both exams' stats, so switching exam
 *   shows that exam's record instead of forcing the theme to the profile.
 * - Empty: no tests yet → "Ready when you are", how-it-works steps, and an
 *   empty history with a route into practice.
 * - Mood: the hero character follows the overall estimate (jumping at the top,
 *   thumbs-up, reviewing, or a gentle "don't give up").
 * - Focus next: the weakest practised skill, naming its weakest criterion when
 *   the latest attempt recorded one; with only one skill tried, it suggests a
 *   new skill instead.
 * - "Since first test" appears only when a skill has been attempted at least
 *   twice; otherwise the hero shows how many skills have been practised.
 *
 * ── Deviations from the design ─────────────────────────────────────────────
 * - Writing's blue is the TOEFL accent, so skills use src/lib/skillHues (§07).
 * - "View report" had nothing to open — no stored per-test report view exists
 *   — so each history row offers "Practise again" for that skill instead.
 * - The design's account pill lives in the navbar, which renders it on every
 *   page for a signed-in candidate.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { useExam } from "@/components/theme/ExamThemeProvider";
import type { ExamType } from "@/lib/exam";
import Icon from "@/components/brand/Icon";
import Art from "@/components/brand/Art";
import Reveal from "@/components/brand/Reveal";
import { Button, Spinner } from "@/components/brand/ui";
import { MOOD_ART, lostArt, skillArt } from "@/lib/illustrations";
import { HUES } from "@/lib/skillHues";
import {
  SKILLS, SKILL_TITLE, fmt, focusFor, levelFor, moodFor, overallFor, progressFor,
  shortDate, signed, skillScore, spreadFor, testLabel,
  type ModuleSummary, type MoodKey, type SessionRow, type Skill,
} from "@/lib/results";

/* ── API shape ──────────────────────────────────────────────────────────── */

interface ExamStats {
  total_sessions: number;
  reading_avg: number;
  listening_avg: number;
  writing_avg: number;
  speaking_avg: number;
  modules?: Record<Skill, ModuleSummary>;
  recent_sessions?: SessionRow[];
}

interface UserStats {
  active_track: string;
  ielts?: ExamStats;
  toefl?: ExamStats;
  recent_sessions: (SessionRow & { details?: { exam_type?: string } })[];
}

/** Older backends return only averages; rebuild a minimal summary from them. */
function modulesOf(s: ExamStats | undefined): Record<Skill, ModuleSummary> {
  const empty = (avg = 0): ModuleSummary => ({
    count: avg > 0 ? 1 : 0, avg, first: avg || null, latest: avg || null,
    latest_at: null, latest_sub_scores: null,
  });
  if (s?.modules) return s.modules;
  return {
    listening: empty(s?.listening_avg), reading: empty(s?.reading_avg),
    writing: empty(s?.writing_avg), speaking: empty(s?.speaking_avg),
  };
}

/* ── Mood presentation ──────────────────────────────────────────────────── */

const MOOD: Record<MoodKey, {
  label: string; sub: string; bg: string; fg: string;
  anim: string; spark?: string; rain?: boolean;
}> = {
  best: { label: "Outstanding!", sub: "TOP BAND", bg: "#FFF4DE", fg: "#8A4B06", spark: "#F59E0B",
    anim: "lp-jump 1.6s cubic-bezier(.45,0,.3,1) infinite" },
  good: { label: "Great work", sub: "ON TRACK", bg: "var(--success-tint)", fg: "#15803D", spark: "#22C55E",
    anim: "lp-sway 3.2s ease-in-out infinite" },
  mid: { label: "Getting there", sub: "KEEP PRACTISING", bg: "var(--accent-tint)", fg: "var(--accent-on-tint)",
    anim: "lp-breathe 4s ease-in-out infinite" },
  low: { label: "Don't give up", sub: "ROOM TO GROW", bg: "#EEF0F6", fg: "var(--n-700)", rain: true,
    anim: "lp-droop 5s ease-in-out infinite" },
  none: { label: "Ready when you are", sub: "NO TESTS YET", bg: "var(--accent-tint)", fg: "var(--accent-on-tint)",
    anim: "lp-breathe 4s ease-in-out infinite" },
};

const SPARKS: Array<[number, number, number, number]> = [
  [8, 22, 0, 22], [86, 30, 0.5, 18], [14, 66, 1.1, 14], [80, 70, 0.8, 20], [50, 6, 1.4, 16],
];

const ACCENT_GRADIENT =
  "linear-gradient(180deg, color-mix(in srgb, var(--accent) 88%, white), color-mix(in srgb, var(--accent) 88%, black))";

/* ═══════════════════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const { exam, theme, withExam } = useExam();
  const { user } = useAuth();

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/users/stats");
        if (live) setStats(res.data?.data || null);
      } catch (err) {
        console.error("Error fetching stats:", err);
        if (live) setError("We couldn't load your practice results. Check your connection and try again.");
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [attempt]);

  return (
    <ProtectedRoute>
      {loading ? (
        <Spinner label="Loading your practice results…" />
      ) : error || !stats ? (
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <Icon name="warning" size={32} className="mx-auto mb-4 text-warning" />
          <h2 className="text-[20px] mb-2">Unable to load results</h2>
          <p className="text-[14px] text-n-600 mb-6">{error ?? "Please try again."}</p>
          <Button icon="retry" onClick={() => setAttempt((a) => a + 1)}>Try again</Button>
        </div>
      ) : (
        <Results
          stats={stats}
          exam={exam}
          firstName={firstNameOf(user?.user_metadata?.full_name, user?.email)}
          scoreRange={theme.scoreRange}
          legalName={theme.legalName}
          examName={theme.name}
          withExam={withExam}
        />
      )}
    </ProtectedRoute>
  );
}

function firstNameOf(full?: string, email?: string | null): string | null {
  const n = (full ?? "").trim().split(/\s+/)[0];
  if (n) return n;
  const local = (email ?? "").split("@")[0];
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : null;
}

/* ═══ The page ═════════════════════════════════════════════════════════════ */

function Results({
  stats, exam, firstName, scoreRange, legalName, examName, withExam,
}: {
  stats: UserStats;
  exam: ExamType;
  firstName: string | null;
  scoreRange: string;
  legalName: string;
  examName: string;
  withExam: (p: string) => string;
}) {
  const own = stats[exam];
  const modules = useMemo(() => modulesOf(own), [own]);
  const overall = overallFor(modules, exam);
  const has = overall.value !== null;
  const total = own?.total_sessions ?? 0;
  const moodKey = moodFor(overall);
  const mood = MOOD[moodKey];
  const focus = focusFor(modules, exam);
  const spread = spreadFor(modules, exam);
  const progress = progressFor(modules, exam);
  const unit = exam === "ielts" ? "Band" : "Score";

  // History: this exam's own list when the backend sends it, otherwise the
  // shared list filtered to this exam.
  const history: SessionRow[] = (own?.recent_sessions ??
    stats.recent_sessions.filter((s) => (s.exam_type ?? s.details?.exam_type ?? "ielts") === exam)
  ).slice(0, 5);

  const greet = firstName ? `, ${firstName}` : "";
  const heroLine = has
    ? `Welcome back${greet}. Here are your ${examName} practice estimates across all four skills, and what to work on next.`
    : `Welcome${greet}. Your ${examName} practice estimates across all four skills, and what to work on next, will appear here.`;

  const heroStats = has
    ? [
        { v: String(total), k: total === 1 ? "Test taken" : "Tests taken" },
        { v: fmt(overall.value as number, exam), k: exam === "ielts" ? "Overall band" : "Total score" },
        progress !== null
          ? { v: signed(progress, exam), k: "Since first test" }
          : { v: `${overall.practised.length} of 4`, k: "Skills practised" },
      ]
    : [
        { v: "0", k: "Tests taken" },
        { v: "4", k: "Skills unlocked" },
        { v: exam === "ielts" ? "1–9" : "0–120", k: exam === "ielts" ? "Band scale" : "Score scale" },
      ];

  // Overall card copy
  const overallDesc = !has
    ? `Take your first ${examName} practice test and your estimate will appear here.`
    : exam === "ielts"
      ? overall.practised.length === 1
        ? `Based on the one skill you have practised so far. Try the others for a fuller picture.`
        : `Averaged from your estimate in each of the ${overall.practised.length} skills you have practised.`
      : overall.practised.length === 4
        ? "The sum of your four section scores, each averaged across your attempts."
        : `The sum of the ${overall.practised.length} ${overall.practised.length === 1 ? "section" : "sections"} you have practised. Practise all four for a total comparable to the 0–120 scale.`;
  const spreadLine = spread
    ? ` ${SKILL_TITLE[spread.strong]} is your strongest; ${SKILL_TITLE[spread.weak]} has the most room to grow.`
    : "";

  const ctaSkill: Skill | null = focus.skill;
  const cta = !has
    ? { label: "Take your first test", href: withExam("/#skills") }
    : ctaSkill
      ? { label: `Practise ${SKILL_TITLE[ctaSkill]}`, href: withExam(`/${ctaSkill}`) }
      : { label: "Browse practice tests", href: withExam("/#skills") };

  const ringPct = `${(Math.min(1, overall.fraction) * 100).toFixed(1)}%`;

  return (
    <>
      {/* ═══ Hero ═══════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden border-b"
        style={{
          background: "color-mix(in srgb, var(--accent-tint) 45%, white)",
          borderColor: "color-mix(in srgb, var(--accent) 10%, var(--n-200))",
        }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute rounded-full w-[460px] h-[460px] -top-40 -right-20 opacity-35 blur-[70px]"
            style={{ background: "color-mix(in srgb, var(--accent) 50%, white)", animation: "lp-orb-a 18s ease-in-out infinite" }}
          />
          <div
            className="absolute rounded-full w-[380px] h-[380px] -bottom-44 left-[30%] opacity-35 blur-[70px]"
            style={{ background: "var(--amber-400)", animation: "lp-orb-b 22s ease-in-out infinite" }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(color-mix(in srgb, var(--accent) 13%, transparent) 1.2px, transparent 1.2px)",
              backgroundSize: "22px 22px",
              maskImage: "radial-gradient(ellipse 70% 80% at 75% 40%, #000 20%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 75% 40%, #000 20%, transparent 75%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-5 sm:px-7 pt-10 sm:pt-[52px] pb-28 sm:pb-[120px] grid lg:grid-cols-2 gap-8 lg:gap-9 items-center">
          <Reveal className="flex flex-col items-start gap-4">
            <span className="t-label text-accent text-[12.5px] tracking-[.16em]">Practice record</span>
            <h1 className="text-[40px] sm:text-[50px] lg:text-[58px] leading-[1.04] tracking-[-0.045em]">
              Your{" "}
              <span style={{ background: "linear-gradient(transparent 62%, #FFD98A 62%, #FFD98A 90%, transparent 90%)" }}>
                results
              </span>
            </h1>
            <p className="text-[16px] sm:text-[17px] leading-[1.75] text-n-600 max-w-[32rem] [text-wrap:pretty]">
              {heroLine}
            </p>
            <div className="grid grid-cols-3 gap-2.5 mt-1.5 w-full max-w-[26rem]">
              {heroStats.map((h) => (
                <div
                  key={h.k}
                  className="flex flex-col gap-0.5 rounded-2xl bg-white/85 backdrop-blur-[6px] border px-3.5 sm:px-[18px] py-3"
                  style={{ borderColor: "color-mix(in srgb, var(--accent) 12%, white)" }}
                >
                  <span className="t-numeric text-[19px] sm:text-[20px] text-ink leading-tight">{h.v}</span>
                  <span className="text-[11.5px] sm:text-[12px] font-bold text-n-500 leading-snug">{h.k}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* ── Mood character ────────────────────────────────────────── */}
          <Reveal delay={110} className="relative flex items-center justify-center min-h-[280px] sm:min-h-[320px]">
            <div
              className="absolute w-[min(86%,380px)] aspect-square border"
              aria-hidden="true"
              style={{
                borderRadius: "46% 54% 52% 48% / 52% 44% 56% 48%",
                background: "linear-gradient(150deg, #fff 0%, var(--accent-tint) 100%)",
                borderColor: "color-mix(in srgb, var(--accent) 12%, white)",
                boxShadow: "0 30px 60px color-mix(in srgb, var(--accent) 10%, transparent)",
              }}
            />
            <div
              className="absolute w-[min(98%,440px)] aspect-square rounded-full border-[1.5px] border-dashed"
              aria-hidden="true"
              style={{ borderColor: "color-mix(in srgb, var(--accent) 22%, transparent)", animation: "lp-spin 60s linear infinite" }}
            />

            <div
              key={moodKey}
              className="relative w-[min(78%,340px)] aspect-square"
              style={{ animation: "lp-pop .5s cubic-bezier(.2,.8,.2,1.2)" }}
            >
              <div
                className="absolute left-[28%] right-[28%] bottom-[3%] h-[5%] rounded-[50%] bg-ink opacity-20 blur-[4px]"
                aria-hidden="true"
                style={{ animation: moodKey === "best" ? "lp-jump-shadow 1.6s cubic-bezier(.45,0,.3,1) infinite" : undefined }}
              />
              <div className="relative w-full h-full origin-bottom" style={{ animation: mood.anim }}>
                <Art art={MOOD_ART[moodKey]} priority sizes="340px" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              {mood.spark && SPARKS.map(([x, y, d, s], i) => (
                <svg
                  key={i} width={s} height={s} viewBox="0 0 24 24" aria-hidden="true"
                  className="absolute"
                  style={{
                    left: `${x}%`, top: `${y}%`,
                    animation: `lp-twinkle ${moodKey === "best" ? 1.4 : 2.4}s ease-in-out ${d}s infinite`,
                  }}
                >
                  <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill={i % 2 ? "var(--accent)" : mood.spark} />
                </svg>
              ))}
              {mood.rain && [38, 46, 54, 62].map((x, i) => (
                <span
                  key={i} aria-hidden="true"
                  className="absolute top-[14%] w-0.5 h-3 rounded-sm bg-[#9AA3B8]"
                  style={{ left: `${x}%`, animation: `lp-rain 1.8s linear ${i * 0.45}s infinite` }}
                />
              ))}
            </div>

            {/* Mood chip — top-right as designed; bottom-left on phones so it
                never covers the character's face */}
            <div
              className="absolute bottom-1 left-0 sm:bottom-auto sm:left-auto sm:top-[18px] sm:right-[6%] flex items-center gap-2.5 py-2.5 pl-2.5 pr-4 border border-n-200 bg-white/95 backdrop-blur-[8px] shadow-[0_18px_40px_rgb(18_23_43/0.12)]"
              style={{ borderRadius: "18px 18px 18px 4px", animation: "lp-float 6s ease-in-out infinite" }}
            >
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center t-numeric text-[15px]"
                style={{ background: mood.bg, color: mood.fg }}
              >
                {has ? fmt(overall.value as number, exam) : "—"}
              </span>
              <span className="flex flex-col leading-[1.25]">
                <span className="text-[14px] font-bold text-ink">{mood.label}</span>
                <span className="text-[11px] font-bold tracking-[.1em]" style={{ color: mood.fg }}>{mood.sub}</span>
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ Body ═══════════════════════════════════════════════════════ */}
      <div className="relative bg-n-50">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgb(18 23 43 / .04) 1px, transparent 1px), linear-gradient(90deg, rgb(18 23 43 / .04) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "linear-gradient(180deg, #000, transparent 60%)",
            WebkitMaskImage: "linear-gradient(180deg, #000, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-[1200px] px-5 sm:px-7 pb-20 sm:pb-[100px]">

          {/* ── Overall + focus card ─────────────────────────────────────── */}
          <Reveal className="-mt-20 rounded-[28px] bg-n-0 border border-n-200 overflow-hidden grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]
                             shadow-[0_30px_70px_-20px_rgb(18_23_43/0.18),0_4px_14px_rgb(18_23_43/0.04)]">
            <div className="p-6 sm:px-10 sm:py-9 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-[30px]">
              <div
                className="relative w-[148px] h-[148px] sm:w-[168px] sm:h-[168px] shrink-0 rounded-full flex items-center justify-center self-center"
                style={{
                  background: `conic-gradient(var(--accent) 0 ${ringPct}, var(--accent-tint) ${ringPct} 100%)`,
                  boxShadow: "0 18px 40px color-mix(in srgb, var(--accent) 18%, transparent)",
                }}
                role="img"
                aria-label={has ? `Overall ${fmt(overall.value as number, exam)} out of ${overall.max}` : "No overall estimate yet"}
              >
                <div className="w-[118px] h-[118px] sm:w-[134px] sm:h-[134px] rounded-full bg-n-0 flex flex-col items-center justify-center gap-0.5">
                  <span className="t-numeric text-[38px] sm:text-[44px] tracking-[-0.04em] text-ink leading-none">
                    {has ? fmt(overall.value as number, exam) : "—"}
                  </span>
                  <span className="text-[12px] font-bold text-n-500">out of {overall.max}</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-2.5 items-start min-w-0">
                <span className="t-label text-n-500 text-[12px] tracking-[.14em]">
                  {exam === "ielts" ? "Overall band" : "Total score"} · practice estimate
                </span>
                <h2 className="text-[26px] sm:text-[28px] leading-[1.18]">{levelFor(overall, exam)}</h2>
                <p className="text-[15px] leading-[1.7] text-n-600 [text-wrap:pretty]">
                  {overallDesc}{spreadLine}
                </p>
                <Link
                  href={cta.href}
                  className="group mt-1.5 inline-flex items-center gap-3 rounded-full py-1.5 pr-1.5 pl-5 text-[14.5px] font-bold text-accent-on hover:text-accent-on whitespace-nowrap
                             transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5"
                  style={{
                    background: ACCENT_GRADIENT,
                    boxShadow: "inset 0 1px 0 rgb(255 255 255 / .25), 0 10px 24px color-mix(in srgb, var(--accent) 30%, transparent)",
                  }}
                >
                  {cta.label}
                  <span className="w-8 h-8 rounded-full bg-n-0 text-accent flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5">
                    <Icon name="next" size={16} />
                  </span>
                </Link>
              </div>
            </div>

            {/* Focus / how it works — the AI violet marks AI-derived guidance */}
            <div className="relative bg-ai-tint/60 border-t lg:border-t-0 lg:border-l border-[#EDE7FB] px-6 py-7 sm:px-9 sm:py-[34px] flex flex-col justify-center gap-4">
              {has && focus.skill ? (
                <>
                  <span className="t-label text-ai text-[12px] tracking-[.14em]">
                    {focus.kind === "untried" ? "Try next" : "Focus next"}
                  </span>
                  <div className="flex items-center gap-3.5">
                    <span
                      className="w-12 h-12 rounded-[15px] flex items-center justify-center text-white shrink-0"
                      style={{
                        background: `linear-gradient(145deg, ${HUES[focus.skill].accent}, ${HUES[focus.skill].deep})`,
                        boxShadow: `0 10px 22px ${HUES[focus.skill].glow}`,
                      }}
                    >
                      <Icon name={focus.skill} size={24} />
                    </span>
                    <div>
                      <div className="text-[18px] font-bold text-ink">
                        {SKILL_TITLE[focus.skill]}
                        {focus.score !== null && ` · ${unit} ${fmt(focus.score, exam)}`}
                      </div>
                      <div className="text-[13.5px] text-n-600 mt-0.5">
                        {focus.kind === "untried" ? "Not practised yet" : "Your lowest skill right now"}
                      </div>
                    </div>
                  </div>
                  <p className="text-[14px] leading-[1.7] text-n-600">{focus.reason}</p>
                </>
              ) : (
                <>
                  <span className="t-label text-ai text-[12px] tracking-[.14em]">How it works</span>
                  {[
                    "Pick a skill and take a practice test",
                    `Get an instant ${exam === "ielts" ? "band" : "score"} estimate`,
                    "Track your progress here",
                  ].map((t, i) => (
                    <div key={t} className="flex items-center gap-3">
                      <span className="w-[30px] h-[30px] rounded-full bg-n-0 border border-[#E4DCF6] text-ai t-numeric text-[13px] flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-[14.5px] font-bold text-n-700">{t}</span>
                    </div>
                  ))}
                </>
              )}
              <div className="flex items-center gap-2.5 rounded-xl bg-ai-tint px-3.5 py-2.5 text-ai text-[12.5px] font-bold leading-[1.5]">
                <Icon name="sparkle" size={16} className="shrink-0" />
                This is an AI-generated practice estimate, not an official result.
              </div>
            </div>
          </Reveal>

          {/* ── By skill ────────────────────────────────────────────────── */}
          <Reveal className="flex flex-wrap items-end justify-between gap-x-5 gap-y-3 mt-16 sm:mt-[72px] mb-7">
            <div>
              <span className="t-label text-accent text-[12.5px] tracking-[.16em]">By skill</span>
              <h2 className="text-[28px] sm:text-[32px] mt-2.5">Practise a skill</h2>
            </div>
            <p className="text-[15px] leading-[1.7] text-n-600 max-w-[24rem]">
              {has
                ? `Your average ${exam === "ielts" ? "band" : "section score"} for each skill, across every attempt.`
                : "Pick any skill to start. Every module is unlocked."}
            </p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SKILLS.map((k, i) => {
              const m = modules[k];
              const tried = m.count > 0;
              const score = tried ? skillScore(m.avg, exam) : null;
              const max = exam === "ielts" ? 9 : 30;
              const hue = HUES[k];
              return (
                <Reveal key={k} delay={(i % 4) * 90} className="flex">
                  <Link
                    href={withExam(`/${k}`)}
                    className="group flex-1 flex flex-col rounded-3xl bg-n-0 border border-[#E9ECF2] overflow-hidden text-ink hover:text-ink
                               shadow-[0_1px_2px_rgb(18_23_43/0.04),0_8px_24px_rgb(18_23_43/0.04)]
                               transition-[transform,box-shadow] duration-[450ms] ease-[cubic-bezier(.2,.7,.2,1)]
                               hover:-translate-y-1.5 hover:shadow-[0_30px_50px_-16px_rgb(18_23_43/0.22)]"
                  >
                    <div className="relative h-[150px] flex items-center justify-center overflow-hidden" style={{ background: hue.tint }}>
                      <div
                        className="absolute inset-0"
                        aria-hidden="true"
                        style={{ backgroundImage: `radial-gradient(${hue.dot} 1.3px, transparent 1.3px)`, backgroundSize: "18px 18px" }}
                      />
                      <div
                        className="absolute w-[150px] h-[150px] bg-white/85 transition-transform duration-700 group-hover:rotate-[18deg] group-hover:scale-110"
                        aria-hidden="true"
                        style={{ borderRadius: "44% 56% 50% 50% / 55% 45% 55% 45%" }}
                      />
                      <Art
                        art={skillArt(exam, k)}
                        sizes="140px"
                        className="relative h-[136px] w-auto transition-transform duration-500 group-hover:scale-[1.06]"
                      />
                      <span
                        className="absolute top-3.5 left-3.5 w-10 h-10 rounded-[13px] flex items-center justify-center text-white"
                        style={{
                          background: `linear-gradient(145deg, ${hue.accent}, ${hue.deep})`,
                          boxShadow: `inset 0 1px 0 rgb(255 255 255 / .3), 0 8px 18px ${hue.glow}`,
                        }}
                      >
                        <Icon name={k} size={20} />
                      </span>
                    </div>

                    <div className="px-[22px] pt-5 pb-[22px] flex flex-col gap-3 flex-1">
                      <div className="flex items-baseline justify-between gap-2.5">
                        <h3 className="text-[20px]">{SKILL_TITLE[k]}</h3>
                        <span className="t-numeric text-[24px]" style={{ color: tried ? hue.deep : "var(--n-400)" }}>
                          {score !== null ? fmt(score, exam) : "—"}
                        </span>
                      </div>
                      <div
                        className="h-[7px] rounded-full bg-[#F1F3F7] overflow-hidden"
                        role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={score ?? 0}
                        aria-label={`${SKILL_TITLE[k]} average`}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${score !== null ? Math.min(100, (score / max) * 100) : 0}%`,
                            background: `linear-gradient(90deg, ${hue.accent}, ${hue.deep})`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2.5 mt-0.5">
                        <span className="text-[12.5px] font-bold text-n-500">
                          {tried
                            ? `${m.count} ${m.count === 1 ? "test" : "tests"} taken`
                            : "Not started"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[14px] font-bold text-accent whitespace-nowrap">
                          {tried ? "Retake" : "Start"}
                          <Icon name="next" size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          {/* ── History ─────────────────────────────────────────────────── */}
          <Reveal className="mt-14 rounded-3xl bg-n-0 border border-[#E9ECF2] overflow-hidden shadow-[0_1px_2px_rgb(18_23_43/0.04),0_8px_24px_rgb(18_23_43/0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 sm:px-7 py-[22px] border-b border-n-200">
              <div className="flex items-center gap-3">
                <span className="w-[38px] h-[38px] rounded-xl bg-accent-tint text-accent flex items-center justify-center">
                  <Icon name="schedule" size={20} />
                </span>
                <h3 className="text-[19px]">Recent test history</h3>
              </div>
              {history.length > 0 && (
                <span className="text-[13px] font-bold text-n-500">
                  {total > history.length ? `Last ${history.length} of ${total} tests` : `${total} ${total === 1 ? "test" : "tests"}`}
                </span>
              )}
            </div>

            {history.length > 0 ? (
              <>
                {/* Phones: stacked rows */}
                <ul className="sm:hidden divide-y divide-[#F1F3F7]">
                  {history.map((r) => <HistoryItem key={r.id} r={r} exam={exam} href={withExam(`/${r.module}`)} />)}
                </ul>
                {/* Wider: table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left min-w-[640px]">
                    <thead>
                      <tr className="bg-n-50">
                        {["Date", "Test", "Estimate", "Action"].map((h, i) => (
                          <th key={h} className={`px-7 py-3.5 t-label text-n-500 text-[11.5px] tracking-[.14em] ${i === 3 ? "text-right" : ""}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((r) => {
                        const hue = HUES[r.module] ?? HUES.reading;
                        return (
                          <tr key={r.id} className="border-t border-[#F1F3F7] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--accent-tint)_40%,white)]">
                            <td className="px-7 py-4 text-[14px] font-bold text-n-600 whitespace-nowrap">{shortDate(r.created_at)}</td>
                            <td className="px-7 py-4">
                              <span className="flex items-center gap-3">
                                <span className="w-[34px] h-[34px] rounded-[11px] flex items-center justify-center shrink-0" style={{ background: hue.tint, color: hue.accent }}>
                                  <Icon name={r.module} size={16} />
                                </span>
                                <span className="flex flex-col min-w-0">
                                  <span className="text-[14.5px] font-bold text-ink">{SKILL_TITLE[r.module]}</span>
                                  <span className="text-[12.5px] text-n-500 truncate max-w-[22rem]">{testLabel(r, exam)}</span>
                                </span>
                              </span>
                            </td>
                            <td className="px-7 py-4"><Estimate r={r} exam={exam} /></td>
                            <td className="px-7 py-4 text-right">
                              <Link href={withExam(`/${r.module}`)} className="text-[14px] font-bold text-accent hover:text-accent-strong whitespace-nowrap">
                                Practise again
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="grid sm:grid-cols-2 items-center gap-6 px-6 py-8 sm:px-10 sm:py-9">
                <div className="relative flex items-center justify-center min-h-[200px]">
                  <div
                    className="absolute w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] bg-accent-tint"
                    aria-hidden="true"
                    style={{ borderRadius: "46% 54% 52% 48% / 52% 44% 56% 48%" }}
                  />
                  <Art art={lostArt(exam)} sizes="280px" className="relative w-[min(100%,280px)]" />
                </div>
                <div className="flex flex-col gap-3 items-start">
                  <h3 className="text-[22px]">No tests taken yet</h3>
                  <p className="text-[15px] leading-[1.7] text-n-600 max-w-[26rem]">
                    Start a practice test to see your results here.
                  </p>
                  <Link
                    href={withExam("/#skills")}
                    className="mt-1 inline-flex items-center gap-2 rounded-full bg-accent-tint px-5 py-[11px] text-[14px] font-bold text-accent hover:text-accent-strong transition-colors duration-200"
                  >
                    Browse practice tests
                    <Icon name="next" size={16} />
                  </Link>
                </div>
              </div>
            )}
          </Reveal>

          {/* ── §14 scoring notice ──────────────────────────────────────── */}
          <Reveal className="relative mt-14 rounded-3xl bg-ink overflow-hidden px-6 py-7 sm:px-9 sm:py-[30px] flex flex-wrap items-center gap-5 sm:gap-6">
            <div className="absolute inset-0" aria-hidden="true"
              style={{ backgroundImage: "radial-gradient(rgb(255 255 255 / .07) 1.2px, transparent 1.2px)", backgroundSize: "20px 20px" }} />
            <div className="absolute -right-[60px] -top-20 w-[260px] h-[260px] rounded-full" aria-hidden="true"
              style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 45%, transparent), transparent 70%)" }} />
            <div className="relative w-[46px] h-[46px] rounded-[14px] flex items-center justify-center shrink-0 text-ink"
              style={{ background: "linear-gradient(145deg, #FFC35A, var(--amber-500))" }}>
              <Icon name="info" size={24} />
            </div>
            <p className="relative flex-[1_1_420px] text-[14.5px] leading-[1.75] text-n-400">
              Every score on LingoPrep is an AI-generated practice estimate on
              the <strong className="text-white">{scoreRange}</strong> scale. It
              is not an official {legalName} result and cannot be used for
              admissions or visa applications.
            </p>
          </Reveal>
        </div>
      </div>
    </>
  );
}

/* ── History pieces ─────────────────────────────────────────────────────── */

function Estimate({ r, exam }: { r: SessionRow; exam: ExamType }) {
  const hue = HUES[r.module] ?? HUES.reading;
  const banded = Number(r.band_score) > 0;
  return (
    <span
      className="inline-block rounded-full px-3 py-[5px] t-numeric text-[14px] whitespace-nowrap"
      style={{ background: hue.tint, color: hue.deep }}
    >
      {banded
        ? fmt(Number(r.band_score), exam)
        : `${Number(r.score)} / ${Number(r.max_score)}`}
    </span>
  );
}

function HistoryItem({ r, exam, href }: { r: SessionRow; exam: ExamType; href: string }) {
  const hue = HUES[r.module] ?? HUES.reading;
  return (
    <li className="flex items-center gap-3 px-5 py-4">
      <span className="w-[38px] h-[38px] rounded-xl flex items-center justify-center shrink-0" style={{ background: hue.tint, color: hue.accent }}>
        <Icon name={r.module} size={20} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[14.5px] font-bold text-ink">{SKILL_TITLE[r.module]}</span>
        <span className="block text-[12.5px] text-n-500 truncate">{testLabel(r, exam)}</span>
        <span className="block text-[12.5px] font-bold text-n-600">{shortDate(r.created_at)}</span>
        <Link href={href} className="inline-block mt-1 text-[13px] font-bold text-accent hover:text-accent-strong">Practise again</Link>
      </span>
      <Estimate r={r} exam={exam} />
    </li>
  );
}
