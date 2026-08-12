"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";

interface Option {
  id: string;
  text: string;
  label: string;
}

interface Question {
  id: string;
  question_text: string;
  options: Option[];
  correct_option_id: string;
  explanation?: string;
  sort_order: number;
}

interface Passage {
  id: string;
  title: string;
  content: string;
  word_count: number;
  difficulty: string;
  exam_type: string;
  questions: Question[];
}

const examColors: Record<string, { color: string; colorDark: string; colorLight: string; name: string }> = {
  ielts: { color: "#c8102e", colorDark: "#a50d24", colorLight: "#fef2f2", name: "IELTS" },
  toefl: { color: "#0057b8", colorDark: "#004494", colorLight: "#eff6ff", name: "TOEFL" },
};

export default function ReadingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const examType = searchParams.get("exam") === "toefl" ? "toefl" : "ielts";
  const theme = examColors[examType];

  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flow control
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Results from backend
  const [bandScore, setBandScore] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState<number | null>(null);
  const [scorePercentage, setScorePercentage] = useState<number | null>(null);
  const [dbResults, setDbResults] = useState<any[] | null>(null);

  // Timer: 60 minutes for IELTS
  const [timeLeft, setTimeLeft] = useState(3600);
  
  // Refs for scrolling to specific questions
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    async function fetchPassages() {
      try {
        setLoading(true);
        const response = await api.get(`/api/reading/passages?exam_type=${examType}`);
        const data = response.data?.data || [];
        if (data.length > 0) {
          // Sort passages by ID to ensure Section 1, 2, 3 ordering
          const sorted = [...data].sort((a, b) => a.id.localeCompare(b.id));
          setPassages(sorted);
        } else {
          setError(`No ${theme.name} reading passages available in the database.`);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load test content. Please verify that database is seeded and backend is running.");
      } finally {
        setLoading(false);
      }
    }
    fetchPassages();
  }, [examType, theme.name]);

  // Timer Effect
  useEffect(() => {
    if (!isTestStarted || submitted || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTestStarted, submitted, timeLeft]);

  // Helper: flatten all questions across passages
  const allQuestions = passages.reduce<Question[]>((acc, p) => {
    return [...acc, ...p.questions];
  }, []);

  // Handle option click
  const handleSelect = (qId: string, oId: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: oId }));
  };

  // Submit flow
  const handleSubmit = async (force: boolean = false) => {
    if (passages.length === 0 || submitted) return;

    if (!force) {
      const unansweredCount = allQuestions.length - Object.keys(selectedAnswers).length;
      if (unansweredCount > 0) {
        setShowConfirmModal(true);
        return;
      }
    }

    try {
      setLoading(true);
      const answersPayload = allQuestions.map((q) => ({
        question_id: q.id,
        selected_option_id: selectedAnswers[q.id] || "",
      }));

      const res = await api.post("/api/reading/submit-full", {
        answers: answersPayload,
      });

      setCorrectCount(res.data.correct_answers);
      setScorePercentage(res.data.score_percentage);
      setBandScore(res.data.band_score);
      setDbResults(res.data.results);
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to submit answers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const autoSubmit = () => {
    handleSubmit(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScorePercentage(null);
    setCorrectCount(null);
    setBandScore(null);
    setDbResults(null);
    setTimeLeft(3600);
    setIsTestStarted(false);
    setActiveSectionIdx(0);
  };

  // Question Navigator click: jump to section and scroll to question
  const handleNavClick = (qIndex: number) => {
    let questionCount = 0;
    for (let pIdx = 0; pIdx < passages.length; pIdx++) {
      const pQuestions = passages[pIdx].questions;
      if (qIndex >= questionCount && qIndex < questionCount + pQuestions.length) {
        setActiveSectionIdx(pIdx);
        const qId = pQuestions[qIndex - questionCount].id;
        setTimeout(() => {
          const el = questionRefs.current[qId];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
        break;
      }
      questionCount += pQuestions.length;
    }
  };

  // Get question number in the overall test (1-40)
  const getOverallQuestionNumber = (qId: string) => {
    return allQuestions.findIndex((q) => q.id === qId) + 1;
  };

  if (loading && passages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] flex-col gap-3">
        <div
          className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${theme.color} transparent transparent transparent` }}
        />
        <p className="text-[14px] text-slate-500 font-medium">Loading {theme.name} reading exam content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c8102e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="text-[16px] font-bold text-slate-800 mb-2">Error Loading Test</h2>
        <p className="text-[13px] text-slate-500 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 text-white font-semibold text-[13px] rounded-full transition-all shadow-sm"
          style={{ backgroundColor: theme.color }}
        >
          Retry Load
        </button>
      </div>
    );
  }

  // 1. Welcome / Instructions Screen
  if (!isTestStarted && !submitted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="bg-white border border-[#e0e0e0] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-10 border-b border-[#f0f0f0]" style={{ backgroundColor: theme.colorLight }}>
            <span className="px-3 py-1 text-[11px] font-extrabold uppercase rounded-full text-white tracking-wider" style={{ backgroundColor: theme.color }}>
              {theme.name} Academic
            </span>
            <h1 className="text-[26px] sm:text-[32px] font-bold text-slate-900 mt-3">Full Reading Exam</h1>
            <p className="text-[14px] text-slate-600 mt-1">Realistic 3-section, 40-question academic practice environment</p>
          </div>

          <div className="p-6 sm:p-10 space-y-6">
            <div>
              <h2 className="text-[16px] font-bold text-slate-800 mb-3">Exam Structure & Timing</h2>
              <ul className="space-y-3 text-[14px] text-slate-600">
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span><strong>Total Duration:</strong> 60 minutes exactly. The timer will auto-submit when it reaches 0.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span><strong>Sections:</strong> 3 distinct reading passages, each increasing in academic complexity.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span><strong>Questions:</strong> 40 multiple-choice questions total. Mark answers directly in the panel.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span><strong>Navigation:</strong> Free movement between sections using tabs or the 1-40 layout grid.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-[13px] text-slate-500 leading-relaxed">
              <strong>Instructions:</strong> Ensure you are in a quiet workspace. Once you click "Start Exam", the countdown begins and cannot be paused. Read the texts and answer the questions. Good luck!
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => router.push("/")}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-[13px] rounded-full hover:bg-slate-50 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => setIsTestStarted(true)}
                className="px-6 py-2.5 text-white font-semibold text-[13px] rounded-full hover:shadow transition-all"
                style={{ backgroundColor: theme.color }}
              >
                Start Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Results Screen
  if (submitted) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Results Header Card */}
        <div className="bg-white border border-[#e0e0e0] rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 sm:p-10 text-center border-b border-[#f0f0f0]">
            <span className="px-3 py-1 text-[11px] font-extrabold uppercase rounded-full text-white tracking-wider" style={{ backgroundColor: theme.color }}>
              Test Completed
            </span>
            <h1 className="text-[28px] font-bold text-slate-900 mt-4">Your Reading Score Report</h1>
            <p className="text-[13px] text-[#999] mt-1">Official IELTS Academic Reading Criteria</p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-16 my-8">
              {/* Band Score Circle */}
              <div className="relative w-36 h-36 flex flex-col items-center justify-center rounded-full border-8 bg-slate-50" style={{ borderColor: theme.colorLight }}>
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">IELTS Band</span>
                <span className="text-[42px] font-extrabold text-slate-900 leading-none mt-1">{bandScore !== null ? bandScore.toFixed(1) : "0.0"}</span>
              </div>

              {/* Statistics */}
              <div className="text-left space-y-2">
                <div className="flex items-center gap-8">
                  <span className="text-[14px] text-slate-500 font-medium">Raw Score:</span>
                  <span className="text-[16px] font-bold text-slate-800">{correctCount} / {allQuestions.length} correct</span>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-[14px] text-slate-500 font-medium">Percentage:</span>
                  <span className="text-[16px] font-bold text-slate-800">{scorePercentage}%</span>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-[14px] text-slate-500 font-medium">Time Remaining:</span>
                  <span className="text-[16px] font-bold text-slate-800">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 font-bold text-[13px] rounded-full hover:bg-slate-50 transition-colors"
              >
                Restart Test
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2.5 text-white font-bold text-[13px] rounded-full transition-all shadow-sm"
                style={{ backgroundColor: theme.color }}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Review Section */}
        <h2 className="text-[20px] font-bold text-slate-800 mb-4">Detailed Answers Review</h2>
        <div className="border border-[#e0e0e0] rounded-2xl bg-white p-4 sm:p-6 mb-6">
          {/* Section Selector for Review */}
          <div className="flex gap-2 border-b border-[#f0f0f0] pb-4 mb-6 overflow-x-auto">
            {passages.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setActiveSectionIdx(idx)}
                className={`px-4 py-2 text-[13px] font-bold rounded-lg transition-colors whitespace-nowrap ${
                  activeSectionIdx === idx
                    ? "text-white"
                    : "bg-[#f5f5f5] text-slate-700 hover:bg-[#eee]"
                }`}
                style={activeSectionIdx === idx ? { backgroundColor: theme.color } : undefined}
              >
                Section {idx + 1}: {p.title.length > 25 ? `${p.title.substring(0, 25)}...` : p.title}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Passage Text */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-h-[600px] overflow-y-auto">
              <h3 className="text-[18px] font-bold mb-4" style={{ color: theme.color }}>
                Section {activeSectionIdx + 1}: {passages[activeSectionIdx].title}
              </h3>
              <div className="text-[14px] text-slate-700 leading-[1.8] space-y-4 font-medium">
                {passages[activeSectionIdx].content.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {/* Questions Review */}
            <div className="space-y-6">
              {passages[activeSectionIdx].questions.map((q) => {
                const dbRes = dbResults?.find((r) => r.question_id === q.id);
                const isCorrect = dbRes?.is_correct;
                const userSel = selectedAnswers[q.id];
                const overallNum = getOverallQuestionNumber(q.id);

                return (
                  <div
                    key={q.id}
                    className={`border rounded-xl p-5 ${
                      isCorrect ? "border-[#2e7d32] bg-[#f8fdf9]" : "border-[#c8102e] bg-[#fffdfd]"
                    }`}
                  >
                    <p className="text-[14px] font-bold text-slate-800 mb-4 flex items-start">
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[12px] font-extrabold mr-2 flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: theme.color }}
                      >
                        {overallNum}
                      </span>
                      {q.question_text}
                    </p>

                    <div className="space-y-2.5 pl-8">
                      {q.options.map((opt) => {
                        const isUserSelected = userSel === opt.id;
                        const isCorrectOption = opt.id === q.correct_option_id;

                        let optionStyle = "border-slate-200 hover:bg-[#fafafa] text-slate-600";
                        if (isCorrectOption) {
                          optionStyle = "bg-[#e8f5e9] text-[#2e7d32] font-semibold border-[#a5d6a7]";
                        } else if (isUserSelected && !isCorrect) {
                          optionStyle = "bg-[#fce4ec] text-[#c8102e] font-semibold border-[#f8bbd0]";
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`flex items-center gap-3 py-2.5 px-3 border rounded-lg text-[13px] ${optionStyle}`}
                          >
                            <span className="font-bold text-[#888]">{opt.label}.</span>
                            <span>{opt.text}</span>
                            {isCorrectOption && <span className="ml-auto text-[11px] font-bold text-[#2e7d32] uppercase">Correct</span>}
                            {isUserSelected && !isCorrect && <span className="ml-auto text-[11px] font-bold text-[#c8102e] uppercase">Your Choice</span>}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-4 ml-8 p-3 bg-white border-l-4 border-emerald-500 rounded-r-lg text-[13px] text-slate-600">
                        <strong className="text-emerald-700">Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Test Screen
  const currentPassage = passages[activeSectionIdx];
  const totalPassages = passages.length;
  const qStart = getOverallQuestionNumber(currentPassage.questions[0].id);
  const qEnd   = getOverallQuestionNumber(currentPassage.questions[currentPassage.questions.length - 1].id);

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col">

      {/* TOP BAR */}
      <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-[17px] font-extrabold tracking-tight" style={{ color: theme.color }}>
            LingoPrep
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-[14px] font-semibold text-slate-600">
            {theme.name} Reading Practice Test
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200 p-1 rounded-xl">
            {passages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSectionIdx(idx)}
                className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all ${
                  activeSectionIdx === idx
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Passage {idx + 1}
              </button>
            ))}
          </div>

          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono font-bold text-[13px] transition-all ${
              timeLeft < 300
                ? "bg-red-50 text-[#c8102e] border-red-200 animate-pulse"
                : "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => handleSubmit(false)}
            className="px-5 py-2 text-white font-bold text-[13px] rounded-lg transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: theme.color }}
          >
            Finish Test
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE (Split Screen) */}
      <div className="flex-1 grid lg:grid-cols-12 gap-0 overflow-hidden">
        
        {/* Left Side: Scrollable Passage */}
        <div className="lg:col-span-7 bg-white border-r border-slate-200 p-8 overflow-y-auto max-h-[calc(100vh-115px)]">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 font-extrabold rounded-full text-[10.5px] uppercase tracking-wider">
                Passage {activeSectionIdx + 1} of {totalPassages}
              </span>
              <span className="text-[12px] font-semibold text-slate-400">Questions {qStart}-{qEnd}</span>
            </div>

            <h2 className="text-[23px] font-extrabold text-slate-900 leading-tight">
              {currentPassage.title}
            </h2>

            <div className="text-[15px] text-slate-800 leading-[1.85] space-y-5 font-normal">
              {currentPassage.content.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Scrollable Questions */}
        <div className="lg:col-span-5 bg-[#f8f9fb] p-8 overflow-y-auto max-h-[calc(100vh-115px)] space-y-4 pb-28">
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4">
            <p className="text-[13.5px] font-bold text-amber-900 mb-0.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Questions {qStart}-{qEnd}</span>
            </p>
            <p className="text-[12.5px] text-amber-800/90">
              Read Passage {activeSectionIdx + 1} and choose the correct option (A, B, C, or D) for each question below.
            </p>
          </div>

          {currentPassage.questions.map((q) => {
            const overallNum = getOverallQuestionNumber(q.id);
            const userSelectedOpt = selectedAnswers[q.id];

            return (
              <div
                key={q.id}
                ref={(el) => {
                  questionRefs.current[q.id] = el;
                }}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
                  userSelectedOpt ? "border-slate-300" : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[12px] font-extrabold flex-shrink-0"
                    style={{ backgroundColor: theme.color }}
                  >
                    {overallNum}
                  </span>
                  <p className="text-[14.5px] font-semibold text-slate-900 leading-snug pt-0.5">
                    {q.question_text}
                  </p>
                </div>

                <div className="space-y-2 pl-10">
                  {q.options.map((opt) => {
                    const isSelected = userSelectedOpt === opt.id;

                    return (
                      <label
                        key={opt.id}
                        onClick={() => handleSelect(q.id, opt.id)}
                        className={`flex items-center gap-3 py-2.5 px-4 rounded-xl border cursor-pointer text-[13.5px] transition-all select-none ${
                          isSelected
                            ? "font-semibold border-transparent shadow-sm"
                            : "border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700"
                        }`}
                        style={
                          isSelected
                            ? { backgroundColor: theme.colorLight, borderColor: theme.color, color: theme.color }
                            : undefined
                        }
                      >
                        <span
                          className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                          style={isSelected ? { borderColor: theme.color } : { borderColor: "#CBD5E1" }}
                        >
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.color }} />
                          )}
                        </span>
                        <span className="font-bold w-4 text-slate-400">{opt.label}.</span>
                        <span className="flex-1">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM NAVIGATOR BAR  matching mock layout */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30">
        <div className="px-8 py-3 flex items-center justify-between gap-4">
          {/* Question Number Scroll Row */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider whitespace-nowrap mr-1">
              Questions:
            </span>
            <div className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {allQuestions.map((q, idx) => {
                const hasAnswer = !!selectedAnswers[q.id];
                const isCurrentPassage = currentPassage.questions.some((pq) => pq.id === q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => handleNavClick(idx)}
                    className={`w-7 h-7 flex-shrink-0 rounded-md text-[11px] font-bold transition-all border ${
                      hasAnswer
                        ? "text-white border-transparent"
                        : isCurrentPassage
                        ? "bg-white border-2"
                        : "bg-slate-100 text-slate-500 border-slate-200 opacity-60"
                    }`}
                    style={
                      hasAnswer
                        ? { backgroundColor: theme.color }
                        : isCurrentPassage
                        ? { borderColor: theme.color, color: theme.color }
                        : undefined
                    }
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              disabled={activeSectionIdx === 0}
              onClick={() => setActiveSectionIdx((prev) => prev - 1)}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-[12.5px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              Previous Passage
            </button>
            <button
              disabled={activeSectionIdx === passages.length - 1}
              onClick={() => setActiveSectionIdx((prev) => prev + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#1e293b" }}
            >
              Next Passage
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            {activeSectionIdx === passages.length - 1 && (
              <button
                onClick={() => handleSubmit(false)}
                className="px-5 py-2 text-white font-bold text-[12.5px] rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: theme.color }}
              >
                Finish Test
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-7">
            <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-[17px] font-bold text-slate-900 mb-2 text-center">Submit Exam?</h3>
            <p className="text-[13px] text-slate-500 mb-6 leading-relaxed text-center">
              You have {allQuestions.length - Object.keys(selectedAnswers).length} unanswered questions.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-bold text-[13px] rounded-lg hover:bg-slate-50 transition-colors"
              >
                Keep Working
              </button>
              <button
                onClick={() => { setShowConfirmModal(false); handleSubmit(true); }}
                className="flex-1 px-4 py-2.5 text-white font-bold text-[13px] rounded-lg transition-all"
                style={{ backgroundColor: theme.color }}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
