/**
 * Builds the Listening test seed from content-ielts.mjs and content-toefl.mjs.
 *
 *   node tools/listening-seed/build.mjs            → writes seed_listening_v2.sql
 *   node tools/listening-seed/build.mjs --json DIR → also writes the API-shaped
 *                                                    JSON (for local testing and
 *                                                    for pregenerating the audio)
 *
 * Run the generated SQL once in the Supabase SQL editor. It replaces every
 * listening recording (questions and options go with them).
 *
 * The `content` column of a listening recording holds what the candidate
 * sees while listening, as header lines:
 *
 *   Kind: conversation | monologue | lecture | response | announcement | talk
 *   Setting: A phone call to a community library
 *   Speakers: Hannah, a caller (f); Tom, the volunteer coordinator (m)
 *   Photo: /media/listening/ielts-1-library.jpg | Rows of library bookshelves
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { IELTS } from "./content-ielts.mjs";
import { TOEFL } from "./content-toefl.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const pad = (n, w) => String(n).padStart(w, "0");
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const header = (p, kind) => {
  const lines = [`Kind: ${kind}`, `Setting: ${p.setting}`, `Speakers: ${p.speakers.map((s) => `${s.role} (${s.gender})`).join("; ")}`];
  if (p.photo) lines.push(`Photo: ${p.photo.src} | ${p.photo.alt}`);
  return lines.join("\n");
};

/** Roughly how long a recording runs: words at ~150 a minute plus its pauses. */
const seconds = (transcript) => {
  const pauses = [...transcript.matchAll(/\[pause (\d+)\]/g)].reduce((a, m) => a + Number(m[1]), 0);
  const spoken = transcript.replace(/\[pause \d+\]/g, "").replace(/^[^:\n]+\([mf]\):/gm, "");
  return Math.round(spoken.trim().split(/\s+/).length / 2.5) + pauses;
};

function question(p, n, g, q, label) {
  const p8 = p.id.slice(0, 8);
  const base = {
    id: `${p8}-e${pad(n, 3)}-4000-8000-${pad(n, 12)}`,
    passage_id: p.id,
    question_text: q.text || (g.data?.task === "response" ? "Choose the best response." : ""),
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
    if (!q.options.some((_, i) => LETTERS[i] === q.answer)) throw new Error(`Bad answer ${q.answer} for Q${n}`);
  } else {
    base.correct_answer_text = q.answer;
  }
  return base;
}

function buildIelts() {
  let n = 0;
  return IELTS.map((p, pi) => {
    const questions = [];
    for (const g of p.groups) {
      const from = n + 1;
      const to = n + g.questions.length;
      const label = `Questions ${from}–${to}: ${g.title}`;
      for (const q of g.questions) questions.push(question(p, ++n, g, q, label));
    }
    if (questions.length !== 10) throw new Error(`${p.title}: ${questions.length} questions, expected 10`);
    return {
      id: p.id, title: p.title, content: header(p, p.kind), transcript: p.transcript,
      audio_duration_seconds: seconds(p.transcript), difficulty: p.difficulty, exam_type: "ielts", questions,
      part: pi + 1,
    };
  });
}

const TOEFL_TASK = {
  response: "Listen and Choose a Response",
  conversation: "Listen to a Conversation",
  announcement: "Listen to an Announcement",
  talk: "Listen to an Academic Talk",
};

function buildToefl() {
  // Items of one task type are numbered as one block, e.g. "Questions 1–16".
  const counts = {};
  for (const p of TOEFL) counts[p.task] = (counts[p.task] ?? 0) + p.questions.length;
  let n = 0;
  const start = {};
  let acc = 0;
  for (const task of Object.keys(TOEFL_TASK)) { start[task] = acc + 1; acc += counts[task] ?? 0; }

  return TOEFL.map((p) => {
    const label = `Questions ${start[p.task]}–${start[p.task] + counts[p.task] - 1}: ${TOEFL_TASK[p.task]}`;
    const g = {
      type: "multiple_choice",
      data: {
        task: p.task,
        hide_instruction: true,
        instruction: p.task === "response" ? "Choose the best response." : "Choose the best answer.",
      },
    };
    const questions = p.questions.map((q) => question(p, ++n, g, q, label));
    return {
      id: p.id, title: p.title, content: header(p, p.task), transcript: p.transcript,
      audio_duration_seconds: seconds(p.transcript), difficulty: p.difficulty, exam_type: "toefl", questions,
    };
  });
}

/* ── Checks ─────────────────────────────────────────────────────────────── */

function check(items, exam) {
  let total = 0;
  for (const p of items) {
    for (const q of p.questions) {
      total++;
      if (q.options.length) {
        const right = q.options.filter((o) => o.is_correct).length;
        if (right !== 1) throw new Error(`${exam} Q${q.sort_order}: ${right} correct options`);
      } else if (!q.correct_answer_text) {
        throw new Error(`${exam} Q${q.sort_order}: no answer`);
      }
      const d = q.question_data;
      const blanks = (s) => (String(s).match(/__BLANK__/g) || []).length;
      if (["note_completion", "flowchart_completion", "table_completion"].includes(q.question_type)) {
        const gaps = blanks(JSON.stringify(d.notes ?? "")) + blanks(JSON.stringify(d.nodes ?? "")) + blanks(JSON.stringify(d.rows ?? ""));
        const same = p.questions.filter((x) => x.question_group_label === q.question_group_label).length;
        if (gaps !== same) throw new Error(`${exam} ${q.question_group_label}: ${gaps} gaps for ${same} questions`);
      }
      if (q.question_type === "sentence_completion" && !/_{3,}/.test(q.question_text)) throw new Error(`${exam} Q${q.sort_order}: no gap in sentence`);
    }
    // Every text answer must be said in the recording (first alternative).
    for (const q of p.questions) {
      if (!q.correct_answer_text || q.question_data.choices || q.question_data.features) continue;
      const said = p.transcript.toLowerCase();
      const first = q.correct_answer_text.split("|")[0].toLowerCase();
      if (!said.includes(first) && !said.includes(first.replace(/\s+/g, " "))) console.warn(`  warning: ${exam} Q${q.sort_order} answer "${first}" not found verbatim in transcript`);
    }
    console.log(`${exam.padEnd(5)} ${p.title.padEnd(52)} ~${String(p.audio_duration_seconds).padStart(3)}s  ${p.questions.length} questions`);
  }
  console.log(`${exam.padEnd(5)} total ${total} questions\n`);
  return total;
}

/* ── SQL ────────────────────────────────────────────────────────────────── */

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

function toSql(all) {
  const out = [];
  out.push(`-- ============================================================================
-- LingoPrep — Listening tests, version 2  (GENERATED: do not edit by hand)
-- Source: tools/listening-seed/  ·  rebuild with: node tools/listening-seed/build.mjs
--
-- Run once in the Supabase SQL editor. Safe to run again.
--
--   IELTS Listening     : 4 parts, 40 questions (10 per part), about 30 minutes
--                         (form, plan labelling, multiple choice, matching,
--                          flow chart and note completion)
--   TOEFL iBT Listening : January 2026 format, 47 items
--                         (Listen and Choose a Response, Listen to a
--                          Conversation, Listen to an Announcement,
--                          Listen to an Academic Talk)
--
-- It REPLACES every listening recording. Their questions and options are
-- removed with them; past results stay in session_logs.
-- ============================================================================

BEGIN;

DELETE FROM public.passages WHERE module = 'listening';
`);
  for (const p of all) {
    out.push(`\n-- ── ${p.exam_type.toUpperCase()} · ${p.title} (${p.questions.length} questions) ──`);
    out.push(`INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type) VALUES (\n  ${q(p.id)}, ${q(p.title)},\n  ${q(p.content)},\n  'listening', '', ${p.audio_duration_seconds},\n  ${q(p.transcript)},\n  ${q(p.difficulty)}, ${q(p.exam_type)}\n);`);
    out.push(`INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order, question_type, question_group_label, correct_answer_text, question_data) VALUES`);
    out.push(p.questions.map((x) =>
      `  (${q(x.id)}, ${q(x.passage_id)}, ${q(x.question_text)}, ${q(x.explanation)}, ${q(x.difficulty)}, ${x.sort_order}, ${q(x.question_type)}, ${q(x.question_group_label)}, ${q(x.correct_answer_text)}, ${q(JSON.stringify(x.question_data))}::jsonb)`
    ).join(",\n") + ";");
    const opts = p.questions.flatMap((x) => x.options.map((o, i) => `  (${q(x.id)}, ${q(o.label)}, ${q(o.text)}, ${o.is_correct}, ${i + 1})`));
    if (opts.length) {
      out.push(`INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES`);
      out.push(opts.join(",\n") + ";");
    }
  }
  out.push(`\nCOMMIT;\n`);
  return out.join("\n");
}

/* ── API-shaped JSON (what GET /api/listening/audios returns) ───────────── */

function toApi(items) {
  const data = items.map((p) => ({
    ...p,
    module: "listening",
    audio_url: "",
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
if (nt !== 47) throw new Error(`TOEFL must have 47 items, has ${nt}`);

writeFileSync(join(ROOT, "seed_listening_v2.sql"), toSql([...ielts, ...toefl]));
console.log("wrote seed_listening_v2.sql");

const jsonAt = process.argv.indexOf("--json");
if (jsonAt > 0) {
  const dir = process.argv[jsonAt + 1];
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "listening_audios_exam_type_ielts.json"), JSON.stringify(toApi(ielts)));
  writeFileSync(join(dir, "listening_audios_exam_type_toefl.json"), JSON.stringify(toApi(toefl)));
  console.log("wrote JSON to " + dir);
}
