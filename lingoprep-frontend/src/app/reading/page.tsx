"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Option { id: string; text: string; label: string; }
interface Question { id: string; question_text: string; options: Option[]; correct_option_id: string; explanation?: string; }
interface Passage { id: string; title: string; content: string; word_count: number; difficulty: string; exam_type: string; questions: Question[]; }

export default function ReadingPage() {
  const [passage, setPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [dbResults, setDbResults] = useState<any[] | null>(null);

  useEffect(() => {
    async function fetchPassage() {
      try {
        setLoading(true);
        const response = await api.get("/api/reading/passages");
        const passages = response.data?.data || [];
        if (passages.length > 0) { setPassage(passages[0]); }
        else { setError("No reading passages available."); }
      } catch { setError("Failed to connect to the server."); }
      finally { setLoading(false); }
    }
    fetchPassage();
  }, []);

  const handleSelect = (qId: string, oId: string) => { if (!submitted) setSelectedAnswers((p) => ({ ...p, [qId]: oId })); };

  const handleSubmit = async () => {
    if (!passage) return;
    try {
      const res = await api.post("/api/reading/submit", {
        passage_id: passage.id,
        answers: Object.entries(selectedAnswers).map(([qId, optId]) => ({ question_id: qId, selected_option_id: optId })),
      });
      setScore(res.data.correct_answers);
      setDbResults(res.data.results);
      setSubmitted(true);
    } catch { alert("Failed to submit answers."); }
  };

  const handleReset = () => { setSelectedAnswers({}); setSubmitted(false); setScore(null); setDbResults(null); };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] flex-col gap-3">
        <div className="w-7 h-7 border-2 border-[#c8102e] border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-[#999]">Loading reading passage...</p>
      </div>
    );
  }

  if (error || !passage) {
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
      {/* Top bar — mimics Global Prep test header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e0e0e0]">
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1a1a]">Reading Passage 1</h1>
          <p className="text-[13px] text-[#999]">Academic Module</p>
        </div>
        <span className="px-3 py-1 border border-[#c8102e] text-[#c8102e] text-[12px] font-bold rounded-full">
          Questions 1–{passage.questions.length}
        </span>
      </div>

      {/* Two-column layout: passage | questions */}
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Left: Passage */}
        <div className="bg-white border border-[#e0e0e0] rounded-lg p-6 sm:p-8">
          <h2 className="text-[22px] font-bold text-[#c8102e] leading-snug mb-6">{passage.title}</h2>
          <div className="text-[15px] text-[#333] leading-[1.8] space-y-4">
            {passage.content.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        {/* Right: Questions */}
        <div className="space-y-5">
          <div className="bg-[#fafafa] border border-[#e0e0e0] rounded-lg p-4">
            <p className="text-[13px] font-bold text-[#1a1a1a] mb-1">Questions 1–{passage.questions.length}</p>
            <p className="text-[13px] text-[#666]">Choose the correct letter, <strong>A</strong>, <strong>B</strong>, <strong>C</strong> or <strong>D</strong>.</p>
          </div>

          {passage.questions.map((q, idx) => {
            const result = dbResults?.find((r) => r.question_id === q.id);
            const isCorrect = submitted && result?.is_correct;
            const isWrong = submitted && result && !result.is_correct;

            return (
              <div key={q.id} className={`bg-white border rounded-lg p-5 ${submitted ? (isCorrect ? "border-[#2e7d32]" : isWrong ? "border-[#c8102e]" : "border-[#e0e0e0]") : "border-[#e0e0e0]"}`}>
                <p className="text-[14px] text-[#1a1a1a] mb-4">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#c8102e] text-white text-[12px] font-bold mr-2">{idx + 1}</span>
                  {q.question_text}
                </p>
                <div className="space-y-2 pl-8">
                  {q.options.map((opt) => {
                    const isSel = selectedAnswers[q.id] === opt.id;
                    const isCorrOpt = submitted && opt.id === q.correct_option_id;
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 py-2 px-3 rounded cursor-pointer text-[14px] transition-colors ${
                          isCorrOpt ? "bg-[#e8f5e9] text-[#2e7d32] font-semibold" :
                          isSel && submitted ? "bg-[#fce4ec] text-[#c8102e] font-semibold" :
                          isSel ? "bg-[#fef2f2] text-[#c8102e]" :
                          "hover:bg-[#fafafa] text-[#333]"
                        }`}
                        onClick={() => handleSelect(q.id, opt.id)}
                      >
                        <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          isSel || isCorrOpt ? "border-[#c8102e]" : "border-[#ccc]"
                        }`}>
                          {(isSel || isCorrOpt) && <span className="w-2 h-2 rounded-full bg-[#c8102e]" />}
                        </span>
                        <span className="font-semibold mr-1 text-[#999]">{opt.label}</span>
                        {opt.text}
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
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="mt-6 flex items-center justify-between py-4 border-t border-[#e0e0e0]">
        {submitted && score !== null ? (
          <div className="flex items-center gap-6">
            <p className="text-[15px] text-[#1a1a1a]">
              Score: <span className="font-bold text-[20px]">{score}/{passage.questions.length}</span> correct
            </p>
            <button onClick={handleReset} className="px-5 py-2 border border-[#ddd] text-[#333] font-semibold text-[13px] rounded-full hover:bg-[#fafafa] transition-colors">
              Try again
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < passage.questions.length}
            className="px-6 py-2.5 bg-[#1a1a1a] text-white font-semibold text-[13px] rounded-full hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        )}
        <div className="flex items-center gap-2 text-[12px] text-[#999]">
          {passage.questions.map((_, i) => (
            <span
              key={i}
              className={`w-7 h-7 flex items-center justify-center rounded font-bold ${
                selectedAnswers[passage.questions[i].id]
                  ? "bg-[#c8102e] text-white"
                  : "bg-[#f0f0f0] text-[#666]"
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
