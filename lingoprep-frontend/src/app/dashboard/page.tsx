"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

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

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await api.get("/api/users/stats");
        setStats(res.data?.data || null);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Could not load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] flex-col gap-3">
        <div className="w-7 h-7 border-2 border-[#c8102e] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[13px] text-[#999]">Loading results...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <svg className="mx-auto mb-4" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c8102e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-2">Unable to load results</h2>
        <p className="text-[14px] text-[#666] mb-5">{error || "Please try again."}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2 bg-[#c8102e] text-white font-semibold text-[13px] rounded-full hover:bg-[#a50d24] transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const moduleCards = [
    { title: "Listening", score: stats.listening_avg, href: "/listening" },
    { title: "Reading", score: stats.reading_avg, href: "/reading" },
    { title: "Writing", score: stats.writing_avg, href: "/writing" },
    { title: "Speaking", score: stats.speaking_avg, href: "/speaking" },
  ];

  const isToefl = stats.active_track === "toefl";
  const maxScore = isToefl ? 120 : 9;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-[#1a1a1a]">Your results</h1>
        <p className="text-[14px] text-[#666] mt-1">Check your scores and track your progress across all modules.</p>
      </div>

      {/* Overall score card */}
      <div className="bg-white border border-[#e0e0e0] rounded-lg p-6 sm:p-8 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <p className="text-[12px] font-bold text-[#999] uppercase tracking-wider mb-1">Overall Band Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[48px] font-bold text-[#1a1a1a] leading-none">
              {stats.overall_band > 0 ? stats.overall_band.toFixed(1) : "—"}
            </span>
            <span className="text-[16px] text-[#999]">/ {maxScore}</span>
          </div>
          <p className="text-[13px] text-[#999] mt-2">Based on {stats.total_sessions} practice sessions</p>
        </div>

        <span className="text-[11px] font-bold bg-[#f5f5f5] text-[#555] px-3 py-1 rounded-full uppercase tracking-wide">
          {stats.active_track}
        </span>
      </div>

      {/* Module breakdown */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {moduleCards.map((mod) => (
          <Link
            key={mod.title}
            href={mod.href}
            className="group bg-white border border-[#e0e0e0] rounded-lg p-5 hover:border-[#c8102e] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] font-bold text-[#1a1a1a]">{mod.title}</span>
              <span className="text-[20px] font-bold text-[#1a1a1a]">
                {mod.score > 0 ? mod.score.toFixed(1) : "—"}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#c8102e] rounded-full transition-all duration-500"
                style={{ width: `${mod.score > 0 ? (mod.score / (isToefl ? 30 : 9)) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[12px] text-[#c8102e] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Retake →
            </p>
          </Link>
        ))}
      </div>

      {/* Recent test history */}
      <div className="bg-white border border-[#e0e0e0] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e0e0e0]">
          <h2 className="text-[16px] font-bold text-[#1a1a1a]">Recent test history</h2>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#f0f0f0] text-[12px] font-bold text-[#999] uppercase">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Test name</th>
              <th className="px-6 py-3">Score</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent_sessions.map((s) => (
              <tr key={s.id} className="border-b border-[#f0f0f0] text-[14px] hover:bg-[#fafafa] transition-colors">
                <td className="px-6 py-3.5 text-[#666]">
                  {new Date(s.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-3.5 font-semibold text-[#1a1a1a] capitalize">
                  {s.module} Practice
                </td>
                <td className="px-6 py-3.5 text-[#1a1a1a] font-bold">
                  {s.band_score > 0 ? `${s.band_score.toFixed(1)} Band` : `${s.score}/${s.max_score}`}
                </td>
                <td className="px-6 py-3.5 text-right">
                  <span className="text-[12px] font-semibold text-[#c8102e] cursor-pointer hover:underline">Review</span>
                </td>
              </tr>
            ))}
            {stats.recent_sessions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-[14px] text-[#999]">
                  No tests taken yet. Start a practice test to see your results here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
