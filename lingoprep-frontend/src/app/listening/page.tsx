"use client";

import { useState, useRef } from "react";

const sampleListening = {
  title: "University Lecture: Introduction to Renewable Energy",
  audio_url: "",
  duration: "3:45",
  transcript: "Good morning, everyone. Today we're going to discuss the fundamentals of renewable energy sources and why they're becoming increasingly important in our global energy landscape...",
  questions: [
    {
      id: "lq1",
      question_text: "What is the main topic of the lecture?",
      options: [
        { id: "a", text: "Nuclear energy safety protocols" },
        { id: "b", text: "Fundamentals of renewable energy sources" },
        { id: "c", text: "History of fossil fuel consumption" },
        { id: "d", text: "Economic impact of oil prices" },
      ],
      correct_option_id: "b",
      explanation: "The speaker explicitly states they will discuss the fundamentals of renewable energy sources.",
    },
    {
      id: "lq2",
      question_text: "Why are renewable energy sources becoming more important?",
      options: [
        { id: "a", text: "They are cheaper than all other energy sources" },
        { id: "b", text: "Governments require their use by law" },
        { id: "c", text: "They are increasingly important in the global energy landscape" },
        { id: "d", text: "Fossil fuels have already run out" },
      ],
      correct_option_id: "c",
      explanation: "The speaker mentions their growing importance in the global energy landscape.",
    },
  ],
};

export default function ListeningPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
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

  const score = submitted
    ? sampleListening.questions.filter((q) => selectedAnswers[q.id] === q.correct_option_id).length
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🎧</span>
          <h1 className="text-3xl font-bold">Listening Module</h1>
        </div>
        <p className="text-text-muted">Listen to the audio carefully, then answer the questions below.</p>
      </div>

      {/* Audio Player Card */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
          <h2 className="text-lg font-bold mb-1">{sampleListening.title}</h2>
          <p className="text-white/70 text-sm">Duration: {sampleListening.duration}</p>
        </div>
        <div className="p-6">
          <audio ref={audioRef} src={sampleListening.audio_url}
            onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
            onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
            onEnded={() => setIsPlaying(false)} />

          <div className="flex items-center gap-4">
            <button onClick={togglePlay}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25">
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <div className="flex-1">
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-300"
                  style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }} />
              </div>
              <div className="flex justify-between mt-1 text-xs text-text-muted">
                <span>{formatTime(currentTime)}</span>
                <span>{duration > 0 ? formatTime(duration) : sampleListening.duration}</span>
              </div>
            </div>
          </div>

          {!sampleListening.audio_url && (
            <div className="mt-4 p-3 rounded-xl bg-accent/10 border border-accent/20 text-sm">
              <span className="font-medium text-accent">⚠️ Audio not uploaded yet.</span>
              <span className="text-text-muted ml-1">Connect Supabase Storage to serve audio files.</span>
            </div>
          )}

          <button onClick={() => setShowTranscript(!showTranscript)}
            className="mt-4 text-sm text-primary font-medium hover:underline">
            {showTranscript ? "Hide" : "Show"} Transcript
          </button>
          {showTranscript && (
            <div className="mt-3 p-4 rounded-xl bg-surface-hover text-sm leading-relaxed text-text-muted">
              {sampleListening.transcript}
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-8">
        {sampleListening.questions.map((q, idx) => {
          const correct = submitted && selectedAnswers[q.id] === q.correct_option_id;
          const wrong = submitted && selectedAnswers[q.id] && selectedAnswers[q.id] !== q.correct_option_id;
          return (
            <div key={q.id} className={`rounded-2xl border p-6 transition-all ${submitted ? (correct ? "border-success/50 bg-success/5" : wrong ? "border-danger/50 bg-danger/5" : "border-border bg-surface") : "border-border bg-surface"}`}>
              <p className="font-semibold mb-4"><span className="text-secondary mr-2">Q{idx + 1}.</span>{q.question_text}</p>
              <div className="grid gap-3">
                {q.options.map((o) => {
                  const sel = selectedAnswers[q.id] === o.id;
                  const corr = submitted && o.id === q.correct_option_id;
                  return (
                    <button key={o.id} onClick={() => handleSelect(q.id, o.id)} disabled={submitted}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${corr ? "border-success bg-success/10 text-success font-medium" : sel && submitted ? "border-danger bg-danger/10 text-danger" : sel ? "border-secondary bg-secondary/10 text-secondary font-medium" : "border-border hover:border-secondary/50 hover:bg-surface-hover"}`}>
                      <span className="font-mono text-sm mr-3 opacity-60">{o.id.toUpperCase()}</span>{o.text}
                    </button>
                  );
                })}
              </div>
              {submitted && q.explanation && (
                <div className="mt-4 p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                  <p className="text-sm"><span className="font-semibold text-secondary">Explanation: </span>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        {submitted ? (
          <div className="flex items-center gap-6">
            <div className="text-lg">Score: <span className="font-bold text-2xl gradient-text">{score}/{sampleListening.questions.length}</span></div>
            <button onClick={() => { setSelectedAnswers({}); setSubmitted(false); }}
              className="px-6 py-2.5 border border-border rounded-xl font-medium hover:bg-surface-hover transition-colors">Try Again</button>
          </div>
        ) : (
          <button onClick={() => setSubmitted(true)}
            disabled={Object.keys(selectedAnswers).length < sampleListening.questions.length}
            className="px-8 py-3 bg-secondary text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-secondary/25">
            Submit Answers ({Object.keys(selectedAnswers).length}/{sampleListening.questions.length})
          </button>
        )}
      </div>
    </div>
  );
}
