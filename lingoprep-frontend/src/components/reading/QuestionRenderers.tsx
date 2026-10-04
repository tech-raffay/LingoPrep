"use client";

/**
 * Question renderers for the Reading tests.
 *
 * Styled after the computer-delivered exams rather than a quiz app: plain
 * white surfaces, thin rules, a boxed question number, and gaps that sit
 * inside the sentence, table cell or flow-chart box they belong to, showing
 * their question number until something is typed. The exam accent appears
 * only on what the candidate has selected or focused.
 *
 * IELTS Academic: multiple choice, True/False/Not Given, Yes/No/Not Given,
 * matching (headings, information, features, sentence endings), sentence /
 * summary / note / table / flow-chart completion, diagram labelling and
 * short answers.
 * TOEFL iBT (2026): multiple choice and Complete the Words.
 *
 * Review after submission is the score report's job, so these render the
 * live test only.
 */

import React from "react";
import type { MCQQuestion, QuestionGroup, ReadingQuestionType } from "@/types";
import { ReadingDiagram, hasDiagram } from "@/components/reading/Diagrams";

interface RendererProps {
  group: QuestionGroup;
  selectedAnswers: Record<string, string>;
  onSelectOption: (qId: string, optionId: string) => void;
  onTextAnswer: (qId: string, text: string) => void;
  getOverallNumber: (qId: string) => number;
  theme: { color: string; colorDark: string; colorLight: string };
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  /** Kept for callers; review is rendered by the score report. */
  submitted?: boolean;
  dbResults?: unknown;
}

const BLANK = "__BLANK__";

/* ── Instructions ───────────────────────────────────────────────────────── */

const words = (n?: number) =>
  n === 1 ? "ONE WORD ONLY" : `NO MORE THAN ${["", "", "TWO", "THREE", "FOUR"][n ?? 2] ?? n} WORDS`;

function defaultInstruction(type: ReadingQuestionType, data: QuestionGroup["data"]): string {
  switch (type) {
    case "multiple_choice": return "Choose the correct letter, A, B, C or D.";
    case "tfng": return "Do the following statements agree with the information given in the reading passage? Choose TRUE, FALSE or NOT GIVEN.";
    case "yng": return "Do the following statements agree with the views of the writer? Choose YES, NO or NOT GIVEN.";
    case "matching_headings": return "Choose the correct heading for each paragraph from the list of headings below.";
    case "matching_info": return "Which paragraph contains the following information?";
    case "matching_features": return "Match each statement with the correct item from the list below.";
    case "matching_sentence_endings": return "Complete each sentence with the correct ending from the list below.";
    case "sentence_completion": return `Complete the sentences below. Choose ${words(data.max_words)} from the passage for each answer.`;
    case "summary_completion":
      return data.has_word_list || data.word_list?.length
        ? "Complete the summary using the list of words below."
        : `Complete the summary below. Choose ${words(data.max_words)} from the passage for each answer.`;
    case "note_completion": return `Complete the notes below. Choose ${words(data.max_words)} from the passage for each answer.`;
    case "table_completion": return `Complete the table below. Choose ${words(data.max_words)} from the passage for each answer.`;
    case "flowchart_completion": return `Complete the flow chart below. Choose ${words(data.max_words)} from the passage for each answer.`;
    case "diagram_label": return `Label the diagram below. Choose ${words(data.max_words)} from the passage for each answer.`;
    case "short_answer": return `Answer the questions below. Choose ${words(data.max_words ?? 3)} from the passage for each answer.`;
    case "complete_words": return "Fill in the missing letters in the paragraph.";
    default: return "Answer the questions below.";
  }
}

/** The exam prints its key terms in capitals; set those in bold. */
function Emphasised({ text }: { text: string }) {
  const parts = text.split(/(\b[A-Z]{2,}(?:[ /][A-Z]{2,})*\b(?: A NUMBER)?)/g);
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <strong key={i} className="font-bold text-slate-900">{p}</strong> : p))}
    </>
  );
}

function Instruction({ group }: { group: QuestionGroup }) {
  if (group.data.hide_instruction) return null;
  const text = group.data.instruction || defaultInstruction(group.type, group.data);
  return (
    <p className="text-[13.5px] leading-[1.65] text-slate-700">
      <Emphasised text={text} />
    </p>
  );
}

/* ── Shared pieces ──────────────────────────────────────────────────────── */

/** Remembers a question's element so the navigator can scroll to it. */
const track = (refs: RendererProps["questionRefs"], id: string) => (el: HTMLElement | null) => {
  refs.current[id] = el;
};

/** The boxed question number, as printed on the exam screen. */
function Num({ n }: { n: number }) {
  return (
    <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md border-[1.5px] border-slate-800 bg-white px-1.5 text-[12.5px] font-bold tabular-nums text-slate-900">
      {n}
    </span>
  );
}

const GAP =
  "inline-block align-baseline h-[30px] rounded-[5px] border border-slate-400 bg-white px-2 text-[14px] font-semibold text-slate-900 " +
  "placeholder:font-bold placeholder:text-slate-500 focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-tint)]";

/** A typed gap. Shows its question number until the candidate types. */
function Gap({
  q, num, value, onChange, questionRefs, className = "w-[136px]",
}: {
  q: MCQQuestion; num: number; value: string; onChange: (v: string) => void;
  questionRefs: RendererProps["questionRefs"]; className?: string;
}) {
  return (
    <input
      ref={track(questionRefs, q.id)}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={String(num)}
      aria-label={`Answer to question ${num}`}
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      className={`${GAP} mx-1 text-center ${className}`}
    />
  );
}

/** A gap answered by choosing from a list. */
function SelectGap({
  q, num, value, onChange, options, questionRefs, className = "max-w-[190px]", placeholder,
}: {
  q: MCQQuestion; num: number; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  questionRefs: RendererProps["questionRefs"]; className?: string; placeholder?: string;
}) {
  return (
    <select
      ref={track(questionRefs, q.id)}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={`Answer to question ${num}`}
      className={`${GAP} mx-1 cursor-pointer pr-7 ${value ? "" : "font-bold text-slate-500"} ${className}`}
    >
      <option value="">{placeholder ?? num}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/** Text with __BLANK__ markers: each marker becomes the next question's gap. */
function makeGapFiller(props: RendererProps) {
  const { group, selectedAnswers, onTextAnswer, getOverallNumber, questionRefs } = props;
  let next = 0;
  const options = group.data.word_list?.map((w) => ({ value: w, label: w }));
  return function fill(text: string, keyPrefix: string): React.ReactNode[] {
    const out: React.ReactNode[] = [];
    text.split(BLANK).forEach((part, i, all) => {
      if (part) out.push(<span key={`${keyPrefix}-t${i}`}>{part}</span>);
      if (i < all.length - 1) {
        const q = group.questions[next++];
        if (!q) return;
        const num = getOverallNumber(q.id);
        const value = selectedAnswers[q.id] || "";
        out.push(
          options ? (
            <SelectGap key={q.id} q={q} num={num} value={value} options={options}
              onChange={(v) => onTextAnswer(q.id, v)} questionRefs={questionRefs} />
          ) : (
            <Gap key={q.id} q={q} num={num} value={value}
              onChange={(v) => onTextAnswer(q.id, v)} questionRefs={questionRefs} />
          )
        );
      }
    });
    return out;
  };
}

function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 sm:p-5">
      {title && <p className="mb-3 text-center text-[14px] font-bold text-slate-900">{title}</p>}
      {children}
    </div>
  );
}

/* ══ Multiple choice, True/False/Not Given, Yes/No/Not Given ══════════════ */

function ChoiceRenderer({ group, selectedAnswers, onSelectOption, getOverallNumber, questionRefs }: RendererProps) {
  const compact = group.type === "tfng" || group.type === "yng";
  return (
    <div className="space-y-3">
      {group.questions.map((q) => {
        const num = getOverallNumber(q.id);
        const chosen = selectedAnswers[q.id];
        return (
          <div
            key={q.id}
            ref={track(questionRefs, q.id)}
            className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <Num n={num} />
              <p className="pt-0.5 text-[14.5px] font-semibold leading-snug text-slate-900">{q.question_text}</p>
            </div>

            {compact ? (
              <div className="mt-3 flex flex-wrap gap-2 sm:pl-10" role="radiogroup" aria-label={`Question ${num}`}>
                {q.options.map((opt) => {
                  const on = chosen === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => onSelectOption(q.id, opt.id)}
                      className={`h-9 rounded-md border px-3.5 text-[12.5px] font-bold tracking-[.04em] cursor-pointer transition-colors duration-150 ${
                        on
                          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-on)]"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 space-y-1.5 sm:pl-10" role="radiogroup" aria-label={`Question ${num}`}>
                {q.options.map((opt) => {
                  const on = chosen === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => onSelectOption(q.id, opt.id)}
                      className={`flex w-full items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left text-[13.5px] leading-snug cursor-pointer transition-colors duration-150 ${
                        on
                          ? "border-[var(--accent)] bg-[var(--accent-tint)] text-slate-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <span
                        className={`mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          on ? "border-[var(--accent)]" : "border-slate-300"
                        }`}
                      >
                        {on && <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />}
                      </span>
                      <span className="w-4 shrink-0 font-bold text-slate-500">{opt.label}</span>
                      <span className="flex-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══ Matching: headings, information, features, sentence endings ═════════ */

function MatchingRenderer({ group, selectedAnswers, onTextAnswer, getOverallNumber, questionRefs }: RendererProps) {
  const { type, data } = group;

  let list: { label: string; text: string }[] = [];
  if (type === "matching_headings" && data.headings) list = data.headings;
  else if (type === "matching_features" && data.features) list = data.features;
  else if (type === "matching_sentence_endings" && data.endings) list = data.endings;

  const paragraphs = type === "matching_info" ? data.paragraphs ?? [] : [];
  const options = paragraphs.length
    ? paragraphs.map((p) => ({ value: p, label: `Paragraph ${p}` }))
    : list.map((o) => ({ value: o.label, label: `${o.label}   ${o.text}` }));

  const listTitle =
    data.list_title ??
    (type === "matching_headings" ? "List of Headings"
      : type === "matching_sentence_endings" ? "List of Endings"
      : "List");

  return (
    <div className="space-y-3">
      {list.length > 0 && (
        <Panel title={listTitle}>
          <ul className="space-y-1.5">
            {list.map((o) => (
              <li key={o.label} className="flex gap-3 text-[13.5px] leading-snug text-slate-800">
                <span className="w-7 shrink-0 font-bold text-slate-900">{o.label}</span>
                <span>{o.text}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {group.questions.map((q) => {
          const num = getOverallNumber(q.id);
          return (
            <div key={q.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-5">
              <Num n={num} />
              <p className="min-w-[8rem] flex-1 text-[14px] font-semibold leading-snug text-slate-900">{q.question_text}</p>
              <SelectGap
                q={q} num={num} value={selectedAnswers[q.id] || ""} options={options}
                onChange={(v) => onTextAnswer(q.id, v)} questionRefs={questionRefs}
                className="w-full sm:w-[220px] !mx-0"
                placeholder="Select"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══ Sentence completion and short answers ═══════════════════════════════ */

function TextRenderer({ group, selectedAnswers, onTextAnswer, getOverallNumber, questionRefs }: RendererProps) {
  return (
    <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
      {group.questions.map((q) => {
        const num = getOverallNumber(q.id);
        const gap = (
          <Gap q={q} num={num} value={selectedAnswers[q.id] || ""} onChange={(v) => onTextAnswer(q.id, v)} questionRefs={questionRefs} />
        );
        const parts = q.question_text.split(/_{3,}/);
        return (
          <div key={q.id} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
            <Num n={num} />
            {parts.length > 1 ? (
              <p className="flex-1 text-[14px] leading-[2.3] text-slate-900">
                {parts[0]}{gap}{parts.slice(1).join(" ")}
              </p>
            ) : (
              <div className="flex-1">
                <p className="pt-0.5 text-[14px] font-semibold leading-snug text-slate-900">{q.question_text}</p>
                <div className="mt-2 -ml-1">{gap}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══ Summary completion ══════════════════════════════════════════════════ */

function SummaryRenderer(props: RendererProps) {
  const { data } = props.group;
  const fill = makeGapFiller(props);
  return (
    <div className="space-y-3">
      {data.word_list && data.word_list.length > 0 && (
        <Panel>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1.5">
            {data.word_list.map((w) => (
              <li key={w} className="text-[13.5px] font-semibold text-slate-800">{w}</li>
            ))}
          </ul>
        </Panel>
      )}
      <Panel title={data.summary_title}>
        <p className="text-[14px] leading-[2.4] text-slate-900">{fill(data.summary_text || "", "s")}</p>
      </Panel>
    </div>
  );
}

/* ══ Note completion ═════════════════════════════════════════════════════ */

function NoteRenderer(props: RendererProps) {
  const fill = makeGapFiller(props);
  const notes = props.group.data.notes || [];
  return (
    <Panel>
      <div className="space-y-4">
        {notes.map((section, si) => (
          <div key={si}>
            {section.heading && <p className="mb-1.5 text-[14px] font-bold text-slate-900">{section.heading}</p>}
            <ul className="space-y-0.5">
              {section.items.map((item, ii) => (
                <li key={ii} className="flex gap-2.5 text-[14px] leading-[2.3] text-slate-900">
                  <span className="text-slate-500">•</span>
                  <span>{fill(item, `n${si}-${ii}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ══ Table completion ════════════════════════════════════════════════════ */

function TableRenderer(props: RendererProps) {
  const { data } = props.group;
  const fill = makeGapFiller(props);
  const columns = data.columns || [];
  const rows = data.rows || [];
  return (
    <div className="rounded-xl border border-slate-300 bg-white">
      {data.table_title && (
        <p className="border-b border-slate-300 px-4 py-2.5 text-center text-[14px] font-bold text-slate-900">{data.table_title}</p>
      )}
      {/* A phone is too narrow for the columns side by side, so there each
          row becomes a small card that names its columns. */}
      <table className="w-full border-collapse text-[13.5px] max-sm:block">
        <thead className="max-sm:hidden">
          <tr>
            {columns.map((c, i) => (
              <th key={i} className={`bg-slate-100 px-3.5 py-2.5 text-left font-bold text-slate-900 ${i ? "border-l border-slate-300" : ""}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-sm:block">
          {rows.map((row, ri) => (
            <tr key={ri} className="border-t border-slate-300 max-sm:block max-sm:px-4 max-sm:py-3">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`align-top text-slate-900 sm:px-3.5 sm:py-2 sm:leading-[2.2] max-sm:block max-sm:leading-[2.1] ${
                    ci ? "sm:border-l sm:border-slate-300" : "font-semibold max-sm:text-[14px]"
                  }`}
                >
                  {ci > 0 && columns[ci] && (
                    <span className="mr-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:hidden">{columns[ci]}:</span>
                  )}
                  {fill(cell, `r${ri}-${ci}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══ Flow-chart completion ═══════════════════════════════════════════════ */

function FlowchartRenderer(props: RendererProps) {
  const { data } = props.group;
  const fill = makeGapFiller(props);
  const nodes = data.nodes || [];
  return (
    <Panel title={data.flowchart_title}>
      <ol className="mx-auto flex max-w-[460px] flex-col items-stretch">
        {nodes.map((node, i) => (
          <li key={i} className="flex flex-col items-center">
            {i > 0 && (
              <svg width="14" height="22" viewBox="0 0 14 22" aria-hidden="true" className="my-0.5 text-slate-500">
                <path d="M7 0v17M2 13l5 6 5-6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <div className="w-full rounded-md border border-slate-400 bg-white px-4 py-2 text-center text-[13.5px] leading-[2.2] text-slate-900">
              {/* Older content marks a whole box as blank. */}
              {fill(node.is_blank ? BLANK : node.text, `f${i}`)}
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* ══ Diagram label completion ════════════════════════════════════════════ */

function DiagramRenderer({ group, selectedAnswers, onTextAnswer, getOverallNumber, questionRefs }: RendererProps) {
  const { data } = group;
  const numbers = group.questions.map((q) => getOverallNumber(q.id));
  const drawn = hasDiagram(data.diagram);
  return (
    <Panel title={data.diagram_title}>
      {drawn && <ReadingDiagram diagram={data.diagram as string} numbers={numbers} />}
      <div className={`grid gap-x-5 gap-y-2.5 ${drawn ? "mt-4 border-t border-slate-200 pt-4 sm:grid-cols-2" : ""}`}>
        {group.questions.map((q, i) => (
          <div key={q.id} className="flex min-w-0 items-center gap-2.5">
            <Num n={numbers[i]} />
            {/* With a drawing, the gap is located on the diagram itself, as in
                the exam. Without one, the label's description stands in. */}
            {!drawn && <span className="flex-1 text-[13.5px] text-slate-800">{q.question_text}</span>}
            <Gap
              q={q} num={numbers[i]} value={selectedAnswers[q.id] || ""}
              onChange={(v) => onTextAnswer(q.id, v)} questionRefs={questionRefs}
              className={drawn ? "min-w-0 flex-1 !mx-0" : "w-[136px]"}
            />
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ══ TOEFL: Complete the Words ═══════════════════════════════════════════ */

function CompleteWordsRenderer({ group, selectedAnswers, onTextAnswer, getOverallNumber, questionRefs }: RendererProps) {
  const template = group.data.template || "";
  const box = React.useRef<HTMLParagraphElement | null>(null);

  // Typing the last missing letter moves on to the next word.
  const advance = (from: HTMLInputElement) => {
    const inputs = Array.from(box.current?.querySelectorAll<HTMLInputElement>("input") ?? []);
    inputs[inputs.indexOf(from) + 1]?.focus();
  };

  return (
    <Panel>
      <p ref={box} className="text-[16px] leading-[2.5] text-slate-900">
        {template.split(/(\{\{\d+\}\})/).map((part, i) => {
          const m = /^\{\{(\d+)\}\}$/.exec(part);
          if (!m) return <span key={i}>{part}</span>;
          const q = group.questions[Number(m[1]) - 1];
          if (!q) return null;
          const missing = q.question_data?.missing ?? 3;
          return (
            <span key={q.id} className="whitespace-nowrap">
              {q.question_data?.prefix}
              <input
                ref={track(questionRefs, q.id)}
                type="text"
                inputMode="text"
                value={selectedAnswers[q.id] || ""}
                maxLength={missing}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^A-Za-z]/g, "");
                  onTextAnswer(q.id, v);
                  if (v.length >= missing) advance(e.target);
                }}
                placeholder={"_".repeat(missing)}
                aria-label={`Question ${getOverallNumber(q.id)}: missing letters of the word starting ${q.question_data?.prefix}`}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                style={{ width: `${missing * 0.78 + 0.5}em` }}
                className="mx-px rounded-[3px] border-0 border-b-2 border-slate-400 bg-[var(--accent-tint)] px-0.5 py-0 font-semibold tracking-[.14em] text-slate-900
                           placeholder:font-normal placeholder:text-slate-400 focus:border-[var(--accent)] focus:outline-none"
              />
            </span>
          );
        })}
      </p>
    </Panel>
  );
}

/* ══ Dispatcher ══════════════════════════════════════════════════════════ */

export default function QuestionGroupRenderer(props: RendererProps) {
  const { group } = props;
  const body = (() => {
    switch (group.type) {
      case "multiple_choice":
      case "tfng":
      case "yng":
        return <ChoiceRenderer {...props} />;
      case "matching_headings":
      case "matching_info":
      case "matching_features":
      case "matching_sentence_endings":
        return <MatchingRenderer {...props} />;
      case "sentence_completion":
      case "short_answer":
        return <TextRenderer {...props} />;
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
      case "complete_words":
        return <CompleteWordsRenderer {...props} />;
      default:
        return <ChoiceRenderer {...props} />;
    }
  })();

  return (
    <div className="space-y-3">
      <Instruction group={group} />
      {body}
    </div>
  );
}

/* ── Group consecutive questions that share a label ─────────────────────── */

export function groupQuestions(questions: MCQQuestion[]): QuestionGroup[] {
  const groups: QuestionGroup[] = [];
  let currentLabel = "___INITIAL___";

  for (const q of questions) {
    const label = q.question_group_label || q.question_text;
    const type = (q.question_type || "multiple_choice") as ReadingQuestionType;

    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, type, questions: [q], data: q.question_data || {} });
    } else {
      groups[groups.length - 1].questions.push(q);
    }
  }

  return groups;
}
