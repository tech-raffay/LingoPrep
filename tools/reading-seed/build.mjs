/**
 * Builds the Reading test seed from content-ielts.mjs and content-toefl.mjs.
 *
 *   node tools/reading-seed/build.mjs            → writes seed_reading_v2.sql
 *   node tools/reading-seed/build.mjs --json DIR → also writes the API-shaped
 *                                                  JSON (for local testing)
 *
 * Run the generated SQL once in the Supabase SQL editor. It replaces every
 * reading passage (questions and options go with them).
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { IELTS } from "./content-ielts.mjs";
import { TOEFL } from "./content-toefl.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const pad = (n, w) => String(n).padStart(w, "0");
const LETTERS = ["A", "B", "C", "D", "E", "F"];

/* ── Complete the Words ─────────────────────────────────────────────────
   First sentence intact; then the second half of every second word is
   removed (for an odd number of letters, the larger half goes), ten words
   in all. Returns the gapped template and the ten answers. */
function completeWords(text, blanks = 10) {
  const firstEnd = text.search(/[.!?]\s/) + 1;
  const head = text.slice(0, firstEnd);
  const tokens = text.slice(firstEnd).split(/([A-Za-z]+)/);
  const items = [];
  let eligible = 0;
  for (let i = 1; i < tokens.length; i += 2) {
    const w = tokens[i];
    if (w.length < 2) continue;
    eligible++;
    if (eligible % 2 === 0 && items.length < blanks) {
      const keep = Math.floor(w.length / 2);
      items.push({ word: w, prefix: w.slice(0, keep), answer: w.slice(keep) });
      tokens[i] = `{{${items.length}}}`;
    }
  }
  if (items.length !== blanks) throw new Error(`Only ${items.length} blanks in: ${text.slice(0, 40)}…`);
  return { template: head + tokens.join(""), items };
}

/* ── Normalise both exams into passages → questions → options ─────────── */

function buildIelts() {
  let n = 0;
  return IELTS.map((p) => {
    const p8 = p.id.slice(0, 8);
    const content = p.paragraphs.join("\n\n");
    const questions = [];
    for (const g of p.groups) {
      const from = n + 1;
      const to = n + g.questions.length;
      const label = `Questions ${from}–${to}: ${g.title}`;
      for (const q of g.questions) {
        n++;
        const base = {
          id: `${p8}-e${pad(n, 3)}-4000-8000-${pad(n, 12)}`,
          passage_id: p.id,
          question_text: q.text ?? "",
          explanation: q.why ?? "",
          difficulty: p.difficulty,
          sort_order: n,
          question_type: g.type,
          question_group_label: label,
          correct_answer_text: "",
          question_data: g.data ?? {},
          options: [],
        };
        if (g.type === "multiple_choice") {
          base.options = q.options.map((text, i) => ({ label: LETTERS[i], text, is_correct: LETTERS[i] === q.answer }));
        } else if (g.type === "tfng" || g.type === "yng") {
          const choices = g.type === "tfng" ? ["TRUE", "FALSE", "NOT GIVEN"] : ["YES", "NO", "NOT GIVEN"];
          if (!choices.includes(q.answer)) throw new Error(`Bad ${g.type} answer: ${q.answer}`);
          base.options = choices.map((text, i) => ({ label: LETTERS[i], text, is_correct: text === q.answer }));
        } else {
          base.correct_answer_text = q.answer;
        }
        questions.push(base);
      }
    }
    return { id: p.id, title: p.title, content, word_count: words(content), difficulty: p.difficulty, exam_type: "ielts", questions };
  });
}

const TOEFL_TASK = {
  complete_words: "Complete the Words",
  daily_life: "Read in Daily Life",
  academic: "Read an Academic Passage",
};

function buildToefl() {
  let n = 0;
  return TOEFL.map((p) => {
    const p8 = p.id.slice(0, 8);
    const questions = [];
    const count = p.task === "complete_words" ? 10 : p.questions.length;
    const label = `Questions ${n + 1}–${n + count}: ${TOEFL_TASK[p.task]}`;
    const make = (extra) => {
      n++;
      return {
        id: `${p8}-e${pad(n, 3)}-4000-8000-${pad(n, 12)}`,
        passage_id: p.id,
        question_text: "",
        explanation: "",
        difficulty: p.difficulty,
        sort_order: n,
        question_type: "multiple_choice",
        question_group_label: label,
        correct_answer_text: "",
        question_data: {},
        options: [],
        ...extra,
      };
    };

    let content = p.content;
    if (p.task === "complete_words") {
      content = p.text;
      const { template, items } = completeWords(p.text);
      for (const it of items) {
        questions.push(make({
          question_type: "complete_words",
          question_text: it.prefix + "_".repeat(it.answer.length),
          explanation: `The complete word is "${it.word}".`,
          correct_answer_text: it.answer,
          question_data: {
            instruction: "Fill in the missing letters in the paragraph.",
            template,
            prefix: it.prefix,
            missing: it.answer.length,
          },
        }));
      }
    } else {
      for (const q of p.questions) {
        questions.push(make({
          question_text: q.text,
          explanation: q.why,
          question_data: { task: p.task, hide_instruction: true },
          options: q.options.map((text, i) => ({ label: LETTERS[i], text, is_correct: LETTERS[i] === q.answer })),
        }));
      }
    }
    return { id: p.id, title: p.title, content, word_count: words(content.replace(/^\[[A-Z]+\]\n/, "")), difficulty: p.difficulty, exam_type: "toefl", questions };
  });
}

/* ── Checks ─────────────────────────────────────────────────────────────── */

function check(passages, exam) {
  let total = 0;
  for (const p of passages) {
    for (const q of p.questions) {
      total++;
      if (q.options.length) {
        const right = q.options.filter((o) => o.is_correct).length;
        if (right !== 1) throw new Error(`${exam} Q${q.sort_order}: ${right} correct options`);
      } else if (!q.correct_answer_text) {
        throw new Error(`${exam} Q${q.sort_order}: no answer`);
      }
      const blanks = (s) => (String(s).match(/__BLANK__/g) || []).length;
      const d = q.question_data;
      if (q.question_type === "table_completion" || q.question_type === "summary_completion" || q.question_type === "flowchart_completion") {
        const gaps = blanks(JSON.stringify(d.rows ?? "")) + blanks(d.summary_text ?? "") + blanks(JSON.stringify(d.nodes ?? ""));
        const same = p.questions.filter((x) => x.question_group_label === q.question_group_label).length;
        if (gaps !== same) throw new Error(`${exam} ${q.question_group_label}: ${gaps} gaps for ${same} questions`);
      }
    }
    console.log(`${exam.padEnd(5)} ${p.title.padEnd(46)} ${String(p.word_count).padStart(4)} words  ${p.questions.length} questions`);
  }
  console.log(`${exam.padEnd(5)} total ${total} questions\n`);
  return total;
}

/* ── SQL ────────────────────────────────────────────────────────────────── */

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

function toSql(all) {
  const out = [];
  out.push(`-- ============================================================================
-- LingoPrep — Reading tests, version 2  (GENERATED: do not edit by hand)
-- Source: tools/reading-seed/  ·  rebuild with: node tools/reading-seed/build.mjs
--
-- Run once in the Supabase SQL editor. Safe to run again.
--
--   IELTS Academic Reading : 3 passages, 40 questions (13 / 13 / 14), 60 minutes
--   TOEFL iBT Reading      : January 2026 format, 9 tasks, 50 items, 30 minutes
--                            (Complete the Words, Read in Daily Life,
--                             Read an Academic Passage)
--
-- It REPLACES every reading passage. Their questions and options are removed
-- with them; past results stay in session_logs.
-- ============================================================================

BEGIN;

-- 1. Allow the TOEFL "Complete the Words" question type.
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS valid_question_type;
ALTER TABLE public.questions ADD CONSTRAINT valid_question_type CHECK (
  question_type IN (
    'multiple_choice', 'tfng', 'yng',
    'matching_headings', 'matching_info', 'matching_features', 'matching_sentence_endings',
    'sentence_completion', 'summary_completion', 'note_completion', 'table_completion',
    'flowchart_completion', 'diagram_label', 'short_answer',
    'complete_words'
  )
);

-- 2. Remove the old reading tests (questions and options cascade).
DELETE FROM public.passages WHERE module = 'reading';
`);

  for (const p of all) {
    out.push(`\n-- ── ${p.exam_type.toUpperCase()} · ${p.title} (${p.questions.length} questions) ──`);
    out.push(`INSERT INTO public.passages (id, title, content, module, word_count, difficulty, exam_type) VALUES (\n  ${q(p.id)}, ${q(p.title)},\n  ${q(p.content)},\n  'reading', ${p.word_count}, ${q(p.difficulty)}, ${q(p.exam_type)}\n);`);
    out.push(`INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES`);
    out.push(p.questions.map((x) =>
      `  (${q(x.id)}, ${q(x.passage_id)}, ${q(x.question_text)}, ${q(x.explanation)}, ${q(x.difficulty)}, ${x.sort_order}, ${q(x.question_type)}, ${q(x.question_group_label)}, ${q(x.correct_answer_text)}, ${q(JSON.stringify(x.question_data))}::jsonb)`
    ).join(",\n") + ";");
    const opts = p.questions.flatMap((x) => x.options.map((o, i) =>
      `  (${q(x.id)}, ${q(o.label)}, ${q(o.text)}, ${o.is_correct}, ${i + 1})`));
    if (opts.length) {
      out.push(`INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES`);
      out.push(opts.join(",\n") + ";");
    }
  }
  out.push(`\nCOMMIT;\n`);
  return out.join("\n");
}

/* ── API-shaped JSON (what GET /api/reading/passages returns) ───────────── */

function toApi(passages) {
  const data = passages.map((p) => ({
    ...p,
    module: "reading",
    questions: p.questions.map((x) => {
      const options = x.options.map((o, i) => ({ id: `${x.id.slice(0, 13)}-400${i + 1}-8000-${x.id.slice(24)}`, text: o.text, label: o.label, is_correct: o.is_correct }));
      const correct = options.find((o) => o.is_correct);
      return { ...x, options, correct_option_id: correct ? correct.id : "" };
    }),
  }));
  return { success: true, data, count: data.length };
}

/* ── Run ────────────────────────────────────────────────────────────────── */

const ielts = buildIelts();
const toefl = buildToefl();
const ni = check(ielts, "IELTS");
const nt = check(toefl, "TOEFL");
if (ni !== 40) throw new Error(`IELTS must have 40 questions, has ${ni}`);
if (nt !== 50) throw new Error(`TOEFL must have 50 items, has ${nt}`);

for (const p of toefl.filter((x) => x.questions[0].question_type === "complete_words")) {
  console.log(p.title + "\n  " + p.questions[0].question_data.template.replace(/\{\{(\d+)\}\}/g, (_, k) => p.questions[k - 1].question_text) + "\n");
}

writeFileSync(join(ROOT, "seed_reading_v2.sql"), toSql([...ielts, ...toefl]));
console.log("wrote seed_reading_v2.sql");

const jsonAt = process.argv.indexOf("--json");
if (jsonAt > 0) {
  const dir = process.argv[jsonAt + 1];
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "reading_passages_exam_type_ielts.json"), JSON.stringify(toApi(ielts)));
  writeFileSync(join(dir, "reading_passages_exam_type_toefl.json"), JSON.stringify(toApi(toefl)));
  console.log("wrote JSON to " + dir);
}
