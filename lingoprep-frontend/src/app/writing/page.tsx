"use client";

import { useState } from "react";

const samplePrompts = [
  {
    id: "p1",
    exam: "IELTS",
    task: "Task 2",
    prompt: "Some people believe that universities should focus on providing academic skills, while others think they should prepare students for employment. Discuss both views and give your opinion.",
    min_words: 250,
  },
  {
    id: "p2",
    exam: "TOEFL",
    task: "Independent",
    prompt: "Do you agree or disagree with the following statement? Technology has made our lives more complicated rather than simpler. Use specific reasons and examples to support your answer.",
    min_words: 300,
  },
];

// Placeholder evaluation result
const sampleEvaluation = {
  overall_band: 6.5,
  task_achievement: 7.0,
  coherence_cohesion: 6.5,
  lexical_resource: 6.0,
  grammatical_range: 6.5,
  feedback: "Your essay demonstrates a clear position with relevant supporting ideas. However, the development of ideas could be more thorough with more specific examples. Your use of cohesive devices is generally effective, though there is some repetition.",
  suggestions: [
    "Use more specific, real-world examples to support your arguments",
    "Vary your sentence structures — mix simple, compound, and complex sentences",
    "Strengthen your conclusion by summarizing key points and restating your position",
    "Expand your vocabulary by using more academic word list (AWL) terms",
  ],
};

const bandLabels: Record<string, string> = {
  task_achievement: "Task Achievement",
  coherence_cohesion: "Coherence & Cohesion",
  lexical_resource: "Lexical Resource",
  grammatical_range: "Grammatical Range & Accuracy",
};

export default function WritingPage() {
  const [selectedPrompt, setSelectedPrompt] = useState(samplePrompts[0]);
  const [essay, setEssay] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<typeof sampleEvaluation | null>(null);

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  const handleEvaluate = async () => {
    if (wordCount < 50) return;
    setIsEvaluating(true);
    // Simulate API call — will be replaced with real POST to /api/writing/evaluate
    await new Promise((r) => setTimeout(r, 2500));
    setEvaluation(sampleEvaluation);
    setIsEvaluating(false);
  };

  const handleReset = () => {
    setEssay("");
    setEvaluation(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">✍️</span>
          <h1 className="text-3xl font-bold">Writing Module</h1>
        </div>
        <p className="text-text-muted">Write an essay in response to the prompt. Our AI will evaluate your writing.</p>
      </div>

      {/* Prompt Selection */}
      <div className="flex gap-3 mb-6">
        {samplePrompts.map((p) => (
          <button key={p.id} onClick={() => { setSelectedPrompt(p); handleReset(); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedPrompt.id === p.id ? "bg-primary text-white shadow-lg shadow-primary/25" : "border border-border hover:bg-surface-hover"}`}>
            {p.exam} — {p.task}
          </button>
        ))}
      </div>

      {/* Prompt Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{selectedPrompt.exam}</span>
          <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-bold">{selectedPrompt.task}</span>
        </div>
        <p className="text-foreground leading-relaxed">{selectedPrompt.prompt}</p>
        <p className="text-sm text-text-muted mt-3">Minimum {selectedPrompt.min_words} words</p>
      </div>

      {/* Essay Editor */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface-hover/50">
          <span className="text-sm font-medium">Your Essay</span>
          <span className={`text-sm font-mono ${wordCount >= selectedPrompt.min_words ? "text-success" : "text-text-muted"}`}>
            {wordCount} / {selectedPrompt.min_words}+ words
          </span>
        </div>
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="Start writing your essay here..."
          rows={14}
          className="w-full p-6 bg-transparent resize-none focus:outline-none text-foreground leading-relaxed placeholder:text-text-muted/50"
          disabled={!!evaluation}
        />
      </div>

      {/* Actions */}
      {!evaluation && (
        <div className="flex items-center gap-4">
          <button onClick={handleEvaluate}
            disabled={wordCount < 50 || isEvaluating}
            className="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/25">
            {isEvaluating ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Evaluating with AI...
              </span>
            ) : "Evaluate Essay"}
          </button>
          {wordCount > 0 && wordCount < 50 && (
            <p className="text-sm text-text-muted">Write at least 50 words to enable evaluation</p>
          )}
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <div className="space-y-6">
          {/* Overall Band */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white">
            <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-2">Overall Band Score</p>
            <div className="flex items-end gap-3">
              <span className="text-6xl font-bold">{evaluation.overall_band}</span>
              <span className="text-xl text-white/70 mb-2">/ 9.0</span>
            </div>
          </div>

          {/* Sub-scores */}
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(bandLabels).map(([key, label]) => {
              const val = evaluation[key as keyof typeof evaluation] as number;
              return (
                <div key={key} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="font-bold text-lg">{val}</span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-700"
                      style={{ width: `${(val / 9) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-bold text-lg mb-3">📝 Detailed Feedback</h3>
            <p className="text-text-muted leading-relaxed">{evaluation.feedback}</p>
          </div>

          {/* Suggestions */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-bold text-lg mb-3">💡 Improvement Suggestions</h3>
            <ul className="space-y-2">
              {evaluation.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-text-muted">
                  <span className="text-primary mt-0.5">→</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <button onClick={handleReset}
            className="px-6 py-2.5 border border-border rounded-xl font-medium hover:bg-surface-hover transition-colors">
            Write Another Essay
          </button>
        </div>
      )}
    </div>
  );
}
