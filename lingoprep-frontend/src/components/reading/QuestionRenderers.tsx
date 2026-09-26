"use client";

import React from "react";
import type {
  MCQQuestion,
  QuestionGroup,
  ReadingQuestionType,
} from "@/types";

/* ════════════════════════════════════════════════════════════════════════════
   Visual Question Renderers for IELTS Academic Reading
   Supports all 14 official question types with proper visual rendering.
   ════════════════════════════════════════════════════════════════════════════ */

interface RendererProps {
  group: QuestionGroup;
  selectedAnswers: Record<string, string>;
  onSelectOption: (qId: string, optionId: string) => void;
  onTextAnswer: (qId: string, text: string) => void;
  getOverallNumber: (qId: string) => number;
  theme: { color: string; colorDark: string; colorLight: string };
  submitted: boolean;
  dbResults?: any[] | null;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
}

/* ── Group header with instructions ──────────────────────────────────────── */
function GroupInstruction({ type, data }: { type: ReadingQuestionType; data: any }) {
  // User explicitly requested to remove the instruction bar from:
  // Q6–9 (tfng), Q10–13 (sentence_completion), and Q27–31 (yng)
  if (type === "tfng" || type === "yng" || type === "sentence_completion" || data?.hide_instruction) {
    return null;
  }

  const instructions: Record<string, string> = {
    multiple_choice: "Choose the correct letter, A, B, C or D.",
    tfng: "Do the following statements agree with the information given in the reading passage? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.",
    yng: "Do the following statements agree with the views/claims of the writer? Write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.",
    matching_headings: "Choose the correct heading for each section from the list of headings below.",
    matching_info: "Which paragraph contains the following information?",
    matching_features: "Look at the following statements and the list of people/features below. Match each statement with the correct person/feature.",
    matching_sentence_endings: "Complete each sentence with the correct ending, A–" + (data?.endings?.length ? String.fromCharCode(64 + data.endings.length) : "G") + ", below.",
    sentence_completion: `Complete the sentences below. Choose NO MORE THAN ${data?.max_words || 3} WORDS from the passage for each answer.`,
    summary_completion: data?.has_word_list
      ? "Complete the summary below. Choose ONE WORD ONLY from the list below for each answer."
      : `Complete the summary below. Choose NO MORE THAN ${data?.max_words || 2} WORDS from the passage for each answer.`,
    note_completion: `Complete the notes below. Choose NO MORE THAN ${data?.max_words || 2} WORDS from the passage for each answer.`,
    table_completion: `Complete the table below. Choose NO MORE THAN ${data?.max_words || 3} WORDS from the passage for each answer.`,
    flowchart_completion: `Complete the flow chart below. Choose NO MORE THAN ${data?.max_words || 2} WORDS from the passage for each answer.`,
    diagram_label: `Label the diagram below. Choose NO MORE THAN ${data?.max_words || 2} WORDS from the passage for each answer.`,
    short_answer: `Answer the questions below. Choose NO MORE THAN ${data?.max_words || 3} WORDS from the passage for each answer.`,
  };

  return (
    <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-[12.5px] text-amber-900 leading-relaxed">
      <p className="font-bold text-[13px] mb-1">{instructions[type] || "Answer the questions below."}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   OPTION-BASED RENDERERS (MCQ, TFNG, YNG)
   ═══════════════════════════════════════════════════════════════════════════ */

function MCQRenderer({
  group, selectedAnswers, onSelectOption, getOverallNumber, theme, submitted, dbResults, questionRefs,
}: RendererProps) {
  return (
    <>
      {group.questions.map((q) => {
        const num = getOverallNumber(q.id);
        const userSel = selectedAnswers[q.id];
        const dbRes = dbResults?.find((r: any) => r.question_id === q.id);

        return (
          <div
            key={q.id}
            ref={(el) => { questionRefs.current[q.id] = el; }}
            className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
              submitted
                ? dbRes?.is_correct
                  ? "border-[var(--success)] bg-[var(--success-tint)]"
                  : "border-[var(--error)] bg-[var(--error-tint)]"
                : userSel ? "border-slate-300" : "border-slate-200"
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[12px] font-extrabold flex-shrink-0"
                style={{ backgroundColor: theme.color }}
              >
                {num}
              </span>
              <p className="text-[14.5px] font-semibold text-slate-900 leading-snug pt-0.5">
                {q.question_text}
              </p>
            </div>

            <div className="space-y-2 pl-10">
              {q.options.map((opt) => {
                const isSelected = userSel === opt.id;
                const isCorrectOption = opt.id === q.correct_option_id;

                if (submitted) {
                  let style = "border-slate-200 text-slate-600";
                  if (isCorrectOption) style = "bg-[var(--success-tint)] text-[var(--success)] font-bold border-[var(--success)]";
                  else if (isSelected && !dbRes?.is_correct) style = "bg-[var(--error-tint)] text-[var(--error)] font-bold border-[var(--error)]";

                  return (
                    <div key={opt.id} className={`flex items-center gap-3 py-2.5 px-4 rounded-xl border text-[13.5px] ${style}`}>
                      <span className="font-bold w-4 text-slate-400">{opt.label}.</span>
                      <span className="flex-1">{opt.text}</span>
                      {isCorrectOption && <span className="text-[11px] font-bold text-[var(--success)] uppercase tracking-[.12em]">Correct</span>}
                      {isSelected && !dbRes?.is_correct && <span className="text-[11px] font-bold text-[var(--error)] uppercase tracking-[.12em]">Your answer</span>}
                    </div>
                  );
                }

                return (
                  <label
                    key={opt.id}
                    onClick={() => onSelectOption(q.id, opt.id)}
                    className={`flex items-center gap-3 py-2.5 px-4 rounded-xl border cursor-pointer text-[13.5px] transition-all select-none ${
                      isSelected
                        ? "font-semibold border-transparent shadow-sm"
                        : "border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700"
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: theme.colorLight, borderColor: theme.color, color: theme.color }
                        : undefined
                    }
                  >
                    <span
                      className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                      style={isSelected ? { borderColor: theme.color } : { borderColor: "#CBD5E1" }}
                    >
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.color }} />
                      )}
                    </span>
                    <span className="font-bold w-4 text-slate-400">{opt.label}.</span>
                    <span className="flex-1">{opt.text}</span>
                  </label>
                );
              })}
            </div>

            {submitted && q.explanation && (
              <div className="mt-4 ml-10 p-3 bg-white border-l-4 border-emerald-500 rounded-r-lg text-[13px] text-slate-600">
                <strong className="text-emerald-700">Explanation:</strong> {q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MATCHING RENDERERS (Headings, Info, Features, Sentence Endings)
   ═══════════════════════════════════════════════════════════════════════════ */

function MatchingRenderer({
  group, selectedAnswers, onTextAnswer, getOverallNumber, theme, submitted, dbResults, questionRefs,
}: RendererProps) {
  const { type, data } = group;

  // Determine the options list based on type
  let matchOptions: { label: string; text: string }[] = [];
  if (type === "matching_headings" && data.headings) matchOptions = data.headings;
  else if (type === "matching_features" && data.features) matchOptions = data.features;
  else if (type === "matching_sentence_endings" && data.endings) matchOptions = data.endings;
  else if (type === "matching_info" && data.paragraphs) {
    matchOptions = data.paragraphs.map((p: string) => ({ label: p, text: `Paragraph ${p}` }));
  }

  return (
    <>
      {/* Show the options list as a reference box */}
      {matchOptions.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            {type === "matching_headings" ? "List of Headings" :
             type === "matching_features" ? "List of Features" :
             type === "matching_sentence_endings" ? "List of Endings" :
             "Paragraph Labels"}
          </p>
          <div className="space-y-1.5">
            {matchOptions.map((opt) => (
              <div key={opt.label} className="flex items-start gap-2 text-[13px] text-slate-700">
                <span className="font-bold text-slate-500 min-w-[24px]">{opt.label}.</span>
                <span>{opt.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Render each question with a dropdown */}
      {group.questions.map((q) => {
        const num = getOverallNumber(q.id);
        const userVal = selectedAnswers[q.id] || "";
        const dbRes = dbResults?.find((r: any) => r.question_id === q.id);

        return (
          <div
            key={q.id}
            ref={(el) => { questionRefs.current[q.id] = el; }}
            className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
              submitted
                ? dbRes?.is_correct
                  ? "border-[var(--success)] bg-[var(--success-tint)]"
                  : "border-[var(--error)] bg-[var(--error-tint)]"
                : userVal ? "border-slate-300" : "border-slate-200"
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[12px] font-extrabold flex-shrink-0"
                style={{ backgroundColor: theme.color }}
              >
                {num}
              </span>
              <p className="text-[14.5px] font-semibold text-slate-900 leading-snug pt-0.5 flex-1">
                {q.question_text}
              </p>
            </div>

            <div className="pl-10">
              {submitted ? (
                <div className="space-y-1">
                  <p className="text-[13px]">
                    <span className="font-semibold text-slate-600">Your answer: </span>
                    <span className={dbRes?.is_correct ? "text-[var(--success)] font-bold" : "text-[var(--error)] font-bold"}>
                      {userVal || "(no answer)"}
                    </span>
                  </p>
                  {!dbRes?.is_correct && (
                    <p className="text-[13px]">
                      <span className="font-semibold text-slate-600">Correct answer: </span>
                      <span className="text-[var(--success)] font-bold">{dbRes?.correct_answer_text || q.correct_answer_text}</span>
                    </p>
                  )}
                </div>
              ) : (
                <select
                  value={userVal}
                  onChange={(e) => onTextAnswer(q.id, e.target.value)}
                  className="w-full max-w-xs px-4 py-2.5 border border-slate-300 rounded-xl text-[13.5px] text-slate-800 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer"
                  style={{ focusRingColor: theme.color } as any}
                >
                  <option value="">— Select —</option>
                  {matchOptions.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label}{type !== "matching_info" ? `. ${opt.text}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {submitted && q.explanation && (
              <div className="mt-3 ml-10 p-3 bg-white border-l-4 border-emerald-500 rounded-r-lg text-[13px] text-slate-600">
                <strong className="text-emerald-700">Explanation:</strong> {q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TEXT INPUT RENDERER (Sentence Completion, Short Answer)
   ═══════════════════════════════════════════════════════════════════════════ */

function TextInputRenderer({
  group, selectedAnswers, onTextAnswer, getOverallNumber, theme, submitted, dbResults, questionRefs,
}: RendererProps) {
  return (
    <>
      {group.questions.map((q) => {
        const num = getOverallNumber(q.id);
        const userVal = selectedAnswers[q.id] || "";
        const dbRes = dbResults?.find((r: any) => r.question_id === q.id);

        return (
          <div
            key={q.id}
            ref={(el) => { questionRefs.current[q.id] = el; }}
            className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
              submitted
                ? dbRes?.is_correct
                  ? "border-[var(--success)] bg-[var(--success-tint)]"
                  : "border-[var(--error)] bg-[var(--error-tint)]"
                : userVal ? "border-slate-300" : "border-slate-200"
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[12px] font-extrabold flex-shrink-0"
                style={{ backgroundColor: theme.color }}
              >
                {num}
              </span>
              <p className="text-[14.5px] font-semibold text-slate-900 leading-snug pt-0.5 flex-1">
                {q.question_text}
              </p>
            </div>

            <div className="pl-10">
              {submitted ? (
                <div className="space-y-1">
                  <p className="text-[13px]">
                    <span className="font-semibold text-slate-600">Your answer: </span>
                    <span className={dbRes?.is_correct ? "text-[var(--success)] font-bold" : "text-[var(--error)] font-bold"}>
                      {userVal || "(no answer)"}
                    </span>
                  </p>
                  {!dbRes?.is_correct && (
                    <p className="text-[13px]">
                      <span className="font-semibold text-slate-600">Correct answer: </span>
                      <span className="text-[var(--success)] font-bold">{dbRes?.correct_answer_text || q.correct_answer_text}</span>
                    </p>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={userVal}
                  onChange={(e) => onTextAnswer(q.id, e.target.value)}
                  placeholder={`Type your answer (max ${q.question_data?.max_words || 3} words)…`}
                  className="w-full max-w-md px-4 py-2.5 border border-slate-300 rounded-xl text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                />
              )}
            </div>

            {submitted && q.explanation && (
              <div className="mt-3 ml-10 p-3 bg-white border-l-4 border-emerald-500 rounded-r-lg text-[13px] text-slate-600">
                <strong className="text-emerald-700">Explanation:</strong> {q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUMMARY COMPLETION RENDERER
   ═══════════════════════════════════════════════════════════════════════════ */

function SummaryRenderer({
  group, selectedAnswers, onTextAnswer, getOverallNumber, theme, submitted, dbResults, questionRefs,
}: RendererProps) {
  const { data, questions } = group;
  const summaryText = data.summary_text || "";
  const wordList = data.word_list || [];

  // Split summary text on __BLANK__ markers
  const parts = summaryText.split(/__BLANK__/);
  let blankIdx = 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      {/* Word list box (if provided) */}
      {wordList.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Word List</p>
          <div className="flex flex-wrap gap-2">
            {wordList.map((word: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-[13px] font-medium text-slate-700">
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary with inline blanks */}
      <div className="text-[14px] text-slate-800 leading-[2.2]">
        {parts.map((part, i) => {
          const isLast = i === parts.length - 1;
          const q = !isLast && blankIdx < questions.length ? questions[blankIdx] : null;
          const currentBlank = blankIdx;
          if (!isLast) blankIdx++;

          return (
            <React.Fragment key={i}>
              <span>{part}</span>
              {q && (
                <span
                  className="inline-flex items-center gap-1 mx-1 align-middle"
                  ref={(el) => { questionRefs.current[q.id] = el; }}
                >
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
                    style={{ backgroundColor: theme.color }}
                  >
                    {getOverallNumber(q.id)}
                  </span>
                  {submitted ? (
                    (() => {
                      const dbRes = dbResults?.find((r: any) => r.question_id === q.id);
                      const userVal = selectedAnswers[q.id] || "";
                      return (
                        <span className={`inline-block px-2 py-0.5 rounded border text-[13px] font-bold ${
                          dbRes?.is_correct
                            ? "bg-[var(--success-tint)] text-[var(--success)] border-[var(--success)]"
                            : "bg-[var(--error-tint)] text-[var(--error)] border-[var(--error)]"
                        }`}>
                          {userVal || "—"} {!dbRes?.is_correct && <span className="text-[var(--success)]">({dbRes?.correct_answer_text || q.correct_answer_text})</span>}
                        </span>
                      );
                    })()
                  ) : wordList.length > 0 ? (
                    <select
                      value={selectedAnswers[q.id] || ""}
                      onChange={(e) => onTextAnswer(q.id, e.target.value)}
                      className="inline-block w-36 px-2 py-1 border border-slate-300 rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 transition-all"
                    >
                      <option value="">______</option>
                      {wordList.map((w: string, wi: number) => (
                        <option key={wi} value={w}>{w}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={selectedAnswers[q.id] || ""}
                      onChange={(e) => onTextAnswer(q.id, e.target.value)}
                      placeholder="________"
                      className="inline-block w-36 px-2 py-1 border-b-2 border-slate-400 bg-transparent text-[13px] text-slate-800 focus:outline-none focus:border-current transition-all text-center"
                      style={{ borderBottomColor: selectedAnswers[q.id] ? theme.color : undefined }}
                    />
                  )}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NOTE COMPLETION RENDERER
   ═══════════════════════════════════════════════════════════════════════════ */

function NoteRenderer({
  group, selectedAnswers, onTextAnswer, getOverallNumber, theme, submitted, dbResults, questionRefs,
}: RendererProps) {
  const { data, questions } = group;
  const notes = data.notes || [];
  let blankIdx = 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="space-y-4">
        {notes.map((section: any, si: number) => (
          <div key={si}>
            <h4 className="text-[14px] font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">
              {section.heading}
            </h4>
            <ul className="space-y-2 pl-5">
              {section.items.map((item: string, ii: number) => {
                const itemParts = item.split(/__BLANK__/);
                return (
                  <li key={ii} className="text-[13.5px] text-slate-700 list-disc leading-relaxed">
                    {itemParts.map((part: string, pi: number) => {
                      const isLast = pi === itemParts.length - 1;
                      const q = !isLast && blankIdx < questions.length ? questions[blankIdx] : null;
                      if (!isLast) blankIdx++;

                      return (
                        <React.Fragment key={pi}>
                          <span>{part}</span>
                          {q && (
                            <span
                              className="inline-flex items-center gap-1 mx-1"
                              ref={(el) => { questionRefs.current[q.id] = el; }}
                            >
                              <span
                                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
                                style={{ backgroundColor: theme.color }}
                              >
                                {getOverallNumber(q.id)}
                              </span>
                              {submitted ? (
                                (() => {
                                  const dbRes = dbResults?.find((r: any) => r.question_id === q.id);
                                  const userVal = selectedAnswers[q.id] || "";
                                  return (
                                    <span className={`inline-block px-2 py-0.5 rounded border text-[12px] font-bold ${
                                      dbRes?.is_correct
                                        ? "bg-[var(--success-tint)] text-[var(--success)] border-[var(--success)]"
                                        : "bg-[var(--error-tint)] text-[var(--error)] border-[var(--error)]"
                                    }`}>
                                      {userVal || "—"} {!dbRes?.is_correct && <span className="text-[var(--success)]">({dbRes?.correct_answer_text || q.correct_answer_text})</span>}
                                    </span>
                                  );
                                })()
                              ) : (
                                <input
                                  type="text"
                                  value={selectedAnswers[q.id] || ""}
                                  onChange={(e) => onTextAnswer(q.id, e.target.value)}
                                  placeholder="________"
                                  className="inline-block w-32 px-2 py-1 border-b-2 border-slate-400 bg-transparent text-[13px] text-center focus:outline-none transition-all"
                                  style={{ borderBottomColor: selectedAnswers[q.id] ? theme.color : undefined }}
                                />
                              )}
                            </span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE COMPLETION RENDERER — Actual HTML table with input cells
   ═══════════════════════════════════════════════════════════════════════════ */

function TableRenderer({
  group, selectedAnswers, onTextAnswer, getOverallNumber, theme, submitted, dbResults, questionRefs,
}: RendererProps) {
  const { data, questions } = group;
  const columns = data.columns || [];
  const rows = data.rows || [];
  let blankIdx = 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm overflow-x-auto">
      <table className="w-full border-collapse min-w-[400px]">
        <thead>
          <tr>
            {columns.map((col: string, ci: number) => (
              <th
                key={ci}
                className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wider border-b-2"
                style={{ borderBottomColor: theme.color, color: theme.color }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: string[], ri: number) => (
            <tr key={ri} className={ri % 2 === 0 ? "bg-slate-50/50" : "bg-white"}>
              {row.map((cell: string, ci: number) => {
                const isBlank = cell === "__BLANK__";
                const q = isBlank && blankIdx < questions.length ? questions[blankIdx] : null;
                if (isBlank) blankIdx++;

                return (
                  <td key={ci} className="px-4 py-3 border-b border-slate-200 text-[13.5px] text-slate-700">
                    {isBlank && q ? (
                      <div
                        className="flex items-center gap-2"
                        ref={(el) => { questionRefs.current[q.id] = el; }}
                      >
                        <span
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold flex-shrink-0"
                          style={{ backgroundColor: theme.color }}
                        >
                          {getOverallNumber(q.id)}
                        </span>
                        {submitted ? (
                          (() => {
                            const dbRes = dbResults?.find((r: any) => r.question_id === q.id);
                            const userVal = selectedAnswers[q.id] || "";
                            return (
                              <span className={`px-2 py-0.5 rounded border text-[12px] font-bold ${
                                dbRes?.is_correct
                                  ? "bg-[var(--success-tint)] text-[var(--success)] border-[var(--success)]"
                                  : "bg-[var(--error-tint)] text-[var(--error)] border-[var(--error)]"
                              }`}>
                                {userVal || "—"} {!dbRes?.is_correct && <span className="text-[var(--success)]">({dbRes?.correct_answer_text || q.correct_answer_text})</span>}
                              </span>
                            );
                          })()
                        ) : (
                          <input
                            type="text"
                            value={selectedAnswers[q.id] || ""}
                            onChange={(e) => onTextAnswer(q.id, e.target.value)}
                            placeholder="________"
                            className="w-full px-2 py-1.5 border border-dashed border-slate-400 rounded-lg text-[13px] bg-amber-50/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                          />
                        )}
                      </div>
                    ) : (
                      <span className="font-medium">{cell}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FLOW-CHART COMPLETION RENDERER — Visual flowchart with arrows
   ═══════════════════════════════════════════════════════════════════════════ */

function FlowchartRenderer({
  group, selectedAnswers, onTextAnswer, getOverallNumber, theme, submitted, dbResults, questionRefs,
}: RendererProps) {
  const { data, questions } = group;
  const nodes = data.nodes || [];
  let blankIdx = 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col items-center gap-0">
        {nodes.map((node: any, ni: number) => {
          const isBlank = node.is_blank;
          const q = isBlank && blankIdx < questions.length ? questions[blankIdx] : null;
          if (isBlank) blankIdx++;
          const isLast = ni === nodes.length - 1;

          return (
            <React.Fragment key={ni}>
              {/* Node box */}
              <div
                className={`w-full max-w-xs border-2 rounded-xl px-5 py-3.5 text-center transition-all ${
                  isBlank
                    ? "border-dashed bg-amber-50/70"
                    : "bg-slate-50 border-slate-300"
                }`}
                style={isBlank ? { borderColor: theme.color } : undefined}
                ref={q ? (el) => { questionRefs.current[q.id] = el; } : undefined}
              >
                {isBlank && q ? (
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[11px] font-bold"
                      style={{ backgroundColor: theme.color }}
                    >
                      {getOverallNumber(q.id)}
                    </span>
                    {submitted ? (
                      (() => {
                        const dbRes = dbResults?.find((r: any) => r.question_id === q.id);
                        const userVal = selectedAnswers[q.id] || "";
                        return (
                          <span className={`px-3 py-1 rounded-lg border text-[13px] font-bold ${
                            dbRes?.is_correct
                              ? "bg-[var(--success-tint)] text-[var(--success)] border-[var(--success)]"
                              : "bg-[var(--error-tint)] text-[var(--error)] border-[var(--error)]"
                          }`}>
                            {userVal || "—"} {!dbRes?.is_correct && <span className="text-[var(--success)]">({dbRes?.correct_answer_text || q.correct_answer_text})</span>}
                          </span>
                        );
                      })()
                    ) : (
                      <input
                        type="text"
                        value={selectedAnswers[q.id] || ""}
                        onChange={(e) => onTextAnswer(q.id, e.target.value)}
                        placeholder="Type answer…"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-[13px] text-center bg-white focus:outline-none focus:ring-2 transition-all"
                      />
                    )}
                  </div>
                ) : (
                  <span className="text-[13.5px] font-semibold text-slate-800">{node.text}</span>
                )}
              </div>

              {/* Arrow connector */}
              {!isLast && (
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-5 bg-slate-400" />
                  <svg width="12" height="8" viewBox="0 0 12 8" className="text-slate-400">
                    <path d="M6 8L0 0h12L6 8z" fill="currentColor" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DIAGRAM LABEL RENDERER — Visual technical diagram with labeled positions
   ═══════════════════════════════════════════════════════════════════════════ */

function DiagramRenderer({
  group, selectedAnswers, onTextAnswer, getOverallNumber, theme, submitted, dbResults, questionRefs,
}: RendererProps) {
  const { data, questions } = group;
  const elements = data.elements || [];
  const title = data.diagram_title || "Structure of a Deep-Sea Photophore (Light-Producing Organ)";
  const description = data.diagram_description || "Label the cross-section diagram below using words from the passage.";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
      <div className="text-center mb-5">
        <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200/60 inline-block mb-1.5">
          Technical Diagram
        </span>
        <h4 className="text-[15px] font-bold text-slate-800">{title}</h4>
        {description && (
          <p className="text-[12px] text-slate-500 mt-1 italic">{description}</p>
        )}
      </div>

      {/* SVG Technical Diagram Container */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 mb-6 shadow-inner border border-slate-800 relative overflow-hidden">
        <svg viewBox="0 0 480 260" className="w-full h-auto select-none max-w-lg mx-auto">
          <defs>
            {/* Photogenic Reaction Glow */}
            <radialGradient id="reactionGlow" cx="48%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="1" />
              <stop offset="60%" stopColor="#0891b2" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0e7490" stopOpacity="0.4" />
            </radialGradient>
            {/* Reflector Metallic Sheen */}
            <linearGradient id="reflectorSheen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            {/* Emitted Light Beam */}
            <linearGradient id="exitBeam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Forward Emitted Light Beam */}
          <polygon points="340,100 470,60 470,200 340,160" fill="url(#exitBeam)" />

          {/* Blood vessels & Nerve Supply entering from the back (left) */}
          <path d="M 30,120 Q 70,125 110,130" fill="none" stroke="#ef4444" strokeWidth="2.5" />
          <path d="M 30,135 Q 75,130 115,133" fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="3 2" />
          <text x="35" y="112" fontSize="9" fill="#94a3b8" fontStyle="italic">Nerve &amp; blood supply</text>

          {/* Layer 4 (Outermost Back): Dark Pigment Shield */}
          <path
            d="M 160,35 C 70,70 70,190 160,225 L 180,215 C 100,185 100,75 180,45 Z"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Layer 3: Guanine Crystal Reflector */}
          <path
            d="M 180,45 C 110,80 110,180 180,215 L 205,205 C 145,175 145,85 205,55 Z"
            fill="url(#reflectorSheen)"
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Layer 2: Central Photogenic Mass (Core) */}
          <ellipse cx="230" cy="130" rx="55" ry="60" fill="url(#reactionGlow)" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Internal Reaction particles */}
          <circle cx="215" cy="115" r="2.5" fill="#ffffff" />
          <circle cx="240" cy="120" r="3" fill="#ffffff" />
          <circle cx="225" cy="140" r="2.5" fill="#ffffff" />
          <circle cx="245" cy="145" r="2" fill="#ffffff" />
          <circle cx="230" cy="105" r="2" fill="#ffffff" />

          {/* Layer 1 (Front): Transparent Gelatinous Lens */}
          <path
            d="M 285,75 C 330,95 330,165 285,185 C 300,160 300,100 285,75 Z"
            fill="#bae6fd"
            fillOpacity="0.75"
            stroke="#7dd3fc"
            strokeWidth="2"
          />

          {/* Callout Lines & Indicator Pins */}

          {/* Callout 1 (Lens): points to front lens (310, 130) */}
          <line x1="310" y1="130" x2="390" y2="70" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="310" cy="130" r="3.5" fill="#38bdf8" />
          <rect x="390" y="58" width="80" height="22" rx="11" fill="#0284c7" />
          <text x="430" y="73" textAnchor="middle" fontSize="10" fontWeight="extrabold" fill="#ffffff">
            [{questions[0] ? getOverallNumber(questions[0].id) : "23"}] LENS
          </text>

          {/* Callout 2 (Photogenic cells): points to core (230, 130) */}
          <line x1="230" y1="90" x2="230" y2="25" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="230" cy="90" r="3.5" fill="#38bdf8" />
          <rect x="180" y="15" width="105" height="22" rx="11" fill="#0284c7" />
          <text x="232" y="30" textAnchor="middle" fontSize="10" fontWeight="extrabold" fill="#ffffff">
            [{questions[1] ? getOverallNumber(questions[1].id) : "24"}] PHOTOCYTES
          </text>

          {/* Callout 3 (Reflector layer): points to reflector (165, 140) */}
          <line x1="165" y1="140" x2="165" y2="235" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="165" cy="140" r="3.5" fill="#cbd5e1" />
          <rect x="110" y="225" width="115" height="22" rx="11" fill="#475569" />
          <text x="167" y="240" textAnchor="middle" fontSize="10" fontWeight="extrabold" fill="#ffffff">
            [{questions[2] ? getOverallNumber(questions[2].id) : "25"}] REFLECTOR
          </text>

          {/* Callout 4 (Pigment shield): points to outer backing (110, 100) */}
          <line x1="110" y1="100" x2="50" y2="50" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="110" cy="100" r="3.5" fill="#94a3b8" />
          <rect x="10" y="40" width="95" height="22" rx="11" fill="#334155" />
          <text x="57" y="55" textAnchor="middle" fontSize="10" fontWeight="extrabold" fill="#ffffff">
            [{questions[3] ? getOverallNumber(questions[3].id) : "26"}] SHIELD
          </text>
        </svg>
      </div>

      {/* Label Entry Controls */}
      <div className="space-y-3">
        {questions.map((q, idx) => {
          const num = getOverallNumber(q.id);
          const userVal = selectedAnswers[q.id] || "";
          const dbRes = dbResults?.find((r: any) => r.question_id === q.id);
          const clue = elements[idx]?.clue || q.question_text || `Label for element ${idx + 1}`;

          return (
            <div
              key={q.id}
              ref={(el) => { questionRefs.current[q.id] = el; }}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                submitted
                  ? dbRes?.is_correct
                    ? "bg-[var(--success-tint)] border-[var(--success)]"
                    : "bg-[var(--error-tint)] border-[var(--error)]"
                  : userVal.trim()
                    ? "bg-slate-50 border-slate-300"
                    : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[12px] font-extrabold flex-shrink-0"
                  style={{ backgroundColor: theme.color }}
                >
                  {num}
                </span>
                <span className="text-[13px] font-semibold text-slate-700 truncate">
                  {clue}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:w-64">
                {submitted ? (
                  <div className="w-full">
                    <span className={`block px-3 py-1.5 rounded-lg border text-[13px] font-bold ${
                      dbRes?.is_correct
                        ? "bg-[var(--success-tint)] text-[var(--success)] border-[var(--success)]"
                        : "bg-[var(--error-tint)] text-[var(--error)] border-[var(--error)]"
                    }`}>
                      {userVal || "(no answer)"}
                      {!dbRes?.is_correct && (
                        <span className="block text-[11px] text-[var(--success)] mt-0.5">
                          Correct: {dbRes?.correct_answer_text || q.correct_answer_text}
                        </span>
                      )}
                    </span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={userVal}
                    onChange={(e) => onTextAnswer(q.id, e.target.value)}
                    placeholder="Type answer here..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-[13px] bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN DISPATCHER — Renders the correct component for each question group
   ═══════════════════════════════════════════════════════════════════════════ */

export default function QuestionGroupRenderer(props: RendererProps) {
  const { group } = props;

  return (
    <div className="space-y-4">
      {/* Group instruction banner */}
      <GroupInstruction type={group.type} data={group.data} />

      {/* Dispatch to the correct visual renderer */}
      {(() => {
        switch (group.type) {
          case "multiple_choice":
          case "tfng":
          case "yng":
            return <MCQRenderer {...props} />;

          case "matching_headings":
          case "matching_info":
          case "matching_features":
          case "matching_sentence_endings":
            return <MatchingRenderer {...props} />;

          case "sentence_completion":
          case "short_answer":
            return <TextInputRenderer {...props} />;

          case "summary_completion":
            return <SummaryRenderer {...props} />;

          case "note_completion":
            return <NoteRenderer {...props} />;

          case "table_completion":
            return <TableRenderer {...props} />;

          case "flowchart_completion":
            return <FlowchartRenderer {...props} />;

          case "diagram_label":
            return <DiagramRenderer {...props} />;

          default:
            return <MCQRenderer {...props} />;
        }
      })()}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY: Group questions by question_group_label
   ═══════════════════════════════════════════════════════════════════════════ */

export function groupQuestions(questions: MCQQuestion[]): QuestionGroup[] {
  const groups: QuestionGroup[] = [];
  let currentLabel = "___INITIAL___";

  for (const q of questions) {
    const label = q.question_group_label || q.question_text;
    const type = (q.question_type || "multiple_choice") as ReadingQuestionType;

    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({
        label,
        type,
        questions: [q],
        data: q.question_data || {},
      });
    } else {
      groups[groups.length - 1].questions.push(q);
    }
  }

  return groups;
}
