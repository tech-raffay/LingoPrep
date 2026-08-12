"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";

interface SpeakingPrompt {
  id: string;
  title: string;
  content: string;
  difficulty: string;
  exam_type: string;
}

interface EvaluationResult {
  overall_band: number;
  pronunciation_fluency: number;
  grammar: number;
  lexical_resource: number;
  coherence_structure: number;
  feedback: string;
  suggestions: string[];
}

const bandLabels: Record<string, string> = {
  pronunciation_fluency: "Pronunciation & Fluency",
  grammar: "Grammar",
  lexical_resource: "Lexical Resource",
  coherence_structure: "Coherence & Structure",
};

const examColors: Record<string, { color: string; colorDark: string; colorLight: string; name: string }> = {
  ielts: { color: "#c8102e", colorDark: "#a50d24", colorLight: "#fef2f2", name: "IELTS" },
  toefl: { color: "#0057b8", colorDark: "#004494", colorLight: "#eff6ff", name: "TOEFL" },
};

const fallbackPrompts: Record<string, SpeakingPrompt[]> = {
  ielts: [
    {
      id: "s1",
      title: "Describe a book you read recently",
      content:
        "Describe a book you read recently that you found useful. You should say: what the book was, when you read it, what it was about, and explain why you found it useful.",
      difficulty: "medium",
      exam_type: "ielts",
    },
  ],
  toefl: [
    {
      id: "s2",
      title: "Online vs In-person Education",
      content:
        "Some people prefer to study online, while others prefer to attend traditional face-to-face classes. Which do you prefer and why? Use specific reasons and examples to support your choice.",
      difficulty: "medium",
      exam_type: "toefl",
    },
  ],
};

type RecordingState = "idle" | "recording" | "recorded" | "transcribing" | "evaluating";

export default function SpeakingPage() {
  const searchParams = useSearchParams();
  const examType = searchParams.get("exam") === "toefl" ? "toefl" : "ielts";
  const theme = examColors[examType];
  const defaultPrompts = fallbackPrompts[examType];

  const [prompts, setPrompts] = useState<SpeakingPrompt[]>(defaultPrompts);
  const [selectedPrompt, setSelectedPrompt] = useState<SpeakingPrompt>(defaultPrompts[0]);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [useManualTranscript, setUseManualTranscript] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch prompts from API on mount
  useEffect(() => {
    async function fetchPrompts() {
      try {
        const res = await api.get(`/api/speaking/prompts?exam_type=${examType}`);
        if (res.data?.data?.length) {
          setPrompts(res.data.data);
          setSelectedPrompt(res.data.data[0]);
        }
      } catch {
        // Use fallback prompts
      }
    }
    fetchPrompts();
  }, [examType]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setRecordingState("recording");
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError("Microphone access denied. Please allow microphone access in your browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingState("recorded");
  };

  const transcribeRecording = async () => {
    if (chunksRef.current.length === 0) return;
    setRecordingState("transcribing");
    setError(null);

    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");

      const res = await api.post("/api/speaking/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });

      if (res.data?.transcript) {
        setTranscript(res.data.transcript);
      } else {
        setError("Transcription returned empty. Please try recording again.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Failed to transcribe audio. Please ensure Groq API key is configured."
      );
    } finally {
      if (!transcript) setRecordingState("recorded");
    }
  };

  const evaluateTranscript = async () => {
    if (transcript.trim().length < 10) return;
    setRecordingState("evaluating");
    setError(null);

    try {
      const res = await api.post("/api/speaking/evaluate", {
        prompt: selectedPrompt.content,
        transcript: transcript,
        exam_type: selectedPrompt.exam_type || examType,
      });
      setEvaluation(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Failed to evaluate speaking. Please check backend configuration."
      );
      setRecordingState("recorded");
    }
  };

  const handleReset = () => {
    setRecordingState("idle");
    setTranscript("");
    setEvaluation(null);
    setError(null);
    setRecordingTime(0);
    chunksRef.current = [];
    setUseManualTranscript(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const maxScale = examType === "toefl" ? 30 : 9;
  const subScoreMax = examType === "toefl" ? 4 : 9;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white" style={{ backgroundColor: theme.color }}>
              {theme.name} Academic
            </span>
            <span className="text-[12px] font-semibold text-slate-400">•</span>
            <span className="text-[13px] text-slate-500 font-medium">Speaking Assessment</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-extrabold text-slate-900 tracking-tight">{theme.name} Speaking Test</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="px-3.5 py-1 border text-[11.5px] font-extrabold rounded-full uppercase tracking-wider bg-slate-50" style={{ borderColor: `${theme.color}40`, color: theme.color }}>
            {examType === "ielts" ? "Part 2 — Individual Long Turn" : "Task 1 — Independent Speaking"}
          </span>
        </div>
      </div>

      {/* Prompt Selection */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        {prompts.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedPrompt(p);
              handleReset();
            }}
            className={`px-4 py-2 rounded-full text-[12.5px] font-bold border transition-all ${
              selectedPrompt.id === p.id
                ? "text-white shadow-sm"
                : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50/80"
            }`}
            style={
              selectedPrompt.id === p.id
                ? { backgroundColor: theme.color, borderColor: theme.color }
                : undefined
            }
          >
            Topic: {p.title}
          </button>
        ))}
      </div>

      {/* Main Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Examiner Video simulation & audio state controls */}
        <div className="lg:col-span-7 bg-white border border-slate-200/70 rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl aspect-video mb-6 flex flex-col items-center justify-center border border-slate-800 relative overflow-hidden shadow-inner">
            {/* Visual simulation of examiner */}
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-300 shadow-lg">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                {recordingState === "recording" && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <h4 className="text-white text-[14px] font-bold">AI Examiner Console</h4>
                <p className="text-slate-400 text-[12px]">Listening & Evaluating spoken responses</p>
              </div>

              {/* Dynamic waveform visualizer */}
              <div className="flex items-center gap-1 h-6 pt-2">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      recordingState === "recording" ? "bg-red-400 animate-pulse" : "bg-slate-700"
                    }`}
                    style={{
                      height: recordingState === "recording" ? `${[10, 22, 14, 24, 12, 20, 18, 22, 10][i]}px` : "6px",
                      animationDelay: `${i * 100}ms`
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-full font-semibold border border-white/10 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Session Active</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            {recordingState === "idle" && (
              <div className="text-center space-y-4">
                <button
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full text-white flex items-center justify-center mx-auto shadow-lg hover:scale-105 active:scale-95 transition-all"
                  style={{ backgroundColor: theme.color }}
                  aria-label="Start recording"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                    <line x1="12" x2="12" y1="19" y2="22"/>
                  </svg>
                </button>
                <p className="text-[12.5px] font-bold text-slate-500 uppercase tracking-wider">Click mic to record response</p>
                
                <button
                  onClick={() => setUseManualTranscript(true)}
                  className="text-[12.5px] font-bold hover:underline block mx-auto"
                  style={{ color: theme.color }}
                >
                  Or type spoken transcript manually
                </button>
              </div>
            )}

            {recordingState === "recording" && (
              <div className="text-center space-y-4">
                <button
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center mx-auto animate-pulse shadow-lg transition-all"
                  aria-label="Stop recording"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="5" width="14" height="14" rx="2"/>
                  </svg>
                </button>
                <div className="text-red-600 font-bold text-xl font-mono tracking-wider">
                  {formatTime(recordingTime)}
                </div>
                <p className="text-[12px] font-extrabold text-slate-400 uppercase tracking-wider">Recording response... Click button to finish</p>
              </div>
            )}

            {recordingState === "recorded" && !transcript && (
              <div className="text-center space-y-4">
                <div className="px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-[13px] font-semibold text-slate-700 inline-block">
                  Audio Duration: {formatTime(recordingTime)}
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={transcribeRecording}
                    className="px-6 py-2.5 text-white font-bold text-[13px] rounded-full transition-all shadow-md"
                    style={{ backgroundColor: theme.color }}
                  >
                    Transcribe Recording
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 border border-slate-200 text-slate-700 font-bold text-[13px] rounded-full hover:bg-slate-50 transition-colors"
                  >
                    Re-record
                  </button>
                </div>
              </div>
            )}

            {(recordingState === "transcribing" || recordingState === "evaluating") && (
              <div className="text-center space-y-3 py-4">
                <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: `${theme.color} transparent transparent transparent` }}></div>
                <p className="text-[12.5px] font-extrabold text-slate-400 uppercase tracking-wider">Analyzing speaking metrics with AI...</p>
              </div>
            )}
          </div>

          {/* Manual input */}
          {useManualTranscript && recordingState === "idle" && (
            <div className="mt-6 pt-6 border-t border-slate-200/80">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Enter what you would say in response to the prompt..."
                rows={5}
                className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-slate-300 text-[14.5px] leading-relaxed text-slate-900 placeholder:text-slate-400"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-[12px] text-slate-500 font-semibold">{wordCount} words</span>
                <button
                  onClick={evaluateTranscript}
                  disabled={wordCount < 10}
                  className="px-6 py-2.5 text-white font-bold text-[13px] rounded-full disabled:opacity-40 transition-all shadow-sm"
                  style={{ backgroundColor: theme.color }}
                >
                  Evaluate Transcript
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Candidate Cue Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/70 rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <h3 className="text-[16px] font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <span>{examType === "ielts" ? "Candidate Cue Card" : "Speaking Task Prompt"}</span>
            </h3>
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 mb-4">
              <p className="text-[14.5px] text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                {selectedPrompt.content}
              </p>
            </div>
            <div className="text-[12px] text-slate-400 font-semibold flex items-center gap-1.5">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Suggested speaking duration: 1–2 minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript review */}
      {transcript && !evaluation && recordingState !== "evaluating" && !useManualTranscript && (
        <div className="bg-white border border-slate-200/70 rounded-3xl p-7 mt-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <h3 className="font-bold text-[15px] text-slate-900 border-b border-slate-100 pb-3 mb-4">Transcribed Spoken Response</h3>
          <p className="text-[14.5px] text-slate-800 leading-relaxed mb-6 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/60">{transcript}</p>
          <div className="flex gap-3">
            <button
              onClick={evaluateTranscript}
              disabled={wordCount < 10}
              className="px-6 py-2.5 text-white font-bold text-[13px] rounded-full transition-all shadow-md"
              style={{ backgroundColor: theme.color }}
            >
              Evaluate Response
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 font-bold text-[13px] rounded-full hover:bg-slate-50 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-8 p-4 rounded-2xl bg-red-50/80 border border-red-200 text-red-700 text-[13.5px] font-semibold flex items-center gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <div className="mt-8 space-y-6">
          {/* Transcript review */}
          <div className="bg-white border border-slate-200/70 rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <h3 className="font-bold text-[15px] text-slate-900 border-b border-slate-100 pb-3 mb-4">Transcribed Response</h3>
            <p className="text-[14.5px] text-slate-800 leading-relaxed">{transcript}</p>
          </div>

          {/* Results dashboard card */}
          <div className="bg-white border border-slate-200/70 rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h3 className="text-[18px] font-extrabold text-slate-900">{theme.name} Speaking Band Score</h3>
              <p className="text-[13px] text-slate-500 mt-1">Evaluated based on official criteria</p>
            </div>
            <div className="flex items-baseline gap-2 bg-slate-50 border border-slate-200/80 px-6 py-3.5 rounded-2xl shadow-sm">
              <span className="text-[40px] font-extrabold leading-none" style={{ color: theme.color }}>{evaluation.overall_band}</span>
              <span className="text-[14px] font-bold text-slate-500">/ {maxScale}</span>
            </div>
          </div>

          {/* Subscores Grid */}
          <div className="grid sm:grid-cols-2 gap-5">
            {Object.entries(bandLabels).map(([key, label]) => {
              const val = evaluation[key as keyof EvaluationResult] as number;
              return (
                <div key={key} className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[14px] font-bold text-slate-800">{label}</span>
                    <span className="font-extrabold text-[16px] text-slate-900">{val}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(val / subScoreMax) * 100}%`, backgroundColor: theme.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback & Suggestions */}
          <div className="bg-white border border-slate-200/70 rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <h4 className="font-bold text-slate-900 text-[16px] mb-4 border-b border-slate-100 pb-3">Detailed Assessment Feedback</h4>
            <p className="text-slate-800 leading-relaxed text-[14px] whitespace-pre-line">{evaluation.feedback}</p>
          </div>

          <div className="bg-white border border-slate-200/70 rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <h4 className="font-bold text-slate-900 text-[16px] mb-4 border-b border-slate-100 pb-3">Suggestions for Improvement</h4>
            <ul className="space-y-3">
              {evaluation.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-800 text-[14px]">
                  <span className="font-extrabold text-base" style={{ color: theme.color }}>✓</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleReset}
            className="px-6 py-3 border border-slate-200 bg-white text-slate-700 font-bold text-[13px] rounded-full hover:bg-slate-50 transition-colors shadow-sm"
          >
            Start New Practice Topic
          </button>
        </div>
      )}
    </div>
  );
}

