import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard — LingoPrep",
  description: "Track your IELTS & TOEFL preparation progress, view scores, and analyze your performance across all modules.",
};

// Placeholder data — will be replaced with real API calls
const recentSessions = [
  { id: "1", module: "Reading", score: 7.5, maxScore: 9, date: "2026-07-19", icon: "📖" },
  { id: "2", module: "Listening", score: 6.5, maxScore: 9, date: "2026-07-18", icon: "🎧" },
  { id: "3", module: "Writing", score: 6.0, maxScore: 9, date: "2026-07-17", icon: "✍️" },
];

const moduleCards = [
  { title: "Reading", icon: "📖", score: 7.5, href: "/reading", color: "from-indigo-500 to-purple-600" },
  { title: "Listening", icon: "🎧", score: 6.5, href: "/listening", color: "from-cyan-500 to-blue-600" },
  { title: "Writing", icon: "✍️", score: 6.0, href: "/writing", color: "from-amber-500 to-orange-600" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-text-muted mt-2">
          Welcome back! Here&apos;s your preparation overview.
        </p>
      </div>

      {/* Overall Score Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-8 sm:p-10 mb-10 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-2">Overall Band Score</p>
          <div className="flex items-end gap-3">
            <span className="text-6xl sm:text-7xl font-bold">6.7</span>
            <span className="text-xl text-white/70 mb-2">/ 9.0</span>
          </div>
          <p className="text-white/70 mt-2">Based on 3 practice sessions</p>
        </div>
      </div>

      {/* Module Score Cards */}
      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        {moduleCards.map((mod) => (
          <Link
            key={mod.title}
            href={mod.href}
            className="group rounded-2xl border border-border bg-surface p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{mod.icon}</span>
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${mod.color} text-white text-sm font-bold`}>
                {mod.score}
              </div>
            </div>
            <h3 className="font-bold text-lg">{mod.title}</h3>
            <p className="text-sm text-text-muted mt-1">Click to practice</p>
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${mod.color} rounded-full transition-all duration-500`}
                style={{ width: `${(mod.score / 9) * 100}%` }}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Sessions */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-bold text-lg">Recent Sessions</h2>
        </div>
        <div className="divide-y divide-border">
          {recentSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{session.icon}</span>
                <div>
                  <p className="font-medium">{session.module}</p>
                  <p className="text-sm text-text-muted">{session.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">
                  {session.score}
                  <span className="text-sm text-text-muted font-normal"> / {session.maxScore}</span>
                </p>
                <p className="text-sm text-text-muted">
                  {Math.round((session.score / session.maxScore) * 100)}%
                </p>
              </div>
            </div>
          ))}
        </div>
        {recentSessions.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-text-muted">No practice sessions yet. Start practicing!</p>
          </div>
        )}
      </div>
    </div>
  );
}
