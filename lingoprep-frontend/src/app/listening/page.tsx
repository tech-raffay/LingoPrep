"use client";

import { useState, useRef, useEffect } from "react";
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

const examColors: Record<string, { color: string; colorDark: string; colorLight: string; name: string }> = {
  ielts: { color: "#c8102e", colorDark: "#a50d24", colorLight: "#fef2f2", name: "IELTS" },
  toefl: { color: "#0057b8", colorDark: "#004494", colorLight: "#eff6ff", name: "TOEFL" },
};

export default function ListeningPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const examType = searchParams.get("exam") === "toefl" ? "toefl" : "ielts";
  const theme = examColors[examType];

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
            <h1 className="text-[26px] sm:text-[32px] font-bold text-slate-900 mt-3">Full Listening Exam</h1>
            <p className="text-[14px] text-slate-600 mt-1">Realistic 4-section, 40-question listening practice simulation</p>
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
            <p className="text-[13px] text-[#999] mt-1">Official IELTS Listening Band Scaling</p>

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
  const currentExercise = exercises[activeSectionIdx];
  const totalSections = exercises.length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-32">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#e0e0e0]">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 flex items-center gap-2.5">
            {theme.name} Academic Listening Test
          </h1>
          <p className="text-[13px] text-slate-500 font-semibold mt-0.5">
            {isReviewPeriod ? "Review Period" : `Section ${activeSectionIdx + 1}: ${currentExercise.title}`}
          </p>
        </div>

        <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-start">
          {/* Section Indicator Tabs (Disabled switching during recording unless in review period) */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {exercises.map((_, idx) => (
              <button
                key={idx}
                disabled={!isReviewPeriod}
                onClick={() => setActiveSectionIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-extrabold transition-all ${
                  activeSectionIdx === idx
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                Sec {idx + 1}
              </button>
            ))}
          </div>

          {/* Review Countdown Timer (Only visible in review period) */}
          {isReviewPeriod && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 font-mono font-bold text-[14px] text-[#c8102e] shadow-sm animate-pulse">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatTime(reviewTimeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Audio Synthesis Player & Rules */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#e0e0e0] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14px] font-bold text-slate-800">
                {isReviewPeriod ? "Review Period Active" : `Section ${activeSectionIdx + 1}`}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-600 uppercase tracking-wide">
                Questions {getOverallQuestionNumber(currentExercise.questions[0].id)}–
                {getOverallQuestionNumber(currentExercise.questions[currentExercise.questions.length - 1].id)}
              </span>
            </div>

            {/* Premium TTS Player Interface */}
            {isReviewPeriod ? (
              <div className="bg-slate-50 p-6 rounded-xl text-center space-y-3 border border-slate-200">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-full mx-auto">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </div>
                <h3 className="text-[15px] font-bold text-slate-800">All Audio Recordings Completed</h3>
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  Review and finalize all 40 questions. Click <strong>Submit Test</strong> in the control bar below to score.
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 p-6 rounded-xl flex flex-col items-center gap-5 border border-slate-150">
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 flex items-center justify-center rounded-full text-white transition-all shadow-md hover:scale-105"
                  style={{
                    backgroundColor: playedSections[activeSectionIdx] && !isSpeaking ? "#999" : theme.color,
                    cursor: playedSections[activeSectionIdx] && !isSpeaking ? "not-allowed" : "pointer"
                  }}
                  aria-label={isSpeaking ? "Pause" : "Play Speech"}
                >
                  {isSpeaking ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="4" y="4" width="4" height="16" />
                      <rect x="16" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <div className="w-full space-y-2">
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{ width: `${speechProgress}%`, backgroundColor: theme.color }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-bold font-mono">
                    <span>{isSpeaking ? "PLAYING RECORDING" : speechProgress === 100 ? "PLAYBACK COMPLETED" : "READY"}</span>
                    <span>{Math.round(speechProgress)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Warning notes */}
            {!isReviewPeriod && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-[12px] text-red-700 leading-relaxed">
                <svg className="w-4 h-4 text-[#c8102e] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span><strong>Notice:</strong> Recordings are played only once. In a real exam environment, you cannot pause or replay.</span>
              </div>
            )}
          </div>

          <div className="bg-[#fff9e6] border border-[#ffe082] rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-[14px] text-[#b78103] mb-2">Instructions</h3>
            <p className="text-[13px] text-[#b78103] leading-relaxed mb-3">
              Answer the questions as you listen. The questions correspond to the conversation order in the recording.
            </p>
            <p className="text-[12px] font-extrabold uppercase tracking-wide" style={{ color: theme.color }}>
              Choose the best letter option A, B, C or D.
            </p>
          </div>
        </div>

        {/* Right Side: Questions */}
        <div className="lg:col-span-7 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {currentExercise.questions.map((q) => {
            const overallNum = getOverallQuestionNumber(q.id);
            const userSelectedOpt = selectedAnswers[q.id];

            return (
              <div
                key={q.id}
                ref={(el) => {
                  questionRefs.current[q.id] = el;
                }}
                className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${
                  userSelectedOpt ? "border-slate-300" : "border-[#e0e0e0]"
                }`}
              >
                <p className="text-[14px] font-bold text-slate-900 mb-4 flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[12px] font-extrabold mr-2 flex-shrink-0 mt-0.5" style={{ backgroundColor: theme.color }}>
                    {overallNum}
                  </span>
                  {q.question_text}
                </p>

                <div className="space-y-2 pl-8">
                  {q.options.map((opt) => {
                    const isSelected = userSelectedOpt === opt.id;

                    return (
                      <label
                        key={opt.id}
                        onClick={() => handleSelect(q.id, opt.id)}
                        className={`flex items-center gap-3 py-2.5 px-3 border rounded-lg cursor-pointer text-[13px] transition-all ${
                          isSelected
                            ? "font-semibold border-slate-700 bg-slate-50 text-slate-950"
                            : "border-slate-100 hover:bg-[#fafafa] text-slate-600"
                        }`}
                        style={isSelected ? { borderColor: theme.color, backgroundColor: theme.colorLight, color: theme.color } : undefined}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                            isSelected ? "" : "border-slate-300 bg-white"
                          }`}
                          style={isSelected ? { borderColor: theme.color } : undefined}
                        >
                          {isSelected && (
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.color }} />
                          )}
                        </span>
                        <span className="font-extrabold text-slate-400 mr-0.5">{opt.label}</span>
                        <span>{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Navigator (Fixed overlay) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 shadow-lg z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Question Grid 1-40 */}
          <div className="flex flex-wrap items-center gap-1.5 max-w-full overflow-x-auto py-1">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase mr-2 tracking-wide whitespace-nowrap">Navigator:</span>
            {allQuestions.map((q, idx) => {
              const hasAnswer = !!selectedAnswers[q.id];
              const isCurrentExercise = currentExercise.questions.some((eq) => eq.id === q.id);

              let boxStyle = "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200";
              if (hasAnswer) {
                boxStyle = "text-white shadow-sm hover:opacity-90";
              } else if (isCurrentExercise) {
                boxStyle = "bg-white border-2 hover:bg-slate-50";
              }

              return (
                <button
                  key={q.id}
                  disabled={!isReviewPeriod && !isCurrentExercise}
                  onClick={() => handleNavClick(idx)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold transition-all ${boxStyle} disabled:opacity-50 disabled:cursor-not-allowed`}
                  style={
                    hasAnswer
                      ? { backgroundColor: theme.color }
                      : isCurrentExercise
                      ? { borderColor: theme.color, color: theme.color }
                      : undefined
                  }
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <div className="flex gap-2">
              <button
                disabled={!isReviewPeriod || activeSectionIdx === 0}
                onClick={() => setActiveSectionIdx((prev) => prev - 1)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-[12px] rounded-full hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev Sec
              </button>
              <button
                disabled={!isReviewPeriod || activeSectionIdx === totalSections - 1}
                onClick={() => setActiveSectionIdx((prev) => prev + 1)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-[12px] rounded-full hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next Sec →
              </button>
            </div>

            <button
              onClick={() => handleSubmit(false)}
              className="px-6 py-2.5 text-white font-bold text-[12px] rounded-full transition-all shadow hover:shadow-md animate-shimmer"
              style={{ backgroundColor: "#1a1a1a" }}
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-[16px] font-bold text-slate-900 mb-2">Submit Exam?</h3>
            <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
              You have {allQuestions.length - Object.keys(selectedAnswers).length} unanswered questions. Are you sure you want to submit your answers?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-[12px] rounded-full hover:bg-slate-50 transition-colors"
              >
                No, Keep Working
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmit(true);
                }}
                className="px-5 py-2 text-white font-bold text-[12px] rounded-full transition-all shadow-sm"
                style={{ backgroundColor: theme.color }}
              >
                Yes, Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
