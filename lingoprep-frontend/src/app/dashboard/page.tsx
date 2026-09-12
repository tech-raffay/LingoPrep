"use client";

/**
 * Results dashboard.
 *
 * ── What was wrong ───────────────────────────────────────────────────────────
 * This page had no exam theming at all: seven hardcoded #c8102e values meant a
 * TOEFL candidate got crimson spinners, crimson progress bars, crimson "Retake"
 * and crimson "Review" links under a blue navbar — two accents on one screen,
 * which brand book §07 explicitly forbids. It also formatted every score with
 * `toFixed(1)`, printing TOEFL section scores as "23.0" when §10 requires
 * "one decimal for IELTS, integer for TOEFL", and divided module bars by 30
 * while labelling the overall score out of 9.
 *
 * Now every accent surface reads var(--accent) and every number goes through
 * `formatScore`, so the page is correct in both exams by construction.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useExam } from "@/components/theme/ExamThemeProvider";
import { formatScore, isExamType, type ExamType } from "@/lib/exam";
import Icon, { type IconName } from "@/components/brand/Icon";
import {
  AiScoreNotice, Badge, Button, Card, CriterionBar, Eyebrow, ScoreCircle, Spinner,
} from "@/components/brand/ui";

interface SessionLog {
  id: string;
  module: string;
  score: number;
  max_score: number;
  percentage: number;
  band_score: number;
  created_at: string;
  passage_title?: string;
}

interface UserStats {
  active_track: string;
  total_sessions: number;
  average_percentage: number;
  overall_band: number;
  reading_avg: number;
  listening_avg: number;
  writing_avg: number;
  speaking_avg: number;
  recent_sessions: SessionLog[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { exam, theme, setExam, withExam } = useExam();

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/users/stats");
        setStats(res.data?.data || null);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Could not load your practice results.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // The backend is the authority on which track the candidate actually
  // practiced. If it disagrees with the URL, adopt it — that keeps the theme
  // and the numbers describing the same exam instead of showing IELTS bands
  // under a TOEFL accent.
  const track: string | undefined = stats?.active_track;
  useEffect(() => {
    if (isExamType(track) && track !== exam) setExam(track as ExamType);
  }, [track, exam, setExam]);

  if (loading) {
    return (
      <ProtectedRoute>
        <Spinner label="Loading your practice results…" />
      </ProtectedRoute>
    );
  }

  if (error || !stats) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          {/* Semantic warning colour, not the exam accent (§07) */}
          <Icon name="warning" size={32} className="mx-auto mb-4 text-warning" />
          <h2 className="text-[20px] mb-2">Unable to load results</h2>
          <p className="text-[14px] text-n-600 mb-6">{error ?? "Please try again."}</p>
          <Button icon="retry" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  const modules: Array<{ title: string; score: number; icon: IconName; href: string }> = [
    { title: "Listening", score: stats.listening_avg, icon: "listening", href: withExam("/listening") },
    { title: "Reading", score: stats.reading_avg, icon: "reading", href: withExam("/reading") },
    { title: "Writing", score: stats.writing_avg, icon: "writing", href: withExam("/writing") },
    { title: "Speaking", score: stats.speaking_avg, icon: "speaking", href: withExam("/speaking") },
  ];

  const hasSessions = stats.total_sessions > 0;

  return (
    <ProtectedRoute>
      {/* §13: graph paper is the texture for practice & results areas */}
      <div className="tx-graph min-h-full">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          {/* ── Page header ───────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div>
              <Eyebrow className="mb-2">Practice record</Eyebrow>
              <h1 className="text-[32px] leading-[38px] sm:text-[40px] sm:leading-[46px]">
                Your results
              </h1>
              <p className="t-body-lg text-n-600 mt-2 max-w-xl">
                Your {theme.name} practice estimates across all four skills, and
                what to work on next.
              </p>
            </div>
            <Badge icon="target">{theme.name}</Badge>
          </div>

          {/* ── Overall score (§10 score circle) ──────────────────────────── */}
          <Card feature className="p-6 sm:p-8 mb-6">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              <ScoreCircle
                value={hasSessions && stats.overall_band > 0 ? stats.overall_band : null}
                max={theme.overallMax}
                decimals={theme.scoreDecimals}
                label={theme.scoreLabel}
                caption="Practice estimate"
              />

              <div className="flex-1 w-full">
                <h2 className="text-[24px] leading-[30px] mb-2">
                  {hasSessions ? "Where you stand" : "No practice yet"}
                </h2>
                <p className="t-body text-n-600 mb-5">
                  {hasSessions
                    ? `Averaged across ${stats.total_sessions} practice ${
                        stats.total_sessions === 1 ? "session" : "sessions"
                      }. Every score here is an estimate produced by AI, on the ${theme.scoreRange} scale.`
                    : `Take your first ${theme.name} practice test and your estimate will appear here.`}
                </p>

                {/* §10 criterion bars — accent fill, numeric always labelled */}
                {hasSessions && (
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mb-5">
                    {modules.map((m) => (
                      <CriterionBar
                        key={m.title}
                        label={m.title}
                        value={m.score > 0 ? m.score : 0}
                        max={theme.moduleMax}
                        decimals={theme.scoreDecimals}
                      />
                    ))}
                  </div>
                )}

                {/* §14: state that scoring is AI-generated wherever a band shows */}
                <AiScoreNotice />
              </div>
            </div>
          </Card>

          {/* ── Module tiles (§09: 44px tile, 12px radius, no emoji) ──────── */}
          <h2 className="text-[20px] leading-[26px] mb-4">Practice a skill</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {modules.map((m) => (
              <Link key={m.title} href={m.href} className="group">
                <Card interactive className="p-5 h-full">
                  <div className="flex items-start justify-between mb-4">
                    {/* Resting module tile: neutral surface. Only the active
                        module takes the accent tint (§09) — here, on hover. */}
                    <span
                      className="w-11 h-11 rounded-xl bg-n-100 text-n-600 flex items-center justify-center
                                 transition-colors duration-[120ms]
                                 group-hover:bg-accent-tint group-hover:text-accent"
                    >
                      <Icon name={m.icon} size={24} />
                    </span>
                    <span className="t-numeric text-[22px] text-ink">
                      {m.score > 0 ? formatScore(m.score, exam) : "—"}
                    </span>
                  </div>
                  <div className="text-[16px] font-bold text-ink mb-1">{m.title}</div>
                  <div className="flex items-center gap-1 text-[13px] font-bold text-accent">
                    {m.score > 0 ? "Retake" : "Start"}
                    <Icon
                      name="next"
                      size={16}
                      className="transition-transform duration-[120ms] group-hover:translate-x-0.5"
                    />
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* ── Recent history ───────────────────────────────────────────── */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-n-300 flex items-center gap-2.5">
              <Icon name="schedule" size={20} className="text-n-500" />
              <h2 className="text-[16px] leading-[22px]">Recent test history</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[560px]">
                <thead>
                  <tr className="border-b border-n-200 bg-n-50">
                    <th className="px-6 py-3 t-label text-n-500">Date</th>
                    <th className="px-6 py-3 t-label text-n-500">Test</th>
                    <th className="px-6 py-3 t-label text-n-500">Estimate</th>
                    <th className="px-6 py-3 t-label text-n-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_sessions.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-n-200 last:border-0 hover:bg-n-50 transition-colors duration-[120ms]"
                    >
                      <td className="px-6 py-3.5 text-[13px] text-n-600 t-numeric font-medium">
                        {new Date(s.created_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-6 py-3.5 text-[14px] font-bold text-ink capitalize">
                        {s.module} practice
                      </td>
                      <td className="px-6 py-3.5">
                        {/* Correct scale per exam — no more "23.0" for TOEFL */}
                        <span className="t-numeric text-[14px] text-ink">
                          {s.band_score > 0
                            ? `${formatScore(s.band_score, exam)} / ${theme.moduleMax}`
                            : `${s.score} / ${s.max_score}`}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          href={withExam(`/${s.module}`)}
                          className="text-[13px] font-bold text-accent hover:underline"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {stats.recent_sessions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-14 text-center">
                        {/* §13: crimson hatch is the empty-state texture; it
                            follows the accent, so it is blue on TOEFL. */}
                        <span className="inline-flex w-12 h-12 rounded-full tx-hatch text-accent items-center justify-center mb-3">
                          <Icon name="report" size={24} />
                        </span>
                        <p className="text-[14px] text-n-600">
                          No tests taken yet. Start a practice test to see your
                          results here.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
