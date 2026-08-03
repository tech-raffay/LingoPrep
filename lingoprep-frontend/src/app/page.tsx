"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function Home() {
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlExam = searchParams.get("exam") as ExamType | null;
    if (urlExam === "ielts" || urlExam === "toefl") {
      setSelectedExam(urlExam);
      localStorage.setItem(STORAGE_KEY, urlExam);
    } else {
      const stored = localStorage.getItem(STORAGE_KEY) as ExamType | null;
      if (stored === "ielts" || stored === "toefl") {
        setSelectedExam(stored);
        router.replace(`/?exam=${stored}`);
      } else {
        setSelectedExam(null);
      }
    }
    setMounted(true);
  }, [searchParams, router]);

  const handleSelectExam = (exam: ExamType) => {
    setSelectedExam(exam);
    localStorage.setItem(STORAGE_KEY, exam);
    router.push(`/?exam=${exam}`);
  };

  const handleChangeExam = () => {
    setSelectedExam(null);
    localStorage.removeItem(STORAGE_KEY);
    router.push("/");
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-[#c8102e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const config = selectedExam ? examConfig[selectedExam] : null;

  /* ─── Hero / Main Landing Page View (When no exam is selected) ─── */
  if (!selectedExam) {
    return (
      <div className="flex flex-col bg-[#fafafa]">
        {/* Hero Section */}
        <section className="bg-white border-b border-[#e0e0e0] py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Heading and info */}
              <div className="lg:col-span-7 space-y-6">
                <h1 className="text-[40px] sm:text-[54px] font-extrabold text-[#000000] leading-[1.1] tracking-tight">
                  Achieve Your{" "}
                  <span className="relative inline-block text-[#c8102e]">
                    Dream Score
                    <svg className="absolute left-0 -bottom-2 w-full h-3 text-[#c8102e]" viewBox="0 0 100 10" preserveAspectRatio="none" fill="none">
                      <path d="M3 7 C 30 3, 70 3, 97 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </span>{" "}
                  with LingoPrep
                </h1>
                <p className="text-[16px] sm:text-[17px] text-[#555] leading-relaxed max-w-xl">
                  AI-powered practice tests, instant scoring, and expert feedback tailored to IELTS and TOEFL. Start preparing smarter today.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href="#choose-path"
                    className="inline-flex items-center justify-center px-6 py-3.5 bg-[#c8102e] hover:bg-[#a50d24] text-white font-bold text-[14px] rounded-full transition-all shadow-md hover:shadow-lg"
                  >
                    Get Started →
                  </a>
                  <button
                    onClick={() => alert("Demo video is coming soon!")}
                    className="inline-flex items-center justify-center px-6 py-3.5 bg-white hover:bg-[#fafafa] border border-[#ddd] text-[#333541] font-bold text-[14px] rounded-full transition-all gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Watch Demo
                  </button>
                </div>
                
                {/* Social proof trust badge */}
                <div className="flex items-center gap-3 pt-6">
                  <div className="flex -space-x-2">
                    <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80" alt="Student" />
                    <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" alt="Student" />
                    <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80" alt="Student" />
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-[#666]">+10k</div>
                  </div>
                  <span className="text-[13px] font-semibold text-[#666]">Trusted by students worldwide</span>
                </div>
              </div>

              {/* Right Column: Hero image with custom floating metric card */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"
                    alt="Students studying"
                    className="w-full h-[450px] object-cover"
                  />
                  {/* Floating target score overlay card */}
                  <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#e8f5e9] flex items-center justify-center text-[#2e7d32]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Score</div>
                        <div className="text-[16px] font-bold text-slate-900">IELTS 8.0</div>
                      </div>
                    </div>
                    <div className="text-right border-l border-slate-200 pl-4">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Probability</div>
                      <div className="text-[18px] font-extrabold text-[#2e7d32]">92%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-[32px] font-extrabold text-[#000000] mb-2">Smarter preparation, better results</h2>
            <p className="text-[16px] text-[#666] max-w-xl mx-auto leading-relaxed mb-16">
              Everything you need to confidently walk into test day.
            </p>

            <div className="grid md:grid-cols-3 gap-8 text-left">
              {/* Feature 1 */}
              <div className="bg-[#fafafa] border border-[#e0e0e0] rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#e0e0e0] flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c8102e" strokeWidth="1.5">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-bold text-[#000000] mb-3">AI-Powered Scoring</h3>
                <p className="text-[14px] text-[#555] leading-relaxed">
                  Get instant scores and detailed feedback on your writing and speaking responses using our advanced AI.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#fafafa] border border-[#e0e0e0] rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#e0e0e0] flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c8102e" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-bold text-[#000000] mb-3">Exam-Specific Content</h3>
                <p className="text-[14px] text-[#555] leading-relaxed">
                  Practice with content precisely tailored to official IELTS and TOEFL test formats and scoring criteria.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#fafafa] border border-[#e0e0e0] rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#e0e0e0] flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c8102e" strokeWidth="1.5">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-bold text-[#000000] mb-3">Track Your Progress</h3>
                <p className="text-[14px] text-[#555] leading-relaxed">
                  Review past scores and monitor improvement across all test modules with detailed analytics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Choose Your Path Section */}
        <section id="choose-path" className="py-20 bg-slate-50 border-t border-[#e0e0e0]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <h2 className="text-[32px] font-extrabold text-[#000000] mb-2">Choose Your Path</h2>
                <p className="text-[15px] text-[#666] max-w-xl leading-relaxed">
                  Select your target examination to access tailored practice materials, mock tests, and specialized feedback rubrics.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="mt-4 md:mt-0 inline-flex items-center gap-1 text-[13px] font-bold hover:underline"
                style={{ color: "#c8102e" }}
              >
                View all materials →
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* IELTS Path Card */}
              <div className="bg-white border border-[#e0e0e0] rounded-3xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                {/* Visual red gradient accent background corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#c8102e]/5 to-transparent rounded-bl-full pointer-events-none" />

                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#c8102e] flex items-center justify-center text-white font-extrabold text-[18px]">
                      I
                    </div>
                    <h3 className="text-[20px] font-bold text-[#000000]">IELTS Preparation</h3>
                  </div>
                  <p className="text-[14px] text-[#555] leading-relaxed mb-8">
                    Comprehensive modules for Academic and General Training. Master the 4 skills with realistic test scenarios.
                  </p>

                  {/* 4 skills pill list */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <span className="flex items-center gap-2 py-2 px-3 bg-[#f5f5f5] rounded-xl text-[12px] font-semibold text-[#555]">
                      🎧 Listening
                    </span>
                    <span className="flex items-center gap-2 py-2 px-3 bg-[#f5f5f5] rounded-xl text-[12px] font-semibold text-[#555]">
                      📖 Reading
                    </span>
                    <span className="flex items-center gap-2 py-2 px-3 bg-[#f5f5f5] rounded-xl text-[12px] font-semibold text-[#555]">
                      ✍️ Writing
                    </span>
                    <span className="flex items-center gap-2 py-2 px-3 bg-[#f5f5f5] rounded-xl text-[12px] font-semibold text-[#555]">
                      🎤 Speaking
                    </span>
                  </div>
                </div>

                <button
                  id="select-ielts"
                  onClick={() => handleSelectExam("ielts")}
                  className="w-full py-3 bg-[#c8102e] hover:bg-[#a50d24] text-white font-bold text-[14px] rounded-full transition-colors text-center shadow-sm cursor-pointer"
                >
                  Start IELTS Practice →
                </button>
              </div>

              {/* TOEFL Path Card */}
              <div className="bg-white border border-[#e0e0e0] rounded-3xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                {/* Visual blue gradient accent background corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#0057b8]/5 to-transparent rounded-bl-full pointer-events-none" />

                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#0057b8] flex items-center justify-center text-white font-extrabold text-[18px]">
                      T
                    </div>
                    <h3 className="text-[20px] font-bold text-[#000000]">TOEFL iBT® Preparation</h3>
                  </div>
                  <p className="text-[14px] text-[#555] leading-relaxed mb-8">
                    Integrated tasks and authentic academic content designed to boost your iBT score efficiently.
                  </p>

                  {/* 4 features pill list */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <span className="flex items-center gap-2 py-2 px-3 bg-[#f5f5f5] rounded-xl text-[12px] font-semibold text-[#555]">
                      💻 iBT Format
                    </span>
                    <span className="flex items-center gap-2 py-2 px-3 bg-[#f5f5f5] rounded-xl text-[12px] font-semibold text-[#555]">
                      🎓 Academic Focus
                    </span>
                    <span className="flex items-center gap-2 py-2 px-3 bg-[#f5f5f5] rounded-xl text-[12px] font-semibold text-[#555]">
                      🔄 Integrated Tasks
                    </span>
                    <span className="flex items-center gap-2 py-2 px-3 bg-[#f5f5f5] rounded-xl text-[12px] font-semibold text-[#555]">
                      📊 Score Analysis
                    </span>
                  </div>
                </div>

                <button
                  id="select-toefl"
                  onClick={() => handleSelectExam("toefl")}
                  className="w-full py-3 bg-[#0057b8] hover:bg-[#004494] text-white font-bold text-[14px] rounded-full transition-colors text-center shadow-sm cursor-pointer"
                >
                  Start TOEFL Practice →
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ─── Exam Module Dashboard View (When an exam is selected) ─── */
  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* Cockpit Hero */}
      <section className="bg-white border-b border-[#e0e0e0]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <button
                onClick={handleChangeExam}
                className="inline-flex items-center gap-1.5 text-[13px] font-bold mb-4 hover:opacity-75 transition-opacity cursor-pointer"
                style={{ color: config!.color }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Change exam
              </button>
              <h1 className="text-[36px] sm:text-[44px] font-extrabold text-[#000000] leading-tight mb-3">
                {config!.name} Practice Tests
              </h1>
              <p className="text-[15px] text-[#555] max-w-xl leading-relaxed">
                {config!.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="px-4 py-2 rounded-full text-[12px] font-extrabold text-white"
                style={{ backgroundColor: config!.color }}
              >
                {config!.name}
              </span>
              <Link
                href="/dashboard"
                className="px-5 py-2 border border-[#ddd] bg-white text-[#333541] font-bold rounded-full hover:bg-[#fafafa] transition-colors text-[13px] shadow-sm"
              >
                View results
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cockpit Modules Grid */}
      <section className="py-16 flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[24px] font-bold text-[#000000] flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={config!.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {config!.modules.map((mod) => {
              const IconComponent = iconMap[mod.icon];
              return (
                <div
                  key={mod.title}
                  className="group bg-white border border-[#e0e0e0] rounded-2xl p-6 flex flex-col hover:border-transparent transition-all duration-300"
                  style={{
                    // @ts-ignore
                    "--hover-shadow": `0 12px 40px ${config!.color}15`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${config!.color}15`;
                    (e.currentTarget as HTMLElement).style.borderColor = config!.color;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLElement).style.borderColor = "#e0e0e0";
                  }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: config!.colorLight }}
                    >
                      {IconComponent && <IconComponent color={config!.color} />}
                    </div>
                    <span
                      className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded uppercase"
                      style={{ backgroundColor: config!.color }}
                    >
                      {config!.name}
                    </span>
                  </div>

                  <h3 className="text-[18px] font-bold text-[#000000] mb-1">
                    {mod.title}
                  </h3>
                  <p className="text-[12px] font-semibold text-[#999] mb-3">{mod.subtitle}</p>
                  <p className="text-[13px] text-[#555] leading-relaxed mb-6 flex-1">
                    {mod.description}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-[#f0f0f0]">
                    <Link
                      href={mod.href}
                      className="block text-center py-2.5 text-white font-bold text-[13px] rounded-full transition-colors"
                      style={{ backgroundColor: config!.color }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = config!.colorDark)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = config!.color)}
                    >
                      Start Practice
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block text-center py-2.5 border border-[#ddd] bg-white text-[#333541] font-bold text-[13px] rounded-full hover:bg-[#fafafa] transition-colors"
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
    </div>
  );
}
