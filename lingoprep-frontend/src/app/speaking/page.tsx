"use client";

import { useState, useRef, useEffect } from "react";
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

const fallbackPrompts: SpeakingPrompt[] = [
  {
    id: "s1",
    title: "Describe a book you read recently",
    content:
      "Describe a book you read recently that you found useful. You should say: what the book was, when you read it, what it was about, and explain why you found it useful.",
    difficulty: "medium",
    exam_type: "ielts",
  },
  {
    id: "s2",
    title: "Online vs In-person Education",
    content:
      "Some people prefer to study online, while others prefer to attend traditional face-to-face classes. Which do you prefer and why? Use specific reasons and examples to support your choice.",
    difficulty: "medium",
    exam_type: "toefl",
  },
];

type RecordingState = "idle" | "recording" | "recorded" | "transcribing" | "evaluating";

export default function SpeakingPage() {
  const [prompts, setPrompts] = useState<SpeakingPrompt[]>(fallbackPrompts);
  const [selectedPrompt, setSelectedPrompt] = useState<SpeakingPrompt>(fallbackPrompts[0]);
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
        const res = await api.get("/api/speaking/prompts");
        if (res.data?.data?.length) {
          setPrompts(res.data.data);
          setSelectedPrompt(res.data.data[0]);
        }
      } catch {
        // Use fallback prompts
      }
    }
    fetchPrompts();
  }, []);

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
        exam_type: selectedPrompt.exam_type,
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
  const maxScale = selectedPrompt.exam_type === "toefl" ? 30 : 9;
  const subScoreMax = selectedPrompt.exam_type === "toefl" ? 4 : 9;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e0e0e0]">
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1a1a]">Speaking Practice Test</h1>
          <p className="text-[13px] text-[#999]">Academic Module</p>
        </div>
        <span className="px-3 py-1 border border-[#c8102e] text-[#c8102e] text-[12px] font-bold rounded-full uppercase">
          {selectedPrompt.exam_type} Part 2
        </span>
      </div>

      {/* Prompt Selection */}
      <div className="flex flex-wrap gap-2.5 mb-6">
        {prompts.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedPrompt(p);
              handleReset();
            }}
            className={`px-4 py-1.5 rounded-full text-[12px] font-bold border transition-colors ${
              selectedPrompt.id === p.id
                ? "bg-[#c8102e] border-[#c8102e] text-white"
                : "bg-white border-[#ddd] text-[#333] hover:bg-[#fafafa]"
            }`}
          >
            {p.exam_type?.toUpperCase()} — {p.title}
          </button>
        ))}
      </div>

      {/* Main Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Examiner Video simulation & audio state controls */}
        <div className="lg:col-span-7 bg-white border border-[#e0e0e0] rounded-lg p-6">
          <div className="bg-slate-100 rounded-lg aspect-video mb-6 flex flex-col items-center justify-center border border-slate-200 relative overflow-hidden">
            {/* Visual simulation of examiner */}
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded font-semibold">
                Examiner
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            {recordingState === "idle" && (
              <div className="text-center space-y-4">
                <button
                  onClick={startRecording}
                  className="w-14 h-14 rounded-full bg-[#c8102e] hover:bg-[#a50d24] text-white flex items-center justify-center mx-auto shadow transition-colors"
                  aria-label="Start recording"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                    <line x1="12" x2="12" y1="19" y2="22"/>
                  </svg>
                </button>
                <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Click microphone icon to record</p>
                
                <button
                  onClick={() => setUseManualTranscript(true)}
                  className="text-[12px] text-[#007a87] font-semibold hover:underline block"
                >
                  Or manually enter response transcript
                </button>
              </div>
            )}

            {recordingState === "recording" && (
              <div className="text-center space-y-4">
                <button
                  onClick={stopRecording}
                  className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center mx-auto animate-pulse"
                  aria-label="Stop recording"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="4" width="16" height="16" rx="2"/>
                  </svg>
                </button>
                <div className="text-red-600 font-bold text-lg font-mono">
                  {formatTime(recordingTime)}
                </div>
                <p className="text-[12px] font-bold text-slate-400 uppercase">Recording... Click to stop</p>
              </div>
            )}

            {recordingState === "recorded" && !transcript && (
              <div className="text-center space-y-4">
                <p className="text-[13px] font-semibold text-slate-700">Audio length: {formatTime(recordingTime)}</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={transcribeRecording}
                    className="px-5 py-2 bg-[#c8102e] text-white font-semibold text-[13px] rounded-full hover:bg-[#a50d24] transition-colors"
                  >
                    Transcribe spoken response
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-5 py-2 border border-[#ddd] text-[#333] font-semibold text-[13px] rounded-full hover:bg-[#fafafa] transition-colors"
                  >
                    Re-record
                  </button>
                </div>
              </div>
            )}

            {(recordingState === "transcribing" || recordingState === "evaluating") && (
              <div className="text-center space-y-3">
                <div className="w-6 h-6 border-2 border-[#c8102e] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-[12px] font-bold text-slate-400 uppercase">AI is analyzing response...</p>
              </div>
            )}
          </div>

          {/* Manual input */}
          {useManualTranscript && recordingState === "idle" && (
            <div className="mt-6 pt-6 border-t border-[#e0e0e0]">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Enter what you would say in response..."
                rows={5}
                className="w-full p-4 rounded border border-[#e0e0e0] bg-slate-50 focus:outline-none text-[14px] leading-relaxed text-[#1a1a1a] placeholder:text-[#999]"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-[12px] text-slate-400 font-semibold">{wordCount} words</span>
                <button
                  onClick={evaluateTranscript}
                  disabled={wordCount < 10}
                  className="px-5 py-2 bg-[#c8102e] text-white font-semibold text-[13px] rounded-full hover:bg-[#a50d24] disabled:opacity-30 transition-colors"
                >
                  Evaluate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Candidate Cue Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#e0e0e0] rounded-lg p-6">
            <h3 className="text-[15px] font-bold text-[#1a1a1a] border-b border-[#e0e0e0] pb-3 mb-4 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Candidate Cue Card
            </h3>
            <p className="text-[14px] text-[#333] leading-relaxed whitespace-pre-line font-medium">
              {selectedPrompt.content}
            </p>
          </div>
        </div>
      </div>

      {/* Transcript review */}
      {transcript && !evaluation && recordingState !== "evaluating" && !useManualTranscript && (
        <div className="bg-white border border-[#e0e0e0] rounded-lg p-6 mt-6">
          <h3 className="font-bold text-[14px] text-[#1a1a1a] border-b border-[#f0f0f0] pb-2 mb-3">Transcribed Response</h3>
          <p className="text-[14px] text-[#333] leading-relaxed mb-5">{transcript}</p>
          <div className="flex gap-2">
            <button
              onClick={evaluateTranscript}
              disabled={wordCount < 10}
              className="px-5 py-2 bg-[#c8102e] text-white font-semibold text-[13px] rounded-full hover:bg-[#a50d24] transition-colors"
            >
              Get AI evaluation
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-2 border border-[#ddd] text-[#333] font-semibold text-[13px] rounded-full hover:bg-[#fafafa] transition-colors"
            >
              Start over
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 rounded bg-red-50 border border-red-200 text-red-700 text-[13px] font-semibold">
          {error}
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <div className="mt-6 space-y-6">
          {/* Transcript review */}
          <div className="bg-white border border-[#e0e0e0] rounded-lg p-6">
            <h3 className="font-bold text-[14px] text-[#1a1a1a] border-b border-[#f0f0f0] pb-2 mb-3">Response Text</h3>
            <p className="text-[14px] text-[#333] leading-relaxed">{transcript}</p>
          </div>

          {/* Results dashboard card */}
          <div className="bg-white border border-[#e0e0e0] rounded-lg p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h3 className="text-[16px] font-bold text-[#1a1a1a]">Speaking score</h3>
              <p className="text-[13px] text-[#666] mt-1">Based on pronunciation and structure metrics</p>
            </div>
            <div className="flex items-baseline gap-2 bg-[#f5f5f5] px-5 py-3 rounded-lg border border-[#e0e0e0]">
              <span className="text-[36px] font-bold text-[#c8102e] leading-none">{evaluation.overall_band}</span>
              <span className="text-[13px] text-[#666]">/ {maxScale}</span>
            </div>
          </div>

          {/* Subscores Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(bandLabels).map(([key, label]) => {
              const val = evaluation[key as keyof EvaluationResult] as number;
              return (
                <div key={key} className="bg-white border border-[#e0e0e0] rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-bold text-slate-700">{label}</span>
                    <span className="font-bold text-[15px] text-[#1a1a1a]">{val}</span>
                  </div>
                  <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#007a87]"
                      style={{ width: `${(val / subScoreMax) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback & Suggestions */}
          <div className="bg-white border border-[#e0e0e0] rounded-lg p-6">
            <h4 className="font-bold text-[#1a1a1a] text-[15px] mb-3 border-b border-[#f0f0f0] pb-2">Feedback</h4>
            <p className="text-[#333] leading-relaxed text-[13px] whitespace-pre-line">{evaluation.feedback}</p>
          </div>

          <div className="bg-white border border-[#e0e0e0] rounded-lg p-6">
            <h4 className="font-bold text-[#1a1a1a] text-[15px] mb-3 border-b border-[#f0f0f0] pb-2">Suggestions for Improvement</h4>
            <ul className="space-y-2">
              {evaluation.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-[#333] text-[13px]">
                  <span className="text-[#c8102e] font-bold">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleReset}
            className="px-6 py-2 border border-[#ddd] text-[#333] font-semibold text-[13px] rounded-full hover:bg-[#fafafa] transition-colors"
          >
            Start new practice topic
          </button>
        </div>
      )}
    </div>
  );
}
