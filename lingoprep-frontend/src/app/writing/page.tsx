"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Prompt {
  id: string;
  task_type: string;
  question: string;
  overall: number;
}

interface EvaluationResult {
  overall_band: number;
  task_achievement: number;
  coherence_cohesion: number;
  lexical_resource: number;
  grammatical_range: number;
  feedback: string;
  suggestions: string[];
}

const bandLabels: Record<string, string> = {
  task_achievement: "Task Achievement",
  coherence_cohesion: "Coherence & Cohesion",
  lexical_resource: "Lexical Resource",
  grammatical_range: "Grammatical Range & Accuracy",
};

export default function WritingPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [essay, setEssay] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPrompts, setLoadingPrompts] = useState(true);

  // Load prompts from the API on mount
  useEffect(() => {
    async function fetchPrompts() {
      try {
        const res = await api.get("/api/writing/prompts");
        const data = res.data?.data || [];
        setPrompts(data);
        if (data.length > 0) setSelectedPrompt(data[0]);
      } catch {
        setError("Failed to load writing prompts.");
      } finally {
        setLoadingPrompts(false);
      }
    }
    fetchPrompts();
  }, []);

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  // Use the new /submit endpoint that saves to writing_submissions
  const handleEvaluate = async () => {
    if (wordCount < 50 || !selectedPrompt) return;
    setIsEvaluating(true);
    setError(null);
    try {
      const res = await api.post("/api/writing/submit", {
        prompt_id: selectedPrompt.id,
        essay: essay,
      });
      // The submit endpoint returns { success, feedback, score }
      setEvaluation(res.data.feedback);
    } catch (err: any) {
      console.error("Evaluation error:", err);
      setError(
        err.response?.data?.detail ||
        "Failed to evaluate essay. Please check if backend and Groq are configured."
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setEssay("");
    setEvaluation(null);
    setError(null);
  };

  const loadRandomPrompt = async () => {
    try {
      const res = await api.get("/api/writing/prompt/random");
      const p = res.data?.data;
      if (p) {
        setSelectedPrompt(p);
        handleReset();
      }
    } catch {
      // silently fail
    }
  };

  if (loadingPrompts) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">✍️</span>
          <h1 className="text-3xl font-extrabold text-slate-900">Writing Practice</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-slate-200 rounded-md" />
          <div className="h-32 bg-slate-200 rounded-md" />
          <div className="h-64 bg-slate-200 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">✍️</span>
          <h1 className="text-3xl font-extrabold text-slate-900">Writing Module</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Write an essay in response to the prompt. Your response will be graded based on IELTS task achievement criteria.
        </p>
      </div>

      {/* Prompt Selection buttons */}
      <div className="flex flex-wrap gap-2.5 mb-6">
        {prompts.slice(0, 6).map((p, i) => (
          <button
            key={p.id}
            onClick={() => { setSelectedPrompt(p); handleReset(); }}
            className={`px-4 py-2 rounded-md text-xs font-bold border transition-all ${
              selectedPrompt?.id === p.id
                ? "bg-[#e31837] border-[#e31837] text-white shadow-sm"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Prompt {i + 1} (Task {p.task_type})
          </button>
        ))}
        <button
          onClick={loadRandomPrompt}
          className="px-4 py-2 rounded-md text-xs font-bold border border-slate-300 bg-white text-[#e31837] hover:bg-slate-50 transition-all flex items-center gap-1"
        >
          <span>🔀</span> Random Prompt
        </button>
      </div>

      {/* Prompt Card */}
      {selectedPrompt && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-[#e31837] uppercase">
              IELTS Writing
            </span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 uppercase">
              Task {selectedPrompt.task_type}
            </span>
            {selectedPrompt.overall > 0 && (
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase">
                Band Reference: {selectedPrompt.overall}
              </span>
            )}
          </div>
          <p className="text-slate-800 leading-relaxed font-medium text-base">{selectedPrompt.question}</p>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 font-semibold">
            Recommended: Minimum 250 words, time suggested: 40 minutes.
          </div>
        </div>
      )}

      {/* Essay Editor */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase">
          <span>Writing Area</span>
          <span className={wordCount >= 250 ? "text-emerald-700" : "text-slate-400"}>
            {wordCount} / 250 words
          </span>
        </div>
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="Start writing your essay here..."
          rows={14}
          className="w-full p-6 bg-transparent resize-none focus:outline-none text-slate-900 text-base leading-relaxed placeholder:text-slate-400"
          disabled={!!evaluation}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      {!evaluation && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleEvaluate}
            disabled={wordCount < 50 || isEvaluating}
            className="px-8 py-3.5 bg-[#e31837] text-white font-bold rounded-md hover:bg-[#b91c1c] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {isEvaluating ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Evaluating Essay...
              </span>
            ) : "Evaluate Essay"}
          </button>
          {wordCount > 0 && wordCount < 50 && (
            <p className="text-sm text-slate-500 font-semibold">Write at least 50 words to enable evaluation.</p>
          )}
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <div className="space-y-6">
          {/* Main IELTS Result Header Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">IELTS Writing Band Score</h3>
                <p className="text-slate-500 text-sm mt-1">Based on official IELTS Writing Assessment Rubrics</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-6 py-4 rounded-lg">
                <div className="text-center">
                  <div className="text-5xl font-extrabold text-[#e31837]">
                    {evaluation.overall_band}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                    Band / 9.0
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscores Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(bandLabels).map(([key, label]) => {
              const val = evaluation[key as keyof EvaluationResult] as number;
              return (
                <div key={key} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-700">{label}</span>
                    <span className="font-extrabold text-base text-slate-900">{val}</span>
                  </div>
                  {/* Clean progress indicator */}
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#007a87] rounded-full transition-all duration-500"
                      style={{ width: `${(val / 9) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Feedback & Improvements */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 text-lg mb-4 border-b border-slate-100 pb-2">Assessment Feedback</h4>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">{evaluation.feedback}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 text-lg mb-4 border-b border-slate-100 pb-2">Improvement Suggestions</h4>
            <ul className="space-y-3">
              {evaluation.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700 text-sm">
                  <span className="text-[#e31837] font-bold">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleReset}
            className="px-6 py-2.5 border border-slate-300 bg-white text-slate-700 font-bold rounded-md hover:bg-slate-50 transition-colors shadow-sm"
          >
            Start New Practice Essay
          </button>
        </div>
      )}
    </div>
  );
}
