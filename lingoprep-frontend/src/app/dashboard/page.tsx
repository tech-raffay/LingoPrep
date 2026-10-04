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

      {/* ═══ Body ("IELTS Results.dc.html", revised) ══════════════════════ */}
      <div className="relative bg-n-0">
        <div className="relative mx-auto max-w-[1200px] px-5 sm:px-7 pb-20 sm:pb-[110px]">

          {/* ── Overall + focus: one inset card, two panels ───────────────── */}
          <Reveal
            className="relative -mt-20 rounded-[28px] bg-n-0 border border-[#F0EEF0] p-2.5 sm:p-3.5 grid lg:grid-cols-2 gap-3.5
                       shadow-[0_24px_60px_-24px_rgb(18_23_43/0.16)]"
          >
            <div className="px-4 py-5 sm:px-7 sm:py-[26px] flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-7">
              <div
                className="relative w-[150px] h-[150px] shrink-0 rounded-full flex items-center justify-center self-center"
                style={{ background: `conic-gradient(var(--accent) 0 ${ringPct}, #F6EEF0 ${ringPct} 100%)` }}
                role="img"
                aria-label={has ? `Overall ${fmt(overall.value as number, exam)} out of ${overall.max}` : "No overall estimate yet"}
              >
                <div className="w-[124px] h-[124px] rounded-full bg-n-0 flex flex-col items-center justify-center gap-1">
                  <span className="t-numeric text-[42px] font-extrabold tracking-[-0.035em] text-ink leading-none">
                    {has ? fmt(overall.value as number, exam) : "—"}
                  </span>
                  <span className="text-[12.5px] font-bold text-n-500">out of {overall.max}</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-2.5 items-start min-w-0">
                <span className="text-[13px] font-bold text-n-500">
                  {exam === "ielts" ? "Overall band" : "Total score"} · practice estimate
                </span>
                <h2 className="text-[26px] sm:text-[28px] leading-[1.18]">{levelFor(overall, exam)}</h2>
                <p className="text-[15px] leading-[1.7] text-n-600 [text-wrap:pretty]">
                  {overallDesc}{spreadLine}
                </p>
                <Link
                  href={cta.href}
                  className="mt-1.5 inline-flex items-center gap-2 rounded-full bg-accent px-[22px] py-3 text-[14.5px] font-bold text-accent-on hover:text-accent-on whitespace-nowrap
                             transition-[background-color,transform] duration-200 hover:bg-accent-strong hover:-translate-y-0.5"
                >
                  {cta.label}
                  <Icon name="next" size={16} />
                </Link>
              </div>
            </div>

            {/* Focus next / how it works, on a warm panel */}
            <div className="relative overflow-hidden rounded-[20px] bg-[#FFF7EA] px-5 py-6 sm:px-[30px] sm:py-7 flex flex-col justify-center gap-3.5">
              <svg
                viewBox="0 0 220 90" fill="none" aria-hidden="true"
                className="absolute top-7 left-8 w-[90px] h-[49px] opacity-55"
              >
                <path d="M4 70C40 20 120 4 214 30" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M30 86C70 44 140 30 216 52" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
              </svg>

              {has && focus.skill ? (
                <>
                  <span className="relative self-start rounded-full bg-amber-500 px-3 py-[5px] text-[11.5px] font-extrabold tracking-[.1em] text-white">
                    {focus.kind === "untried" ? "TRY NEXT" : "FOCUS NEXT"}
                  </span>
                  <div className="relative flex items-center gap-3.5">
                    <span
                      className="w-[50px] h-[50px] rounded-2xl bg-n-0 flex items-center justify-center shrink-0"
                      style={{ color: HUES[focus.skill].accent }}
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
                  <p className="relative text-[14px] leading-[1.7] text-n-600">{focus.reason}</p>
                </>
              ) : (
                <>
                  <span className="relative self-start rounded-full bg-amber-500 px-3 py-[5px] text-[11.5px] font-extrabold tracking-[.1em] text-white">
                    HOW IT WORKS
                  </span>
                  {[
                    "Pick a skill and take a practice test",
                    `Get an instant ${exam === "ielts" ? "band" : "score"} estimate`,
                    "Track your progress here",
                  ].map((t, i) => (
                    <div key={t} className="relative flex items-center gap-3">
                      <span className="w-[30px] h-[30px] rounded-full bg-n-0 text-[#B4690D] t-numeric text-[13.5px] font-extrabold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-[14.5px] font-bold text-n-700">{t}</span>
                    </div>
                  ))}
                </>
              )}

              <p className="relative flex items-center gap-2 text-[12.5px] font-bold text-[#8A6A2F] leading-[1.5]">
                <Icon name="info" size={16} className="shrink-0" />
                AI-generated practice estimate, not an official result.
              </p>
            </div>
          </Reveal>

          {/* ── By skill ────────────────────────────────────────────────── */}
          <Reveal className="flex flex-col items-center text-center gap-2 mt-20 sm:mt-24 mb-9">
            <span className="text-[14px] font-bold text-n-500">By skill</span>
            <h2 className="text-[28px] sm:text-[36px] tracking-[-0.035em]">Practise a skill</h2>
            <p className="text-[15px] leading-[1.7] text-n-600 max-w-[28rem]">
              {has
                ? `Your average ${exam === "ielts" ? "band" : "section score"} for each skill, across every attempt.`
                : "Pick any skill to start. Every module is unlocked."}
            </p>
          </Reveal>

          <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
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
                    className="group flex-1 flex flex-col rounded-[22px] bg-n-0 border border-[#EEF0F4] p-2.5 text-ink hover:text-ink
                               shadow-[0_10px_30px_-18px_rgb(18_23_43/0.18)]
                               transition-[transform,box-shadow] duration-[400ms] ease-[cubic-bezier(.2,.7,.2,1)]
                               hover:-translate-y-1.5 hover:shadow-[0_26px_44px_-20px_rgb(18_23_43/0.26)]"
                  >
                    <div className="relative h-[170px] rounded-2xl overflow-hidden flex items-end justify-center" style={{ background: hue.tint }}>
                      <Art
                        art={skillArt(exam, k)}
                        sizes="160px"
                        className="relative h-[156px] w-auto transition-transform duration-500 group-hover:scale-[1.05] origin-bottom"
                      />
                      <span
                        className="absolute top-3 left-3 rounded-full px-[11px] py-[5px] text-[11px] font-extrabold uppercase tracking-[.1em] text-white"
                        style={{ background: hue.deep }}
                      >
                        {SKILL_TITLE[k]}
                      </span>
                    </div>

                    <div className="px-3 pt-[18px] pb-2 flex flex-col gap-3 flex-1">
                      <div className="flex items-center justify-between gap-2.5">
                        <h3 className="text-[19px] leading-[1.2]">{examName} {SKILL_TITLE[k]}</h3>
                        <span className="t-numeric text-[22px] font-extrabold" style={{ color: tried ? hue.deep : "var(--n-400)" }}>
                          {score !== null ? fmt(score, exam) : "—"}
                        </span>
                      </div>
                      <div
                        className="h-1.5 rounded-full bg-[#F2F3F6] overflow-hidden"
                        role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={score ?? 0}
                        aria-label={`${SKILL_TITLE[k]} average`}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${score !== null ? Math.min(100, (score / max) * 100) : 0}%`, background: hue.accent }}
                        />
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2.5 pt-3 border-t border-[#F2F3F6]">
                        <span className="text-[13px] font-bold text-n-500">
                          {tried ? `${m.count} ${m.count === 1 ? "test" : "tests"} taken` : "Not started"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-accent whitespace-nowrap">
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

          {/* ── Recent test history ─────────────────────────────────────── */}
          <Reveal className="flex flex-col items-center text-center gap-2 mt-20 sm:mt-24 mb-8">
            {history.length > 0 && (
              <span className="text-[14px] font-bold text-n-500">
                {total > history.length ? `Last ${history.length} of ${total} tests` : `${total} ${total === 1 ? "test" : "tests"}`}
              </span>
            )}
            <h2 className="text-[28px] sm:text-[36px] tracking-[-0.035em]">Recent test history</h2>
          </Reveal>

          {history.length > 0 ? (
            <ul className="flex flex-col gap-3 max-w-[920px] mx-auto">
              {history.map((r, i) => (
                <Reveal as="li" key={r.id} delay={i * 60}>
                  <HistoryRow r={r} exam={exam} href={withExam(`/${r.module}`)} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <Reveal className="max-w-[920px] mx-auto rounded-3xl border border-[#EEF0F4] grid sm:grid-cols-2 items-center gap-6 px-6 py-7 sm:px-9">
              <Art art={lostArt(exam)} sizes="260px" className="w-[min(100%,260px)] mx-auto" />
              <div className="flex flex-col gap-3 items-start">
                <h3 className="text-[22px]">No tests taken yet</h3>
                <p className="text-[15px] leading-[1.7] text-n-600">Start a practice test to see your results here.</p>
                <Link
                  href={withExam("/#skills")}
                  className="mt-1 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-[11px] text-[14px] font-bold text-accent-on hover:text-accent-on transition-colors duration-200 hover:bg-accent-strong"
                >
                  Browse practice tests
                  <Icon name="next" size={16} />
                </Link>
              </div>
            </Reveal>
          )}

          {/* ── §14 scoring notice, warm panel under two arcs ──────────────── */}
          <Reveal className="relative mt-24 sm:mt-[100px]">
            <svg
              viewBox="0 0 1200 60" preserveAspectRatio="none" fill="none" aria-hidden="true"
              className="absolute left-[10%] -top-[30px] w-[80%] h-[60px]"
            >
              <path d="M10 50C300 -6 900 -6 1190 50" stroke="#E6C79A" strokeWidth="1.3" />
              <path d="M90 58C380 8 820 8 1110 58" stroke="#F0D6B0" strokeWidth="1" />
            </svg>
            <div className="relative rounded-[26px] bg-[#FFF7EA] px-6 py-6 sm:px-9 sm:py-[30px] flex flex-wrap items-center gap-5">
              <span className="w-[46px] h-[46px] rounded-[14px] bg-n-0 flex items-center justify-center shrink-0 text-[#B4690D]">
                <Icon name="info" size={24} />
              </span>
              <p className="flex-[1_1_420px] text-[14.5px] leading-[1.75] text-n-600">
                Every score on LingoPrep is an AI-generated practice estimate on
                the <strong className="text-ink">{scoreRange}</strong> scale. It
                is not an official {legalName} result and cannot be used for
                admissions or visa applications.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}

/* ── History row ────────────────────────────────────────────────────────── */

function HistoryRow({ r, exam, href }: { r: SessionRow; exam: ExamType; href: string }) {
  const hue = HUES[r.module] ?? HUES.reading;
  const banded = Number(r.band_score) > 0;
  const estimate = banded
    ? `${exam === "ielts" ? "Band" : "Score"} ${fmt(Number(r.band_score), exam)}`
    : `${Number(r.score)} / ${Number(r.max_score)}`;
  return (
    <div
      className="flex flex-wrap items-center gap-x-[18px] gap-y-3 rounded-[18px] bg-n-0 border border-[#EEF0F4] py-3.5 pl-3.5 pr-4 sm:pr-5
                 transition-[border-color,box-shadow,transform] duration-200
                 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_25%,white)] hover:shadow-[0_14px_30px_-18px_color-mix(in_srgb,var(--accent)_30%,transparent)]"
    >
      <span className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: hue.tint, color: hue.deep }}>
        <Icon name={r.module} size={20} />
      </span>
      <span className="flex-[1_1_180px] flex flex-col gap-0.5 min-w-0">
        <span className="text-[15.5px] font-bold text-ink">{SKILL_TITLE[r.module]}</span>
        <span className="text-[13px] text-n-500 truncate">{testLabel(r, exam)} · {shortDate(r.created_at)}</span>
      </span>
      <span className="flex items-center gap-4 ml-auto sm:ml-0">
        <span
          className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[14px] font-extrabold whitespace-nowrap t-numeric"
          style={{ background: hue.tint, color: hue.deep }}
        >
          {estimate}
        </span>
        <Link href={href} className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-accent hover:text-accent-strong whitespace-nowrap">
          Practise again
          <Icon name="next" size={16} />
        </Link>
      </span>
    </div>
  );
}
