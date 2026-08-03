"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

/* ───────────────────────────────────────────
   Exam configuration
   ─────────────────────────────────────────── */
type ExamType = "ielts" | "toefl";

const STORAGE_KEY = "lingoprep_exam";

const examConfig = {
  ielts: {
    name: "IELTS",
    fullName: "International English Language Testing System",
    description:
      "Prepare for IELTS Academic & General Training with band-score evaluation across all four modules.",
    color: "#c8102e",
    colorDark: "#a50d24",
    colorLight: "#fef2f2",
    scoreLabel: "Band 1 – 9",
    modules: [
      {
        title: "Reading",
        subtitle: "Academic passages",
        description:
          "Timed comprehension questions on academic reading passages with detailed explanations.",
        href: "/reading?exam=ielts",
        icon: "book",
      },
      {
        title: "Writing",
        subtitle: "Task 1 & Task 2",
        description:
          "Essay prompts graded on Task Achievement, Coherence, Lexical Resource & Grammar.",
        href: "/writing?exam=ielts",
        icon: "pen",
      },
      {
        title: "Listening",
        subtitle: "Audio comprehension",
        description:
          "Listen to recordings and answer section-based questions with full transcript review.",
        href: "/listening?exam=ielts",
        icon: "headphones",
      },
      {
        title: "Speaking",
        subtitle: "Parts 1, 2 & 3",
        description:
          "Record responses and receive AI-powered pronunciation & fluency feedback.",
        href: "/speaking?exam=ielts",
        icon: "mic",
      },
    ],
  },
  toefl: {
    name: "TOEFL",
    fullName: "Test of English as a Foreign Language",
    description:
      "Practice for TOEFL iBT with score-based evaluation across Reading, Listening, Speaking & Writing.",
    color: "#0057b8",
    colorDark: "#004494",
    colorLight: "#eff6ff",
    scoreLabel: "Score 0 – 120",
    modules: [
      {
        title: "Reading",
        subtitle: "Academic texts",
        description:
          "Passages from university-level textbooks with inference and vocabulary questions.",
        href: "/reading?exam=toefl",
        icon: "book",
      },
      {
        title: "Writing",
        subtitle: "Integrated & Independent",
        description:
          "Integrated tasks combining reading/listening, plus independent essay prompts.",
        href: "/writing?exam=toefl",
        icon: "pen",
      },
      {
        title: "Listening",
        subtitle: "Lectures & conversations",
        description:
          "University lectures and campus conversations with note-taking practice.",
        href: "/listening?exam=toefl",
        icon: "headphones",
      },
      {
        title: "Speaking",
        subtitle: "Independent & Integrated",
        description:
          "Express opinions and summarize information with AI-scored pronunciation feedback.",
        href: "/speaking?exam=toefl",
        icon: "mic",
      },
    ],
  },
};

/* ───────────────────────────────────────────
   SVG Icons
   ─────────────────────────────────────────── */
function BookIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function PenIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
function HeadphonesIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}
function MicIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

const iconMap: Record<string, (props: { color: string }) => React.ReactNode> = {
  book: BookIcon,
  pen: PenIcon,
  headphones: HeadphonesIcon,
  mic: MicIcon,
};

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

/* ───────────────────────────────────────────
   Main Page Component
   ─────────────────────────────────────────── */
export default function Home() {
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load persisted exam choice from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ExamType | null;
    if (stored === "ielts" || stored === "toefl") {
      setSelectedExam(stored);
    }
    setMounted(true);
  }, []);

  const handleSelectExam = (exam: ExamType) => {
    setSelectedExam(exam);
    localStorage.setItem(STORAGE_KEY, exam);
  };

  const handleChangeExam = () => {
    setSelectedExam(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Avoid hydration mismatch — show nothing until client-side mount
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-[#c8102e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const config = selectedExam ? examConfig[selectedExam] : null;

  /* ─── Exam Selector View ─── */
  if (!selectedExam) {
    return (
      <div className="flex flex-col">
        {/* Hero */}
        <section className="bg-white border-b border-[#e0e0e0]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
            <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-[#f5f5f5] border border-[#e0e0e0]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8102e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="text-[13px] font-bold text-[#555]">LingoPrep</span>
            </div>
            <h1 className="text-[32px] sm:text-[44px] font-bold text-[#1a1a1a] leading-tight mb-4">
              Choose Your Exam
            </h1>
            <p className="text-[16px] text-[#666] max-w-xl mx-auto leading-relaxed mb-12">
              Select the exam you are preparing for. Get AI-powered practice tests, scoring, and feedback tailored to your chosen test format.
            </p>

            {/* Exam Cards */}
            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* IELTS Card */}
              <button
                id="select-ielts"
                onClick={() => handleSelectExam("ielts")}
                className="group relative bg-white border-2 border-[#e0e0e0] rounded-2xl p-8 text-left hover:border-[#c8102e] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(200,16,46,0.12)] cursor-pointer"
              >
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#fef2f2] flex items-center justify-center group-hover:bg-[#c8102e] transition-colors duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8102e" strokeWidth="2.5" className="group-hover:stroke-white transition-colors duration-300">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                <div className="w-14 h-14 rounded-xl bg-[#fef2f2] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-[24px] font-black text-[#c8102e]">I</span>
                </div>
                <h2 className="text-[22px] font-bold text-[#1a1a1a] mb-1">IELTS</h2>
                <p className="text-[12px] font-semibold text-[#999] uppercase tracking-wider mb-3">
                  International English Language Testing System
                </p>
                <p className="text-[14px] text-[#666] leading-relaxed mb-4">
                  Academic & General Training with band score evaluation from 1 to 9.
                </p>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#fef2f2] text-[#c8102e]">Band 1 – 9</span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#f5f5f5] text-[#555]">4 Modules</span>
                </div>
              </button>

              {/* TOEFL Card */}
              <button
                id="select-toefl"
                onClick={() => handleSelectExam("toefl")}
                className="group relative bg-white border-2 border-[#e0e0e0] rounded-2xl p-8 text-left hover:border-[#0057b8] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,87,184,0.12)] cursor-pointer"
              >
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#eff6ff] flex items-center justify-center group-hover:bg-[#0057b8] transition-colors duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0057b8" strokeWidth="2.5" className="group-hover:stroke-white transition-colors duration-300">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                <div className="w-14 h-14 rounded-xl bg-[#eff6ff] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-[24px] font-black text-[#0057b8]">T</span>
                </div>
                <h2 className="text-[22px] font-bold text-[#1a1a1a] mb-1">TOEFL</h2>
                <p className="text-[12px] font-semibold text-[#999] uppercase tracking-wider mb-3">
                  Test of English as a Foreign Language
                </p>
                <p className="text-[14px] text-[#666] leading-relaxed mb-4">
                  iBT format with integrated tasks and score evaluation out of 120.
                </p>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#eff6ff] text-[#0057b8]">Score 0 – 120</span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#f5f5f5] text-[#555]">4 Sections</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="bg-white border-t border-[#e0e0e0] py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              <div>
                <CheckCircleIcon />
                <h3 className="font-bold text-[15px] text-[#1a1a1a] mt-3 mb-1">AI-Powered Scoring</h3>
                <p className="text-[13px] text-[#666] leading-relaxed">Get instant scores and detailed feedback on your writing and speaking responses.</p>
              </div>
              <div>
                <CheckCircleIcon />
                <h3 className="font-bold text-[15px] text-[#1a1a1a] mt-3 mb-1">Exam-Specific Content</h3>
                <p className="text-[13px] text-[#666] leading-relaxed">Practice with content tailored to IELTS or TOEFL test formats and scoring criteria.</p>
              </div>
              <div>
                <CheckCircleIcon />
                <h3 className="font-bold text-[15px] text-[#1a1a1a] mt-3 mb-1">Track Your Progress</h3>
                <p className="text-[13px] text-[#666] leading-relaxed">Review past scores and monitor improvement across all test modules.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ─── Module Cards View (exam selected) ─── */
  return (
    <div className="flex flex-col">
      {/* Hero — selected exam */}
      <section className="bg-white border-b border-[#e0e0e0]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
            <div>
              <button
                onClick={handleChangeExam}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold mb-4 hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: config!.color }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Change exam
              </button>
              <h1 className="text-[32px] sm:text-[40px] font-bold text-[#1a1a1a] leading-tight mb-2">
                {config!.name} Practice Tests
              </h1>
              <p className="text-[14px] text-[#666] max-w-lg leading-relaxed">
                {config!.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="px-4 py-2 rounded-full text-[12px] font-bold text-white"
                style={{ backgroundColor: config!.color }}
              >
                {config!.name}
              </span>
              <Link
                href="/dashboard"
                className="px-5 py-2 border border-[#ddd] text-[#333] font-semibold rounded-full hover:bg-[#fafafa] transition-colors text-[13px]"
              >
                View results
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Module cards */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[22px] font-bold text-[#1a1a1a] flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={config!.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Practice Modules
            </h2>
            <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: config!.color }}>
              {config!.scoreLabel}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {config!.modules.map((mod) => {
              const IconComponent = iconMap[mod.icon];
              return (
                <div
                  key={mod.title}
                  className="group bg-white border border-[#e0e0e0] rounded-xl p-6 flex flex-col hover:border-transparent transition-all duration-300"
                  style={{
                    // @ts-ignore
                    "--hover-shadow": `0 8px 30px ${config!.color}18`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${config!.color}20`;
                    (e.currentTarget as HTMLElement).style.borderColor = config!.color;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLElement).style.borderColor = "#e0e0e0";
                  }}
                >
                  {/* Icon + Tag */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: config!.colorLight }}
                    >
                      {IconComponent && <IconComponent color={config!.color} />}
                    </div>
                    <span
                      className="text-[11px] font-bold text-white px-2.5 py-0.5 rounded"
                      style={{ backgroundColor: config!.color }}
                    >
                      {config!.name}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[16px] font-bold text-[#1a1a1a] leading-snug mb-1">
                    {mod.title}
                  </h3>
                  <p className="text-[12px] font-semibold text-[#999] mb-2">{mod.subtitle}</p>
                  <p className="text-[13px] text-[#666] leading-relaxed mb-auto">
                    {mod.description}
                  </p>

                  {/* Actions */}
                  <div className="mt-5 space-y-2">
                    <Link
                      href={mod.href}
                      className="block text-center py-2.5 text-white font-semibold text-[13px] rounded-full transition-colors"
                      style={{ backgroundColor: config!.color }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = config!.colorDark)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = config!.color)}
                    >
                      Start Practice
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block text-center py-2 border border-[#ddd] text-[#333] font-semibold text-[13px] rounded-full hover:bg-[#fafafa] transition-colors"
                    >
                      View Scores
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="bg-white border-t border-[#e0e0e0] py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <CheckCircleIcon />
              <h3 className="font-bold text-[15px] text-[#1a1a1a] mt-3 mb-1">AI-Powered Scoring</h3>
              <p className="text-[13px] text-[#666] leading-relaxed">Get instant {config!.name} scores and detailed feedback on your writing and speaking responses.</p>
            </div>
            <div>
              <CheckCircleIcon />
              <h3 className="font-bold text-[15px] text-[#1a1a1a] mt-3 mb-1">
                {selectedExam === "ielts" ? "Computer-Based Format" : "iBT Test Format"}
              </h3>
              <p className="text-[13px] text-[#666] leading-relaxed">
                Practice in the same format used in the actual {config!.name} {selectedExam === "ielts" ? "computer-delivered" : "internet-based"} test.
              </p>
            </div>
            <div>
              <CheckCircleIcon />
              <h3 className="font-bold text-[15px] text-[#1a1a1a] mt-3 mb-1">Track Your Progress</h3>
              <p className="text-[13px] text-[#666] leading-relaxed">Review past scores and monitor improvement across all four {config!.name} test modules.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
