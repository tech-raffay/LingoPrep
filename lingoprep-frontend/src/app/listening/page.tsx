"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useExam } from "@/components/theme/ExamThemeProvider";

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

interface AudioExercise {
  id: string;
  title: string;
  audio_url: string;
  duration_seconds: number;
  transcript?: string;
  difficulty: string;
  exam_type: string;
  questions: Question[];
}


export default function ListeningPage() {
  const router = useRouter();
  // Exam theme comes from the shared provider (src/lib/exam.ts), never a
  // local copy — see brand book §07: one accent token, set in one place.
  const { exam: examType, theme: examTheme } = useExam();
  const theme = {
    color: examTheme.accent,
    colorDark: examTheme.accentStrong,
    colorLight: examTheme.accentTint,
    name: examTheme.name,
  };

  const [exercises, setExercises] = useState<AudioExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flow control
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Review screen state
  const [isReviewPeriod, setIsReviewPeriod] = useState(false);
  const [reviewTimeLeft, setReviewTimeLeft] = useState(120); // 2 minutes in seconds

  // Speech synthesis states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechProgress, setSpeechProgress] = useState(0);
  const [playedSections, setPlayedSections] = useState<Record<number, boolean>>({});

  // Results from backend
  const [bandScore, setBandScore] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState<number | null>(null);
  const [scorePercentage, setScorePercentage] = useState<number | null>(null);
  const [dbResults, setDbResults] = useState<any[] | null>(null);

  // Show transcripts in review mode
  const [showTranscript, setShowTranscript] = useState<Record<number, boolean>>({});
  
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    async function fetchAudios() {
      try {
        setLoading(true);
        const response = await api.get(`/api/listening/audios?exam_type=${examType}`);
        const data = response.data?.data || [];
        if (data.length > 0) {
          // Sort by ID to ensure Section 1, 2, 3, 4 ordering
          const sorted = [...data].sort((a, b) => a.id.localeCompare(b.id));
          setExercises(sorted);
        } else {
          setError(`No ${theme.name} listening exercises found in the database.`);
        }
      } catch (err) {
        console.error("Fetch listening exercises error:", err);
        setError("Failed to load test content. Please verify database seeding and backend status.");
      } finally {
        setLoading(false);
      }
    }
    fetchAudios();
  }, [examType, theme.name]);

  // Review period timer countdown
  useEffect(() => {
    if (!isReviewPeriod || submitted || reviewTimeLeft <= 0) return;

    const interval = setInterval(() => {
      setReviewTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isReviewPeriod, submitted, reviewTimeLeft]);

  // Speech Progress boundary handler
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const startSpeaking = () => {
    const transcript = exercises[activeSectionIdx]?.transcript;
    if (!transcript) return;

    // Reset synthesis queue
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(transcript);
    currentUtteranceRef.current = utterance;
    
    // Choose a standard voice if possible
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.name.includes("Google US English") || v.name.includes("Natural") || v.lang.startsWith("en")
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.rate = 0.95; // Slightly slower, clear exam-like speech

    utterance.onstart = () => {
      setIsSpeaking(true);
      setPlayedSections((prev) => ({ ...prev, [activeSectionIdx]: true }));
    };

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        const progress = Math.min((event.charIndex / transcript.length) * 100, 100);
        setSpeechProgress(progress);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeechProgress(100);
      
      // Auto-advance to the next section or review period
      setTimeout(() => {
        if (activeSectionIdx < exercises.length - 1) {
          setActiveSectionIdx((prev) => prev + 1);
          setSpeechProgress(0);
        } else {
          setIsReviewPeriod(true);
        }
      }, 3000);
    };

    utterance.onerror = (err) => {
      console.error("Speech synthesis error:", err);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const togglePlay = () => {
    if (isSpeaking) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsSpeaking(true);
      } else {
        // Can only play the recording once!
        if (playedSections[activeSectionIdx]) {
          return;
        }
        startSpeaking();
      }
    }
  };

  // Helper: flatten all questions
  const allQuestions = exercises.reduce<Question[]>((acc, ex) => {
    return [...acc, ...ex.questions];
  }, []);

  const handleSelect = (qId: string, oId: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: oId }));
  };

  const handleSubmit = async (force: boolean = false) => {
    if (exercises.length === 0 || submitted) return;

    if (!force) {
      const unanswered = allQuestions.length - Object.keys(selectedAnswers).length;
      if (unanswered > 0) {
        setShowConfirmModal(true);
        return;
      }
    }

    // Stop speaking
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      setLoading(true);
      const answersPayload = allQuestions.map((q) => ({
        question_id: q.id,
        selected_option_id: selectedAnswers[q.id] || "",
      }));

      const res = await api.post("/api/listening/submit-full", {
        answers: answersPayload,
        exam_type: examType,
      });

      setCorrectCount(res.data.correct_answers);
      setScorePercentage(res.data.score_percentage);
      setBandScore(res.data.band_score);
      setDbResults(res.data.results);
      setSubmitted(true);
      setIsReviewPeriod(false);
    } catch (err) {
      console.error("Listening submission error:", err);
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
    setIsReviewPeriod(false);
    setReviewTimeLeft(120);
    setPlayedSections({});
    setSpeechProgress(0);
    setIsTestStarted(false);
    setActiveSectionIdx(0);
    window.speechSynthesis.cancel();
  };

  const handleNavClick = (qIndex: number) => {
    let questionCount = 0;
    for (let eIdx = 0; eIdx < exercises.length; eIdx++) {
      const exQuestions = exercises[eIdx].questions;
      if (qIndex >= questionCount && qIndex < questionCount + exQuestions.length) {
        setActiveSectionIdx(eIdx);
        const qId = exQuestions[qIndex - questionCount].id;
        setTimeout(() => {
          const el = questionRefs.current[qId];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
        break;
      }
      questionCount += exQuestions.length;
    }
  };

  const getOverallQuestionNumber = (qId: string) => {
    return allQuestions.findIndex((q) => q.id === qId) + 1;
  };

  if (loading && exercises.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] flex-col gap-3">
        <div
          className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${theme.color} transparent transparent transparent` }}
        />
        <p className="text-[14px] text-slate-500 font-medium">Loading {theme.name} listening exam content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <h1 className="text-[26px] sm:text-[32px] font-bold text-slate-900 mt-3">{theme.name} Listening Test</h1>
            <p className="text-[14px] text-slate-600 mt-1">
              {examType === "toefl" ? "1 Conversation + 2 Academic Lectures · 17 Questions" : "4 sections · 40-question listening practice simulation"}
            </p>
          </div>

          <div className="p-6 sm:p-10 space-y-6">
            <div>
              <h2 className="text-[16px] font-bold text-slate-800 mb-3">Exam Structure & Audio rules</h2>
              <ul className="space-y-3 text-[14px] text-slate-600">
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span><strong>Audio Playback:</strong> Each recording is played exactly ONCE. Playback cannot be restarted once completed.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span><strong>Sections:</strong> 4 distinct conversational and academic listening modules (40 questions total).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span><strong>Review Period:</strong> A 2-minute review countdown begins automatically after all audios complete.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span><strong>Native Voice Output:</strong> Audio utilizes the browser Speech Synthesis engine. Make sure audio output is unmuted.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-[13px] text-slate-500 leading-relaxed">
              <strong>Instructions:</strong> Ensure your speakers/headphones are connected and set to a comfortable volume. Once you press "Start Exam", the audio player interface will load.
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => router.push("/")}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold text-[13px] rounded-full hover:bg-slate-50 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  setIsTestStarted(true);
                  // Trigger voices pre-loading for browser speech synthesis
                  window.speechSynthesis.getVoices();
                }}
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
            <h1 className="text-[28px] font-bold text-slate-900 mt-4">Your Listening Score Report</h1>
            <p className="text-[13px] text-[#999] mt-1">{examType === "toefl" ? "TOEFL iBT Listening, scored 0 to 30" : "Scored on the IELTS Listening band scale"}</p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-16 my-8">
              {/* Score Circle */}
              <div className="relative w-36 h-36 flex flex-col items-center justify-center rounded-full border-8 bg-slate-50" style={{ borderColor: theme.colorLight }}>
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">{examType === "toefl" ? "TOEFL" : "IELTS Band"}</span>
                <span className="text-[42px] font-extrabold text-slate-900 leading-none mt-1">{bandScore !== null ? (examType === "toefl" ? bandScore.toFixed(0) : bandScore.toFixed(1)) : "0"}</span>
                {examType === "toefl" && <span className="text-[11px] text-slate-400 font-semibold">out of 30</span>}
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

        {/* Detailed Question Review & Audio Transcripts */}
        <h2 className="text-[20px] font-bold text-slate-800 mb-4">Detailed Review & Section Transcripts</h2>
        <div className="border border-[#e0e0e0] rounded-2xl bg-white p-4 sm:p-6 mb-6">
          <div className="flex gap-2 border-b border-[#f0f0f0] pb-4 mb-6 overflow-x-auto">
            {exercises.map((ex, idx) => (
              <button
                key={ex.id}
                onClick={() => setActiveSectionIdx(idx)}
                className={`px-4 py-2 text-[13px] font-bold rounded-lg transition-colors whitespace-nowrap ${
                  activeSectionIdx === idx
                    ? "text-white"
                    : "bg-[#f5f5f5] text-slate-700 hover:bg-[#eee]"
                }`}
                style={activeSectionIdx === idx ? { backgroundColor: theme.color } : undefined}
              >
                Section {idx + 1}: {ex.title}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Transcript & Learning Support */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold text-slate-800">Learning Materials</h3>
                <button
                  onClick={() => setShowTranscript((prev) => ({ ...prev, [activeSectionIdx]: !prev[activeSectionIdx] }))}
                  className="text-[12px] font-bold hover:underline"
                  style={{ color: theme.color }}
                >
                  {showTranscript[activeSectionIdx] ? "Hide Transcript" : "Show Transcript"}
                </button>
              </div>

              {showTranscript[activeSectionIdx] && exercises[activeSectionIdx].transcript ? (
                <div className="p-4 rounded-lg bg-white border border-slate-200 text-[13px] leading-[1.8] text-slate-700 whitespace-pre-line font-medium max-h-[400px] overflow-y-auto">
                  {exercises[activeSectionIdx].transcript}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-[13px]">
                  <p>Click "Show Transcript" to read full conversation dialogues and see explanations.</p>
                </div>
              )}
            </div>

            {/* Questions Correction Review */}
            <div className="lg:col-span-7 space-y-6">
              {exercises[activeSectionIdx].questions.map((q) => {
                const dbRes = dbResults?.find((r) => r.question_id === q.id);
                const isCorrect = dbRes?.is_correct;
                const userSel = selectedAnswers[q.id];
                const overallNum = getOverallQuestionNumber(q.id);

                return (
                  <div
                    key={q.id}
                    className={`border rounded-xl p-5 ${
                      isCorrect
                        ? "border-[var(--success)] bg-[var(--success-tint)]"
                        : "border-[var(--error)] bg-[var(--error-tint)]"
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
                          optionStyle = "bg-[var(--success-tint)] text-[var(--success)] font-bold border-[var(--success)]";
                        } else if (isUserSelected && !isCorrect) {
                          optionStyle = "bg-[var(--error-tint)] text-[var(--error)] font-bold border-[var(--error)]";
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`flex items-center gap-3 py-2.5 px-3 border rounded-lg text-[13px] ${optionStyle}`}
                          >
                            <span className="font-bold text-[#888]">{opt.label}.</span>
                            <span>{opt.text}</span>
                            {isCorrectOption && <span className="ml-auto text-[11px] font-bold text-[var(--success)] uppercase tracking-[.12em]">Correct</span>}
                            {isUserSelected && !isCorrect && <span className="ml-auto text-[11px] font-bold text-[var(--error)] uppercase tracking-[.12em]">Your answer</span>}
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
  const currentExercise = exercises[activeSectionIdx];
  const totalSections = exercises.length;
  const qStart = getOverallQuestionNumber(currentExercise.questions[0].id);
  const qEnd   = getOverallQuestionNumber(currentExercise.questions[currentExercise.questions.length - 1].id);

  // Clean section cards - gradient bg + SVG icon
  const sectionCards = [
    {
      bg: "var(--n-100)", color: "var(--n-600)", label: "Telephone Conversation",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--n-600)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 010.07 2.18 2 2 0 012.07.07h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.29 6.29l.41-1.21a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
        </svg>
      )
    },
    {
      bg: "#F0FDF4", color: "#22C55E", label: "Training / Social Context",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      )
    },
    {
      bg: "#FFF7ED", color: "#F97316", label: "General Training Monologue",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      bg: "#F5F3FF", color: "#8B5CF6", label: "Academic Lecture",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      )
    },
  ];
  const toeflSectionCards = [
    {
      bg: "var(--n-100)", color: "var(--n-600)", label: "Campus Conversation",
      svg: (<svg viewBox="0 0 24 24" fill="none" stroke="var(--n-600)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 010.07 2.18 2 2 0 012.07.07h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.29 6.29l.41-1.21a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>)
    },
    {
      bg: "#F5F3FF", color: "#8B5CF6", label: "Academic Lecture 1",
      svg: (<svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>)
    },
    {
      bg: "#FFF7ED", color: "#F97316", label: "Academic Lecture 2",
      svg: (<svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>)
    },
  ];
  const card = examType === "toefl"
    ? (toeflSectionCards[activeSectionIdx] ?? toeflSectionCards[0])
    : (sectionCards[activeSectionIdx] ?? sectionCards[0]);

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col">

      {/* TOP BAR */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[15px] sm:text-[17px] font-extrabold tracking-tight flex-shrink-0" style={{ color: theme.color }}>LingoPrep</span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-[12px] sm:text-[14px] font-semibold text-slate-600 hidden sm:inline truncate">{theme.name} Listening Test</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isReviewPeriod && (
            <div className="flex items-center gap-1.5 text-[13px] font-mono font-bold text-[var(--error)] bg-[var(--error-tint)] border border-[var(--error)] px-3 py-1.5 rounded-lg">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {formatTime(reviewTimeLeft)}
            </div>
          )}
          <button onClick={() => handleSubmit(false)}
            className="px-3 sm:px-5 py-2 text-white font-bold text-[12px] sm:text-[13px] rounded-lg transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: theme.color }}
          >Finish</button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* LEFT PANEL */}
        <div className="md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col gap-4 p-4 md:p-5 overflow-y-auto md:flex-shrink-0">

          {/* Section visual card */}
          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <div
              className="h-32 flex flex-col items-center justify-center gap-2"
              style={{ backgroundColor: card.bg }}
            >
              {card.svg}
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
            </div>
            <div className="px-4 py-2.5 bg-white border-t border-slate-100 text-center">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                Part {activeSectionIdx + 1}: Questions {qStart}-{qEnd}
              </p>
            </div>
          </div>

          {/* Section info row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] font-bold text-slate-800">Section {activeSectionIdx + 1}</p>
              <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">{currentExercise.title}</p>
            </div>
            <span
              className="px-2.5 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider text-white flex-shrink-0"
              style={{ backgroundColor: theme.color }}
            >
              Q {qStart}-{qEnd}
            </span>
          </div>

          {/* Audio player */}
          {isReviewPeriod ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p className="text-[13px] font-bold text-emerald-800">All Recordings Complete</p>
              <p className="text-[11.5px] text-emerald-600">Review your answers before submitting.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              {/* Waveform bars */}
              <div className="flex justify-center items-end gap-1 h-8">
                {[5,12,8,18,10,22,16,26,14,20,9,16,7].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full"
                    style={{
                      height: isSpeaking ? `${h}px` : "3px",
                      backgroundColor: isSpeaking ? theme.color : "#CBD5E1",
                      transition: "height 0.2s ease",
                    }}
                  />
                ))}
              </div>
              {/* Play + progress */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-white flex-shrink-0 transition-all hover:scale-105 active:scale-95 shadow"
                  style={{
                    backgroundColor: playedSections[activeSectionIdx] && !isSpeaking ? "#94a3b8" : theme.color,
                    cursor: playedSections[activeSectionIdx] && !isSpeaking ? "not-allowed" : "pointer"
                  }}
                >
                  {isSpeaking ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="5" y="4" width="4" height="16" rx="1"/>
                      <rect x="15" y="4" width="4" height="16" rx="1"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-600">{isSpeaking ? "Listening..." : speechProgress === 100 ? "Completed" : "Ready to play"}</span>
                    <span className="text-slate-400 font-mono">{Math.round(speechProgress)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${speechProgress}%`, backgroundColor: theme.color }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[13px] font-bold text-slate-800 mb-2">Instructions</p>
            <p className="text-[12.5px] text-slate-600 leading-relaxed">
              {currentExercise.transcript
                ? currentExercise.transcript.slice(0, 180).trim() + "..."
                : "You will hear a recording for this section. Answer the questions as you listen."}
            </p>
            {!isReviewPeriod && (
              <p className="text-[12px] font-bold mt-3" style={{ color: theme.color }}>
                Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.
              </p>
            )}
          </div>

          {/* Section pills */}
          <div className="flex gap-2 flex-wrap">
            {exercises.map((_, idx) => (
              <button
                key={idx}
                disabled={!isReviewPeriod && idx !== activeSectionIdx}
                onClick={() => setActiveSectionIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  activeSectionIdx === idx
                    ? "text-white border-transparent"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                style={activeSectionIdx === idx ? { backgroundColor: theme.color } : undefined}
              >
                Section {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - Questions */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
          <div className="mb-4">
            <h2 className="text-[18px] font-bold text-slate-900">{currentExercise.title}</h2>
            <p className="text-[13px] text-slate-500 mt-1">
              Questions {qStart}-{qEnd} - Choose the correct letter A, B, C or D.
            </p>
          </div>

          {currentExercise.questions.map((q) => {
            const overallNum = getOverallQuestionNumber(q.id);
            const userSelectedOpt = selectedAnswers[q.id];

            return (
              <div
                key={q.id}
                ref={(el) => { questionRefs.current[q.id] = el; }}
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
                        style={isSelected ? { backgroundColor: theme.colorLight, borderColor: theme.color, color: theme.color } : undefined}
                      >
                        <span
                          className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                          style={isSelected ? { borderColor: theme.color } : { borderColor: "#CBD5E1" }}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.color }}/>}
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

          {/* Clean Inline Navigation Bar below questions */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-3 mt-6">
            <button
              disabled={activeSectionIdx === 0}
              onClick={() => setActiveSectionIdx((p) => p - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              <span>Previous Section</span>
            </button>

            {activeSectionIdx < totalSections - 1 ? (
              <button
                onClick={() => {
                  if (!isReviewPeriod) window.speechSynthesis.cancel();
                  setActiveSectionIdx((p) => p + 1);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all shadow-sm hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#1e293b" }}
              >
                <span>Next Section</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                className="flex items-center gap-1.5 px-6 py-2.5 text-white font-bold text-[13px] rounded-xl transition-all shadow-sm hover:opacity-90 active:scale-95"
                style={{ backgroundColor: theme.color }}
              >
                <span>Finish Test</span>
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
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
