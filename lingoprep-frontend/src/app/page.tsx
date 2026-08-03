"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type ExamType = "ielts" | "toefl";
const STORAGE_KEY = "lingoprep_exam";

const examConfig = {
  ielts: {
    name: "IELTS",
    description: "Prepare for IELTS Academic & General Training with band-score evaluation across all four modules.",
    color: "#c8102e", colorDark: "#a50d24", colorLight: "#fef2f2",
    scoreLabel: "Band 1 – 9",
    modules: [
      { title: "Listening", desc: "Practice tests, audio exercises and transcripts.", href: "/listening?exam=ielts", icon: "headphones" },
      { title: "Reading", desc: "Practice tests, passages and comprehension tasks.", href: "/reading?exam=ielts", icon: "book" },
      { title: "Writing", desc: "Practice tests, essay prompts and AI scoring.", href: "/writing?exam=ielts", icon: "pen" },
      { title: "Speaking", desc: "Practice tests, recording and AI feedback.", href: "/speaking?exam=ielts", icon: "mic" },
    ],
  },
  toefl: {
    name: "TOEFL",
    description: "Practice for TOEFL iBT with score-based evaluation across Reading, Listening, Speaking & Writing.",
    color: "#0057b8", colorDark: "#004494", colorLight: "#eff6ff",
    scoreLabel: "Score 0 – 120",
    modules: [
      { title: "Listening", desc: "Practice tests, lectures and conversations.", href: "/listening?exam=toefl", icon: "headphones" },
      { title: "Reading", desc: "Practice tests, academic texts and inference.", href: "/reading?exam=toefl", icon: "book" },
      { title: "Writing", desc: "Practice tests, integrated and independent tasks.", href: "/writing?exam=toefl", icon: "pen" },
      { title: "Speaking", desc: "Practice tests, opinions and summaries.", href: "/speaking?exam=toefl", icon: "mic" },
    ],
  },
};

/* ── Clean SVG Icons (IDP-style, no emojis) ── */
function HeadphonesIcon({ color = "#555" }: { color?: string }) {
  return (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>);
}
function BookIcon({ color = "#555" }: { color?: string }) {
  return (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>);
}
function PenIcon({ color = "#555" }: { color?: string }) {
  return (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>);
}
function MicIcon({ color = "#555" }: { color?: string }) {
  return (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" x2="12" y1="19" y2="22" /></svg>);
}
function ArrowIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
}

const iconMap: Record<string, (props: { color?: string }) => React.ReactNode> = {
  headphones: HeadphonesIcon, book: BookIcon, pen: PenIcon, mic: MicIcon,
};



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

  /* ═══════════════════════════════════════════
     LANDING PAGE (no exam selected)
     ═══════════════════════════════════════════ */
  if (!selectedExam) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
        {/* Hero */}
        <section className="bg-white border-b border-[#e5e5e5] py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-5">
                <h1 className="text-[36px] sm:text-[48px] font-extrabold text-[#000] leading-[1.1] tracking-tight">
                  Achieve Your{" "}
                  <span className="relative inline-block text-[#c8102e]">
                    Dream Score
                    <svg className="absolute left-0 -bottom-1.5 w-full h-3 text-[#c8102e]" viewBox="0 0 100 10" preserveAspectRatio="none" fill="none">
                      <path d="M3 7 C 30 3, 70 3, 97 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </span>{" "}
                  with LingoPrep
                </h1>
                <p className="text-[15px] text-[#555] leading-relaxed max-w-lg">
                  AI-powered practice tests, instant scoring, and expert feedback tailored to IELTS and TOEFL. Start preparing smarter today.
                </p>
                <a href="#choose-path" className="inline-flex items-center px-6 py-3 bg-[#c8102e] hover:bg-[#a50d24] text-white font-bold text-[14px] rounded-full transition-all shadow-sm">
                  Get Started →
                </a>
                <div className="flex items-center gap-3 pt-4">
                  <div className="flex -space-x-2">
                    <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80" alt="" />
                    <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80" alt="" />
                    <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80" alt="" />
                  </div>
                  <span className="text-[13px] font-semibold text-[#777]">Trusted by students worldwide</span>
                </div>
              </div>
              <div className="lg:col-span-5 relative">
                <div className="rounded-2xl overflow-hidden shadow-xl border border-[#e5e5e5]">
                  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=700&auto=format&fit=crop" alt="Students studying" className="w-full h-[380px] object-cover" />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#e8f5e9] flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                      </div>
                      <div><div className="text-[10px] font-bold text-[#999] uppercase tracking-wider">Target Score</div><div className="text-[15px] font-bold text-[#1a1a1a]">IELTS 8.0</div></div>
                    </div>
                    <div className="text-right border-l border-[#e5e5e5] pl-3.5">
                      <div className="text-[10px] font-bold text-[#999] uppercase tracking-wider">Probability</div>
                      <div className="text-[17px] font-extrabold text-[#2e7d32]">92%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Choose Your Path */}
        <section id="choose-path" className="py-16 bg-[#f5f5f5]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-7 bg-[#c8102e] rounded-full" />
              <h2 className="text-[28px] font-extrabold text-[#000]">Choose Your Path</h2>
            </div>
            <p className="text-[14px] text-[#777] mb-10 ml-3">Select your target examination to access tailored practice materials.</p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* IELTS Card */}
              <div className="bg-white border border-[#e5e5e5] rounded-2xl p-7 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#c8102e] flex items-center justify-center text-white font-extrabold text-[16px]">I</div>
                    <h3 className="text-[18px] font-bold text-[#000]">IELTS Preparation</h3>
                  </div>
                  <p className="text-[13px] text-[#666] leading-relaxed mb-6">Comprehensive modules for Academic and General Training. Master the 4 skills with realistic test scenarios.</p>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {["Listening","Reading","Writing","Speaking"].map(s => (
                      <div key={s} className="flex items-center gap-2 py-2 px-3 bg-[#f5f5f5] rounded-lg text-[12px] font-semibold text-[#555]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>{s}
                      </div>
                    ))}
                  </div>
                </div>
                <button id="select-ielts" onClick={() => handleSelectExam("ielts")} className="w-full py-3 bg-[#c8102e] hover:bg-[#a50d24] text-white font-bold text-[13px] rounded-full transition-colors cursor-pointer">Start IELTS Practice →</button>
              </div>

              {/* TOEFL Card */}
              <div className="bg-white border border-[#e5e5e5] rounded-2xl p-7 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#0057b8] flex items-center justify-center text-white font-extrabold text-[16px]">T</div>
                    <h3 className="text-[18px] font-bold text-[#000]">TOEFL iBT® Preparation</h3>
                  </div>
                  <p className="text-[13px] text-[#666] leading-relaxed mb-6">Integrated tasks and authentic academic content designed to boost your iBT score efficiently.</p>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {["iBT Format","Academic Focus","Integrated Tasks","Score Analysis"].map(s => (
                      <div key={s} className="flex items-center gap-2 py-2 px-3 bg-[#f5f5f5] rounded-lg text-[12px] font-semibold text-[#555]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>{s}
                      </div>
                    ))}
                  </div>
                </div>
                <button id="select-toefl" onClick={() => handleSelectExam("toefl")} className="w-full py-3 bg-[#0057b8] hover:bg-[#004494] text-white font-bold text-[13px] rounded-full transition-colors cursor-pointer">Start TOEFL Practice →</button>
              </div>
            </div>
          </div>
        </section>

      </div>
    );
  }

  /* ═══════════════════════════════════════════
     EXAM DASHBOARD (exam selected) — IDP skill cards style
     ═══════════════════════════════════════════ */
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <section className="bg-white border-b border-[#e5e5e5]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <button onClick={handleChangeExam} className="inline-flex items-center gap-1.5 text-[13px] font-bold mb-3 hover:opacity-75 transition-opacity cursor-pointer" style={{ color: config!.color }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                Change exam
              </button>
              <h1 className="text-[32px] sm:text-[40px] font-extrabold text-[#000] leading-tight mb-2">{config!.name} Practice Tests</h1>
              <p className="text-[14px] text-[#666] max-w-lg leading-relaxed">{config!.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-full text-[11px] font-extrabold text-white" style={{ backgroundColor: config!.color }}>{config!.name}</span>
              <Link href="/dashboard" className="px-4 py-1.5 border border-[#ddd] bg-white text-[#333] font-bold rounded-full hover:bg-[#fafafa] transition-colors text-[12px]">View results</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search by skill — IDP style cards */}
      <section className="py-14 flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: config!.color }} />
            <h2 className="text-[24px] font-extrabold text-[#000]">Search by {config!.name} skill</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {config!.modules.map((mod) => {
              const Icon = iconMap[mod.icon];
              return (
                <Link key={mod.title} href={mod.href} className="group bg-white border border-[#e5e5e5] rounded-xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 min-h-[200px]">
                  <div>
                    <div className="w-11 h-11 rounded-lg bg-[#f0f0f0] flex items-center justify-center mb-5">
                      {Icon && <Icon />}
                    </div>
                    <h3 className="text-[16px] font-bold text-[#000] mb-1.5">{mod.title}</h3>
                    <p className="text-[13px] text-[#777] leading-relaxed">{mod.desc}</p>
                  </div>
                  <div className="flex justify-end mt-5">
                    <div className="w-9 h-9 rounded-full border border-[#e0e0e0] flex items-center justify-center text-[#999] group-hover:text-white group-hover:border-transparent transition-all" style={{ ['--tw-group-hover-bg' as string]: config!.color }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = config!.color; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#999'; }}>
                      <ArrowIcon />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
