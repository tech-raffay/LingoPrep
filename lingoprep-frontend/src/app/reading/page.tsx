"use client";

import { useState } from "react";
import type { Metadata } from "next";

// Placeholder passage — will be fetched from API
const samplePassage = {
  title: "The Impact of Climate Change on Marine Ecosystems",
  content: `Climate change has emerged as one of the most significant threats to marine ecosystems worldwide. Rising ocean temperatures, increasing acidification, and changing current patterns are fundamentally altering the conditions that marine species have adapted to over millions of years.

Coral reefs, often called the "rainforests of the sea," are particularly vulnerable. When water temperatures rise even 1-2°C above the normal summer maximum, corals expel the symbiotic algae living in their tissues, causing them to turn white — a phenomenon known as coral bleaching. If the stress continues, the coral dies. The Great Barrier Reef has experienced several mass bleaching events in recent years, with scientists warning that rising temperatures could render most coral reefs unviable by 2050.

Beyond corals, marine food webs are being disrupted at every level. Phytoplankton, the microscopic organisms that form the base of the ocean food chain, are declining in many regions as warmer surface waters become more stratified, reducing the upwelling of nutrients from deeper layers. This has cascading effects: fewer phytoplankton means less food for zooplankton, which in turn affects fish populations and the larger predators that depend on them.

Ocean acidification, caused by the absorption of excess carbon dioxide from the atmosphere, poses an additional threat. As CO₂ dissolves in seawater, it forms carbonic acid, lowering the pH of the ocean. This makes it harder for organisms like mollusks, sea urchins, and some species of plankton to build their calcium carbonate shells and skeletons. Studies have shown that current rates of acidification are unprecedented in at least the last 300 million years.`,
  questions: [
    {
      id: "q1",
      question_text: "What happens when water temperatures rise 1-2°C above the normal summer maximum?",
      options: [
        { id: "a", text: "Coral reefs grow faster" },
        { id: "b", text: "Corals undergo bleaching by expelling symbiotic algae" },
        { id: "c", text: "Marine species migrate to deeper waters" },
        { id: "d", text: "Phytoplankton populations increase" },
      ],
      correct_option_id: "b",
      explanation: "The passage states that corals expel their symbiotic algae when temperatures rise 1-2°C above normal, causing coral bleaching.",
    },
    {
      id: "q2",
      question_text: "Why is phytoplankton declining in many regions?",
      options: [
        { id: "a", text: "Due to overfishing of zooplankton" },
        { id: "b", text: "Because of increased ocean salinity" },
        { id: "c", text: "Warmer surface waters reduce nutrient upwelling" },
        { id: "d", text: "Light pollution from coastal cities" },
      ],
      correct_option_id: "c",
      explanation: "The passage explains that warmer surface waters become more stratified, reducing the upwelling of nutrients from deeper layers.",
    },
    {
      id: "q3",
      question_text: "What makes ocean acidification particularly concerning according to the passage?",
      options: [
        { id: "a", text: "It only affects tropical waters" },
        { id: "b", text: "Current rates are unprecedented in at least 300 million years" },
        { id: "c", text: "It has no measurable effect yet" },
        { id: "d", text: "It only affects microscopic organisms" },
      ],
      correct_option_id: "b",
      explanation: "The passage states that current rates of acidification are unprecedented in at least the last 300 million years.",
    },
  ],
};

export default function ReadingPage() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId: string, optionId: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const score = submitted
    ? samplePassage.questions.filter(
        (q) => selectedAnswers[q.id] === q.correct_option_id
      ).length
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📖</span>
          <h1 className="text-3xl font-bold">Reading Module</h1>
        </div>
        <p className="text-text-muted">
          Read the passage carefully, then answer the multiple-choice questions below.
        </p>
      </div>

      {/* Passage */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 mb-8">
        <h2 className="text-xl font-bold mb-4">{samplePassage.title}</h2>
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          {samplePassage.content.split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-foreground/80 leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-8">
        {samplePassage.questions.map((q, index) => {
          const isCorrect = submitted && selectedAnswers[q.id] === q.correct_option_id;
          const isWrong = submitted && selectedAnswers[q.id] && selectedAnswers[q.id] !== q.correct_option_id;

          return (
            <div
              key={q.id}
              className={`rounded-2xl border p-6 transition-all ${
                submitted
                  ? isCorrect
                    ? "border-success/50 bg-success/5"
                    : isWrong
                    ? "border-danger/50 bg-danger/5"
                    : "border-border bg-surface"
                  : "border-border bg-surface"
              }`}
            >
              <p className="font-semibold mb-4">
                <span className="text-primary mr-2">Q{index + 1}.</span>
                {q.question_text}
              </p>
              <div className="grid gap-3">
                {q.options.map((opt) => {
                  const isSelected = selectedAnswers[q.id] === opt.id;
                  const isCorrectOpt = submitted && opt.id === q.correct_option_id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(q.id, opt.id)}
                      disabled={submitted}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                        isCorrectOpt
                          ? "border-success bg-success/10 text-success font-medium"
                          : isSelected && submitted
                          ? "border-danger bg-danger/10 text-danger"
                          : isSelected
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border hover:border-primary/50 hover:bg-surface-hover"
                      }`}
                    >
                      <span className="font-mono text-sm mr-3 opacity-60">
                        {opt.id.toUpperCase()}
                      </span>
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {submitted && q.explanation && (
                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm">
                    <span className="font-semibold text-primary">Explanation: </span>
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {submitted ? (
          <div className="flex items-center gap-6">
            <div className="text-lg">
              Score:{" "}
              <span className="font-bold text-2xl gradient-text">
                {score}/{samplePassage.questions.length}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 border border-border rounded-xl font-medium hover:bg-surface-hover transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < samplePassage.questions.length}
            className="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
          >
            Submit Answers ({Object.keys(selectedAnswers).length}/{samplePassage.questions.length})
          </button>
        )}
      </div>
    </div>
  );
}
