"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useExam } from "@/components/theme/ExamThemeProvider";
import Icon from "@/components/brand/Icon";

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
  // Exam theme comes from the shared provider (src/lib/exam.ts), never a
  // local copy — see brand book §07: one accent token, set in one place.
  const { exam: examType, theme: examTheme } = useExam();
  const theme = {
    color: examTheme.accent,
    colorDark: examTheme.accentStrong,
    colorLight: examTheme.accentTint,
    name: examTheme.name,
  };

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
        const res = await api.get(`/api/writing/prompts?exam_type=${examType}`);
        const data = res.data?.data || [];
        setPrompts(data);
        if (data.length > 0) setSelectedPrompt(data[0]);
      } catch {
        setError(`Failed to load ${theme.name} writing prompts.`);
      } finally {
        setLoadingPrompts(false);
      }
    }
    fetchPrompts();
  }, [examType, theme.name]);

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  // Use the /submit endpoint that saves to writing_submissions
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
      const res = await api.get(`/api/writing/prompt/random?exam_type=${examType}`);
      const p = res.data?.data;
      if (p) {
        setSelectedPrompt(p);
        handleReset();
      }
    } catch {
      // silently fail
    }
  };

  const maxBand = examType === "toefl" ? 30 : 9;

  if (loadingPrompts) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Icon name="writing" size={32} className="text-accent" />
          <h1 className="text-3xl font-extrabold text-slate-900">{theme.name} Writing Practice</h1>
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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 pb-5 border-b border-slate-200/80">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-accent-tint text-accent flex items-center justify-center">
            <Icon name="writing" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] sm:text-[28px] font-extrabold text-slate-900 tracking-tight">{theme.name} Writing Assessment</h1>
              <span
                className="text-[10px] font-extrabold uppercase text-white px-2.5 py-0.5 rounded-full tracking-wider"
                style={{ backgroundColor: theme.color }}
              >
                {theme.name}
              </span>
            </div>
            <p className="text-slate-500 text-[13.5px] font-medium mt-0.5">
              Draft a formal academic response based on the prompt instructions.
            </p>
          </div>
        </div>
      </div>

      {/* Prompt Selection buttons */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        {prompts.slice(0, 6).map((p, i) => (
          <button
            key={p.id}
            onClick={() => { setSelectedPrompt(p); handleReset(); }}
            className={`px-4 py-2 rounded-full text-[12.5px] font-bold border transition-all ${
              selectedPrompt?.id === p.id
                ? "text-white shadow-sm"
                : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50/80"
            }`}
            style={
              selectedPrompt?.id === p.id
                ? { backgroundColor: theme.color, borderColor: theme.color }
                : undefined
            }
          >
            Task {p.task_type} (Prompt {i + 1})
          </button>
        ))}
        <button
          onClick={loadRandomPrompt}
          className="px-4 py-2 rounded-full text-[12.5px] font-bold border border-slate-200/80 bg-white hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-xs"
          style={{ color: theme.color }}
        >
          <Icon name="retry" size={16} /> Random topic
        </button>
      </div>

      {/* Prompt Card */}
      {selectedPrompt && (
        <div className="bg-white border border-slate-200/70 rounded-3xl p-7 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider"
              style={{ backgroundColor: theme.colorLight, color: theme.color }}
            >
              {theme.name} Writing
            </span>
            <span className="px-3 py-1 rounded-full text-[10.5px] font-extrabold bg-slate-100 text-slate-700 uppercase tracking-wider">
              Task {selectedPrompt.task_type}
            </span>
            {selectedPrompt.overall > 0 && (
              <span className="px-3 py-1 rounded-full text-[10.5px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase tracking-wider">
                Ref Score: {selectedPrompt.overall}
              </span>
            )}
          </div>
          <p className="text-slate-800 leading-relaxed font-medium text-[15.5px]">{selectedPrompt.question}</p>
          <div className="mt-5 pt-4 border-t border-slate-100 text-[12px] text-slate-400 font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Target Word Count: Minimum {examType === "ielts" ? "250" : "300"} words • Suggested Time: {examType === "ielts" ? "40" : "30"} minutes</span>
          </div>
        </div>
      )}

      {/* Essay Editor */}
      <div className="bg-white border border-slate-200/70 rounded-3xl overflow-hidden mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="flex items-center justify-between px-7 py-4 border-b border-slate-100 bg-slate-50/50 text-[12px] font-extrabold text-slate-500 uppercase tracking-wider">
          <span>Writing Workspace</span>
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${wordCount >= (examType === "ielts" ? 250 : 300) ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-slate-100 text-slate-600"}`}>
            {wordCount} / {examType === "ielts" ? "250" : "300"} words
          </span>
        </div>
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="Type your essay response here..."
          rows={14}
          className="w-full p-7 bg-transparent resize-none focus:outline-none text-slate-900 text-[16px] leading-[1.8] placeholder:text-slate-400"
          disabled={!!evaluation}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-red-50/80 border border-red-200 text-red-700 text-[13.5px] font-semibold flex items-center gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      {!evaluation && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <button
            onClick={handleEvaluate}
            disabled={wordCount < 50 || isEvaluating}
            className="px-8 py-3.5 text-white font-bold rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 text-[13.5px]"
            style={{ backgroundColor: theme.color }}
          >
            {isEvaluating ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Evaluating Essay...
              </span>
            ) : "Submit Essay For AI Evaluation"}
          </button>
          {wordCount > 0 && wordCount < 50 && (
            <p className="text-[13px] text-slate-500 font-semibold">Please write at least 50 words to enable evaluation.</p>
          )}
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <div className="space-y-6">
          {/* Main Result Header Card */}
          <div className="bg-white border border-slate-200/70 rounded-3xl p-7 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h3 className="text-[20px] font-extrabold text-slate-900">{theme.name} Writing Band Score</h3>
                <p className="text-slate-500 text-[13px] mt-1">Evaluated based on official criteria</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 px-6 py-4 rounded-2xl shadow-sm">
                <div className="text-center">
                  <div className="text-5xl font-extrabold leading-none" style={{ color: theme.color }}>
                    {evaluation.overall_band}
                  </div>
                  <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">
                    {examType === "ielts" ? "Band" : "Score"} / {maxBand}
                  </div>
                </div>
              </div>
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
                  {/* Clean progress indicator */}
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(val / (examType === "ielts" ? 9 : 30)) * 100}%`, backgroundColor: theme.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Feedback & Improvements */}
          <div className="bg-white border border-slate-200/70 rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <h4 className="font-bold text-slate-900 text-[16px] mb-4 border-b border-slate-100 pb-3">Assessment Feedback</h4>
            <p className="text-slate-800 leading-relaxed whitespace-pre-line text-[14px]">{evaluation.feedback}</p>
          </div>

          <div className="bg-white border border-slate-200/70 rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <h4 className="font-bold text-slate-900 text-[16px] mb-4 border-b border-slate-100 pb-3">Improvement Suggestions</h4>
            <ul className="space-y-3">
              {evaluation.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-800 text-[14px]">
                  <svg className="w-4 h-4 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke={theme.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleReset}
            className="px-6 py-3 border border-slate-200 bg-white text-slate-700 font-bold text-[13px] rounded-full hover:bg-slate-50 transition-colors shadow-sm"
          >
            Start New Practice Essay
          </button>
        </div>
      )}
    </div>
  );
}

