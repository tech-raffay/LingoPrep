"use client";

import { useState, useRef, useEffect } from "react";
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
  const [exercise, setExercise] = useState<AudioExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [dbResults, setDbResults] = useState<any[] | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    async function fetchAudio() {
      try {
        setLoading(true);
        const response = await api.get("/api/listening/audios");
        const audios = response.data?.data || [];
        if (audios.length > 0) {
          setExercise(audios[0]);
        } else {
          setError("No listening exercises found.");
        }
      } catch (err: any) {
        console.error("Error fetching audio:", err);
        setError("Failed to connect to the backend server.");
      } finally {
        setLoading(false);
      }
    }
    fetchAudio();
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelect = (qId: string, oId: string) => {
    if (submitted) return;
    setSelectedAnswers((p) => ({ ...p, [qId]: oId }));
  };

  const handleSubmit = async () => {
    if (!exercise) return;
    try {
      const answersPayload = Object.entries(selectedAnswers).map(([qId, optId]) => ({
        question_id: qId,
        selected_option_id: optId,
      }));

      const res = await api.post("/api/listening/submit", {
        passage_id: exercise.id,
        answers: answersPayload,
      });

      setScore(res.data.correct_answers);
      setDbResults(res.data.results);
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting answers:", err);
      alert("Failed to submit answers to the server.");
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(null);
    setDbResults(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] flex-col gap-3">
        <div className="w-7 h-7 border-2 border-[#c8102e] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[13px] text-[#999]">Loading listening exercise...</p>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <svg className="mx-auto mb-4" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c8102e" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p className="text-[14px] text-[#666] mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2 bg-[#c8102e] text-white font-semibold text-[13px] rounded-full hover:bg-[#a50d24] transition-colors">Retry</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e0e0e0]">
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1a1a]">Listening Practice Test</h1>
          <p className="text-[13px] text-[#999]">Academic Module</p>
        </div>
        <span className="px-3 py-1 border border-[#c8102e] text-[#c8102e] text-[12px] font-bold rounded-full">
          Section 1
        </span>
      </div>

      {/* Main Grid: Player left, Questions right */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Audio controls & instructions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Audio Player Card */}
          <div className="bg-white border border-[#e0e0e0] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14px] font-bold text-[#1a1a1a]">Section 1</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                Questions 1–{exercise.questions.length}
              </span>
            </div>

            <audio
              ref={audioRef}
              src={exercise.audio_url}
              onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
              onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
              onEnded={() => setIsPlaying(false)}
            />

            <div className="bg-[#f5f5f5] p-6 rounded-lg flex flex-col items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#c8102e] text-white hover:bg-[#a50d24] transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="4" height="16" />
                    <rect x="16" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <div className="w-full">
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#c8102e]"
                    style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[12px] text-slate-500 font-semibold font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{duration > 0 ? formatTime(duration) : formatTime(exercise.duration_seconds)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="mt-4 text-[12px] text-[#007a87] font-semibold hover:underline block"
            >
              {showTranscript ? "Hide" : "Show"} Audio Transcript
            </button>
            {showTranscript && exercise.transcript && (
              <div className="mt-3 p-4 rounded bg-slate-50 border border-slate-200 text-[13px] leading-relaxed text-[#555] whitespace-pre-line font-medium">
                {exercise.transcript}
              </div>
            )}
          </div>

          {/* Instructions Card */}
          <div className="bg-[#fcf8e3] border border-[#fbeed5] rounded-lg p-5">
            <h3 className="font-bold text-[14px] text-[#8a6d3b] mb-2">Instructions</h3>
            <p className="text-[13px] text-[#8a6d3b] leading-relaxed mb-3">
              You will hear a recording. Answer the questions based on what you hear.
            </p>
            <p className="text-[12px] font-bold text-[#c8102e] uppercase tracking-wide">
              Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.
            </p>
          </div>
        </div>

        {/* Right Side: Questions list */}
        <div className="lg:col-span-7 space-y-5">
          {exercise.questions.map((q, idx) => {
            const resultDetail = dbResults?.find((r) => r.question_id === q.id);
            const isCorrect = submitted && resultDetail?.is_correct;
            const isWrong = submitted && !resultDetail?.is_correct;

            return (
              <div
                key={q.id}
                className={`bg-white border rounded-lg p-5 transition-all ${
                  submitted
                    ? isCorrect
                      ? "border-[#2e7d32]"
                      : isWrong
                      ? "border-[#c8102e]"
                      : "border-[#e0e0e0]"
                    : "border-[#e0e0e0]"
                }`}
              >
                <p className="text-[14px] text-[#1a1a1a] mb-4">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#c8102e] text-white text-[12px] font-bold mr-2">{idx + 1}</span>
                  {q.question_text}
                </p>
                <div className="space-y-2 pl-8">
                  {q.options.map((o) => {
                    const sel = selectedAnswers[q.id] === o.id;
                    const corr = submitted && o.id === q.correct_option_id;

                    return (
                      <label
                        key={o.id}
                        className={`flex items-center gap-3 py-2 px-3 rounded cursor-pointer text-[14px] transition-colors ${
                          corr ? "bg-[#e8f5e9] text-[#2e7d32] font-semibold" :
                          sel && submitted ? "bg-[#fce4ec] text-[#c8102e] font-semibold" :
                          sel ? "bg-[#fef2f2] text-[#c8102e]" :
                          "hover:bg-[#fafafa] text-[#333]"
                        }`}
                        onClick={() => handleSelect(q.id, o.id)}
                      >
                        <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          sel || corr ? "border-[#c8102e]" : "border-[#ccc]"
                        }`}>
                          {(sel || corr) && <span className="w-2 h-2 rounded-full bg-[#c8102e]" />}
                        </span>
                        <span className="font-semibold mr-1 text-[#999]">{o.label}</span>
                        {o.text}
                      </label>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <div className="mt-3 ml-8 p-3 bg-[#f5f5f5] border-l-3 border-[#2e7d32] text-[13px] text-[#555]">
                    <strong className="text-[#2e7d32]">Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}

          {/* Results Summary Box */}
          <div className="bg-white border border-[#e0e0e0] rounded-lg p-6">
            {submitted && score !== null ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-bold text-slate-700">Listening Score:</span>
                  <span className="font-bold text-[20px] text-[#007a87]">
                    {score} / {exercise.questions.length} correct
                  </span>
                </div>
                <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600"
                    style={{ width: `${(score / exercise.questions.length) * 100}%` }}
                  />
                </div>
                <button
                  onClick={handleReset}
                  className="w-full py-2 border border-[#ddd] text-[#333] font-semibold text-[13px] rounded-full hover:bg-[#fafafa] transition-colors"
                >
                  Try Listening Again
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length < exercise.questions.length}
                  className="w-full py-2.5 bg-[#c8102e] text-white font-semibold text-[13px] rounded-full hover:bg-[#a50d24] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Answers ({Object.keys(selectedAnswers).length} / {exercise.questions.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
