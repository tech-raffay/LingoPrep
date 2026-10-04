"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import api from "@/lib/api";
import TestIntro from "@/components/test/TestIntro";
import ScoreReport, { type ReviewSection } from "@/components/test/ScoreReport";
import { useExam } from "@/components/theme/ExamThemeProvider";
import { isOptionBasedType } from "@/types";
import type { ReadingQuestionType } from "@/types";
import QuestionGroupRenderer, { groupQuestions } from "@/components/reading/QuestionRenderers";
import { jumpToTop } from "@/lib/scroll";
import Stimulus, { parseStimulus, stimulusText } from "@/components/reading/Stimulus";

/**
 * What a section of the test is.
 *   passage : a long text with questions beside it (every IELTS passage,
 *             and TOEFL "Read an Academic Passage")
 *   daily   : TOEFL "Read in Daily Life", a short everyday text
 *   words   : TOEFL "Complete the Words", where the paragraph is the task
 */
type TaskKind = "passage" | "daily" | "words";

const TOEFL_TASK: Record<TaskKind, string> = {
  passage: "Read an Academic Passage",
  daily: "Read in Daily Life",
  words: "Complete the Words",
};

interface Option {
  id: string;
  text: string;
  label: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: ReadingQuestionType;
  question_group_label: string;
  question_data: any;
  correct_answer_text: string;
  options: Option[];
  correct_option_id: string;
  explanation?: string;
  sort_order: number;
}

interface Passage {
  id: string;
  title: string;
  content: string;
  word_count: number;
  difficulty: string;
  exam_type: string;
  questions: Question[];
}


export default function ReadingPage() {
  // Exam theme comes from the shared provider (src/lib/exam.ts), never a
  // local copy — see brand book §07: one accent token, set in one place.
  const { exam: examType, theme: examTheme } = useExam();
  const theme = {
    color: examTheme.accent,
    colorDark: examTheme.accentStrong,
    colorLight: examTheme.accentTint,
    name: examTheme.name,
  };

  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flow control
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Results from backend
  const [bandScore, setBandScore] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState<number | null>(null);
  const [scorePercentage, setScorePercentage] = useState<number | null>(null);
  const [dbResults, setDbResults] = useState<any[] | null>(null);
  // Backend-confirmed: this attempt is now in the candidate's Results page.
  const [saved, setSaved] = useState<boolean | undefined>(undefined);

  const [timeLeft, setTimeLeft] = useState(3600);
  const [showPassage, setShowPassage] = useState(true); // mobile toggle

  // Refs for scrolling to specific questions
  const questionRefs = useRef<Record<string, HTMLElement | null>>({});
  // Scrollable panes, so a new passage always starts at the top.
  const passagePaneRef = useRef<HTMLDivElement | null>(null);
  const questionsPaneRef = useRef<HTMLDivElement | null>(null);
  // On a phone the passage and the questions are two tabs sharing one page
  // scroll; remember where each tab was so switching does not lose your place.
  const tabScroll = useRef({ passage: 0, questions: 0 });
  const firstPassageRender = useRef(true);

  // A new section always opens at its top: the start of the text and the
  // first question. The jump is instant ("instant" overrides the site-wide
  // smooth scrolling, which a re-render could interrupt half way), and it is
  // repeated once the new section has been laid out.
  useEffect(() => {
    if (firstPassageRender.current) { firstPassageRender.current = false; return; }
    tabScroll.current = { passage: 0, questions: 0 };
    return jumpToTop(passagePaneRef.current, questionsPaneRef.current);
  }, [activeSectionIdx]);

  // Phone: switching tab returns to where that tab was left.
  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) return;
    window.scrollTo({ top: tabScroll.current[showPassage ? "passage" : "questions"], behavior: "instant" });
  }, [showPassage]);

  const toggleTab = () => {
    tabScroll.current[showPassage ? "passage" : "questions"] = window.scrollY;
    setShowPassage((v) => !v);
  };

  const goToSection = (idx: number) => {
    setActiveSectionIdx(idx);
    setShowPassage(true);
  };

  useEffect(() => {
    async function fetchPassages() {
      try {
        setLoading(true);
        const response = await api.get(`/api/reading/passages?exam_type=${examType}`);
        const data = response.data?.data || [];
        if (data.length > 0) {
          // Sort passages by ID to ensure Section 1, 2, 3 ordering
          const sorted = [...data].sort((a: Passage, b: Passage) => a.id.localeCompare(b.id));
          // Ensure all questions have the new fields with defaults
          for (const p of sorted) {
            for (const q of p.questions) {
              q.question_type = q.question_type || "multiple_choice";
              q.question_group_label = q.question_group_label || "";
              q.question_data = q.question_data || {};
              q.correct_answer_text = q.correct_answer_text || "";
            }
          }
          setPassages(sorted);
        } else {
          setError(`No ${theme.name} reading passages available in the database.`);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load test content. Please verify that database is seeded and backend is running.");
      } finally {
        setLoading(false);
      }
    }
    fetchPassages();
  }, [examType, theme.name]);

  // Timer Effect — ONE continuous 60-minute timer for the entire exam
  useEffect(() => {
    if (!isTestStarted || submitted || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTestStarted, submitted, timeLeft]);

  // Helper: flatten all questions across passages
  const allQuestions = passages.reduce<Question[]>((acc, p) => {
    return [...acc, ...p.questions];
  }, []);

  const kindOf = (p: Passage): TaskKind =>
    p.questions[0]?.question_type === "complete_words" ? "words"
      : parseStimulus(p.content).kind !== "passage" ? "daily"
      : "passage";

  // TOEFL in the format ETS introduced in January 2026 (three task types).
  const isToefl = examType === "toefl";
  const toefl2026 = isToefl && passages.some((p) => kindOf(p) !== "passage");
  const minutes = !isToefl ? 60 : toefl2026 ? 30 : 35;
  const sectionWord = toefl2026 ? "Task" : "Passage";

  const isAnswered = (qId: string) => !!selectedAnswers[qId]?.trim();
  const unansweredCount = allQuestions.filter((q) => !isAnswered(q.id)).length;

  // Handle option click (MCQ / TFNG / YNG)
  const handleSelect = (qId: string, oId: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: oId }));
  };

  // Handle text input / dropdown change (all other types)
  const handleTextAnswer = (qId: string, text: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  // Submit flow
  const handleSubmit = async (force: boolean = false) => {
    if (passages.length === 0 || submitted) return;

    if (!force) {
      if (unansweredCount > 0) {
        setShowConfirmModal(true);
        return;
      }
    }

    try {
      setLoading(true);
      const answersPayload = allQuestions.map((q) => {
        const qType = q.question_type || "multiple_choice";
        const isOptionBased = isOptionBasedType(qType);
        return {
          question_id: q.id,
          selected_option_id: isOptionBased ? (selectedAnswers[q.id] || "") : "",
          answer_text: !isOptionBased ? (selectedAnswers[q.id] || "") : "",
        };
      });

      const res = await api.post("/api/reading/submit-full", {
        answers: answersPayload,
        exam_type: examType,
      });

      setCorrectCount(res.data.correct_answers);
      setScorePercentage(res.data.score_percentage);
      setBandScore(res.data.band_score);
      setDbResults(res.data.results);
      setSaved(typeof res.data.saved === "boolean" ? res.data.saved : undefined);
      setSubmitted(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to submit answers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const autoSubmit = () => {
    handleSubmit(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScorePercentage(null);
    setCorrectCount(null);
    setBandScore(null);
    setDbResults(null);
    setSaved(undefined);
    setIsTestStarted(false);
    setActiveSectionIdx(0);
  };

  // Question Navigator click: jump to section and scroll to question
  const handleNavClick = (qIndex: number) => {
    let questionCount = 0;
    for (let pIdx = 0; pIdx < passages.length; pIdx++) {
      const pQuestions = passages[pIdx].questions;
      if (qIndex >= questionCount && qIndex < questionCount + pQuestions.length) {
        if (showPassage) tabScroll.current.passage = window.scrollY;
        setActiveSectionIdx(pIdx);
        setShowPassage(false);
        const qId = pQuestions[qIndex - questionCount].id;
        // After the section-change jump to the top has settled.
        setTimeout(() => {
          questionRefs.current[qId]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 260);
        break;
      }
      questionCount += pQuestions.length;
    }
  };

  // Get question number in the overall test (1-40)
  const getOverallQuestionNumber = (qId: string) => {
    return allQuestions.findIndex((q) => q.id === qId) + 1;
  };

  // Group questions for the current passage by question_group_label
  const currentQuestionGroups = useMemo(() => {
    if (passages.length === 0 || activeSectionIdx >= passages.length) return [];
    return groupQuestions(passages[activeSectionIdx].questions as any);
  }, [passages, activeSectionIdx]);

  if (loading && passages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] flex-col gap-3">
        <div
          className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${theme.color} transparent transparent transparent` }}
        />
        <p className="text-[14px] text-slate-500 font-medium">Loading {theme.name} reading exam content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="text-[16px] font-bold text-slate-800 mb-2">Error Loading Test</h2>
        <p className="text-[13px] text-slate-500 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 text-white font-semibold text-[13px] rounded-full transition-all shadow-sm"
          style={{ backgroundColor: theme.color }}
        >
          Retry Load
        </button>
      </div>
    );
  }

  // 1. Welcome / Instructions Screen
  if (!isTestStarted && !submitted) {
    const count = allQuestions.length;
    const points = toefl2026
      ? [
          { label: "Format:", text: <>The format ETS introduced in January 2026: {passages.length} short tasks and {count} questions in {minutes} minutes, on ONE continuous timer.</> },
          { label: "Complete the Words:", text: "A short academic paragraph in which ten words have lost their second half. Type the missing letters." },
          { label: "Read in Daily Life:", text: "Everyday texts such as an email, a notice or a message thread, each with two or three questions." },
          { label: "Read an Academic Passage:", text: "A passage of about 200 words with five questions on main ideas, details, vocabulary and inference." },
          { label: "Scoring:", text: "One mark per correct answer, reported on the TOEFL iBT 0–30 section scale." },
        ]
      : isToefl
        ? [
            { label: "Total duration:", text: <>{minutes} minutes. ONE continuous timer. The clock does not reset between passages.</> },
            { label: "Passages:", text: <>{passages.length} academic passages. Navigate freely between them at any time.</> },
            { label: "Questions:", text: <>{count} multiple-choice questions.</> },
            { label: "Scoring:", text: "Scored 0–30 (TOEFL iBT section scale)." },
          ]
        : [
            { label: "Total duration:", text: <>{minutes} minutes. ONE continuous timer. The clock does not reset between passages.</> },
            { label: "Passages:", text: <>{passages.length} passages of increasing difficulty, each about 750 to 850 words. Navigate freely between them at any time.</> },
            { label: "Questions:", text: <>{count} questions in the task types the exam uses: matching headings, True/False/Not Given, multiple choice, matching features, Yes/No/Not Given, and completing a table, a summary, a flow chart and the labels on a diagram.</> },
            { label: "Answers:", text: "Completion answers must use words from the passage, within the word limit given, and must be spelled correctly." },
            { label: "Scoring:", text: "1 mark per correct answer, converted to an IELTS band from 0 to 9." },
          ];
    return (
      <TestIntro
        skill="reading"
        title={`${theme.name} Reading Test`}
        meta={`${passages.length} ${sectionWord}s · ${count} Questions · ${minutes} Minutes`}
        points={points}
        instructions={
          toefl2026
            ? <>Once you click &ldquo;Start exam&rdquo;, the countdown begins and cannot be paused. You can move between tasks freely while the timer runs. In the real exam this section is adaptive: the second module is easier or harder depending on the first. This practice form gives everyone the same tasks.</>
            : <>Ensure you are in a quiet workspace. Once you click &ldquo;Start exam&rdquo;, the countdown begins and cannot be paused. Read the texts carefully and answer the questions. You can move between all the passages while the timer continues. Good luck!</>
        }
        onStart={() => { setTimeLeft(minutes * 60); setIsTestStarted(true); }}
      />
    );
  }

  // 2. Score report (same frame as "Listening Score Report.dc.html")
  if (submitted) {
    const optionText = (q: Question, id?: string) => {
      const o = q.options?.find((x) => x.id === id);
      return o ? `${o.label}. ${o.text}` : null;
    };
    const sections: ReviewSection[] = passages.map((p) => ({
      title: p.title,
      material: { kind: "passage", text: stimulusText(p.content) },
      items: p.questions.map((q) => {
        const r = dbResults?.find((x: any) => x.question_id === q.id);
        const optionBased = isOptionBasedType(q.question_type || "multiple_choice");
        const num = getOverallQuestionNumber(q.id);
        if (q.question_type === "complete_words") {
          // Show whole words: the printed half plus the letters typed.
          const prefix = q.question_data?.prefix ?? "";
          const typed = ((r?.answer_text as string) || selectedAnswers[q.id] || "").trim();
          return {
            id: q.id,
            num,
            question: `Complete the word: ${q.question_text}`,
            your: typed ? prefix + typed : null,
            answer: prefix + ((r?.correct_answer_text as string) || q.correct_answer_text || ""),
            ok: !!r?.is_correct,
            why: null,
          };
        }
        const your = optionBased
          ? optionText(q, selectedAnswers[q.id])
          : ((r?.answer_text as string) || selectedAnswers[q.id] || null);
        const answer = optionBased
          ? optionText(q, (r?.correct as string) || q.correct_option_id) ?? (r?.correct_answer_text as string) ?? ""
          : ((r?.correct_answer_text as string) || q.correct_answer_text || "");
        return {
          id: q.id,
          num,
          question: q.question_text?.trim() || q.question_group_label || `Question ${num}`,
          your,
          answer,
          ok: !!r?.is_correct,
          why: (r?.explanation as string) || q.explanation || null,
        };
      }),
    }));
    return (
      <ScoreReport
        skill="reading"
        score={bandScore ?? 0}
        saved={saved}
        facts={[
          { label: "Raw score", value: `${correctCount ?? 0} / ${allQuestions.length} correct` },
          { label: "Percentage", value: `${Math.round(scorePercentage ?? 0)}%` },
          { label: "Time left", value: formatTime(timeLeft) },
        ]}
        sections={sections}
        onRetake={() => { handleReset(); window.scrollTo({ top: 0 }); }}
      />
    );
  }

  // 3. Active Test Screen
  const currentPassage = passages[activeSectionIdx];
  const totalPassages = passages.length;
  const kind = kindOf(currentPassage);
  const qStart = getOverallQuestionNumber(currentPassage.questions[0].id);
  const qEnd   = getOverallQuestionNumber(currentPassage.questions[currentPassage.questions.length - 1].id);
  const isLast = activeSectionIdx === totalPassages - 1;
  // On a phone a long passage and its questions are two tabs. A short
  // everyday text simply sits above its questions.
  const tabbed = kind === "passage";

  const sectionChip = (
    <span className="px-3.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 font-extrabold rounded-full text-[10.5px] uppercase tracking-wider">
      {sectionWord} {activeSectionIdx + 1} of {totalPassages}
      {toefl2026 && <> · {TOEFL_TASK[kind]}</>}
    </span>
  );

  const questionGroups = currentQuestionGroups.map((group, gi) => {
    const from = getOverallQuestionNumber(group.questions[0].id);
    const to = getOverallQuestionNumber(group.questions[group.questions.length - 1].id);
    // Labels are stored as "Questions 1–5: Matching headings". The numbers
    // are worked out here, so only the task name is taken from the label.
    const named = /^Questions?\s+\d+(?:\s*[–-]\s*\d+)?\s*[:.]?\s*(.*)$/.exec(group.label);
    const taskName = toefl2026 ? "" : named ? named[1] : group.questions[0].question_group_label ? group.label : "";
    return (
      <section key={`${activeSectionIdx}-${gi}`} className="space-y-3.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="h-5 w-1 flex-shrink-0 rounded-full" style={{ backgroundColor: theme.color }} />
          <h3 className="text-[15px] font-extrabold text-slate-900">
            {from === to ? `Question ${from}` : `Questions ${from}–${to}`}
          </h3>
          {taskName && (
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-slate-500">{taskName}</span>
          )}
        </div>

        <QuestionGroupRenderer
          group={group}
          selectedAnswers={selectedAnswers}
          onSelectOption={handleSelect}
          onTextAnswer={handleTextAnswer}
          getOverallNumber={getOverallQuestionNumber}
          theme={theme}
          questionRefs={questionRefs}
        />
      </section>
    );
  });

  const sectionNav = (
    <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
      <button
        disabled={activeSectionIdx === 0}
        onClick={() => goToSection(activeSectionIdx - 1)}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        <span>Previous</span>
      </button>

      {isLast ? (
        <button
          onClick={() => handleSubmit(false)}
          className="flex items-center gap-1.5 px-6 py-2.5 text-white font-bold text-[13px] rounded-xl transition-all shadow-sm hover:opacity-90 active:scale-95 cursor-pointer"
          style={{ backgroundColor: theme.color }}
        >
          <span>Submit Exam</span>
        </button>
      ) : (
        <button
          onClick={() => goToSection(activeSectionIdx + 1)}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all shadow-sm hover:opacity-90 active:scale-95 cursor-pointer"
          style={{ backgroundColor: "#1e293b" }}
        >
          <span>Next {sectionWord}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      )}
    </div>
  );

  const navigator = (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Question Navigator</p>
      <div className="grid grid-cols-10 gap-1.5">
        {allQuestions.map((q, qi) => {
          const answered = isAnswered(q.id);
          const inSection = currentPassage.questions.some((pq) => pq.id === q.id);
          return (
            <button
              key={q.id}
              onClick={() => handleNavClick(qi)}
              className={`w-full aspect-square sm:aspect-auto sm:h-9 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                answered
                  ? "text-white shadow-sm"
                  : inSection
                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
              style={answered ? { backgroundColor: theme.color } : undefined}
              title={`Question ${qi + 1}`}
            >
              {qi + 1}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col">

      {/* TOP BAR: sits under the site header and stays in view */}
      <div className="sticky top-14 z-30 shadow-sm">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[15px] sm:text-[17px] font-extrabold tracking-tight flex-shrink-0" style={{ color: theme.color }}>LingoPrep</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-[12px] sm:text-[14px] font-semibold text-slate-600 hidden sm:inline truncate">{theme.name} Reading Test</span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Section tabs: desktop only. A phone uses Previous / Next. */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100/90 border border-slate-200 p-1 rounded-xl">
              {passages.map((_, idx) => (
                <button key={idx} onClick={() => goToSection(idx)}
                  aria-label={`${sectionWord} ${idx + 1}`}
                  aria-current={activeSectionIdx === idx ? "true" : undefined}
                  className={`min-w-8 px-2.5 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                    activeSectionIdx === idx ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >{toefl2026 ? idx + 1 : `P${idx + 1}`}</button>
              ))}
            </div>

            <span className="md:hidden text-[12px] font-bold text-slate-500 tabular-nums">
              {activeSectionIdx + 1}/{totalPassages}
            </span>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold tabular-nums text-[13px] transition-all ${
              timeLeft < 300
                ? "bg-[var(--error-tint)] text-[var(--error)] border-[var(--error)]"
                : "bg-[var(--n-100)] text-[var(--ink)] border-[var(--n-300)]"
            }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button onClick={() => handleSubmit(false)}
              className="px-3 sm:px-5 py-2 text-white font-bold text-[12px] sm:text-[13px] rounded-lg transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              style={{ backgroundColor: theme.color }}
            >Finish</button>
          </div>
        </header>

        {/* Phone: the passage and its questions are two tabs */}
        {tabbed && (
          <div className="md:hidden grid grid-cols-2 bg-white border-b border-slate-200" role="tablist" aria-label="Passage or questions">
            {([["Passage", true], [`Questions ${qStart}–${qEnd}`, false]] as const).map(([label, isPassageTab]) => {
              const active = showPassage === isPassageTab;
              return (
                <button
                  key={label}
                  role="tab"
                  aria-selected={active}
                  onClick={() => { if (!active) toggleTab(); }}
                  className={`h-10 border-b-2 text-[13px] font-bold transition-colors cursor-pointer ${
                    active ? "border-[var(--accent)] text-slate-900" : "border-transparent text-slate-500"
                  }`}
                >{label}</button>
              );
            })}
          </div>
        )}
      </div>

      {kind === "words" ? (
        /* COMPLETE THE WORDS: the paragraph is the task, so one column */
        <div className="flex-1">
          <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">
            <div className="space-y-4">
              <div>{sectionChip}</div>
              <h2 className="text-[21px] sm:text-[23px] font-extrabold text-slate-900 leading-tight">{currentPassage.title}</h2>
            </div>
            {questionGroups}
            {sectionNav}
            {navigator}
          </div>
        </div>
      ) : (
        /* SPLIT SCREEN: text on the left, questions on the right. Each side
           scrolls by itself on a wide screen; a phone scrolls the page. */
        <div className="flex-1 grid grid-cols-1 content-start md:content-stretch md:flex-none md:grid-cols-2 md:grid-rows-1 md:h-[calc(100vh-113px)] md:overflow-hidden">

          {/* Left: what the candidate reads */}
          <div ref={passagePaneRef} className={`min-w-0 bg-white md:border-r border-slate-200 p-5 sm:p-8 md:min-h-0 md:overflow-y-auto ${
            tabbed && !showPassage ? "hidden md:block" : "block"
          }`}>
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                {sectionChip}
                {!toefl2026 && <span className="text-[12px] font-semibold text-slate-400">Questions {qStart}–{qEnd}</span>}
              </div>

              {!isToefl && (
                <p className="text-[13.5px] leading-relaxed text-slate-600">
                  You should spend about 20 minutes on <strong className="font-bold text-slate-900">Questions {qStart}–{qEnd}</strong>, which are based on Reading Passage {activeSectionIdx + 1} below.
                </p>
              )}

              {kind === "passage" && (
                <h2 className="text-[21px] sm:text-[23px] font-extrabold text-slate-900 leading-tight">
                  {currentPassage.title}
                </h2>
              )}

              <Stimulus content={currentPassage.content} />

              {tabbed && (
                <button
                  onClick={toggleTab}
                  className="md:hidden flex w-full items-center justify-center gap-1.5 h-11 rounded-xl text-[13.5px] font-bold text-white cursor-pointer active:scale-[.98] transition-transform"
                  style={{ backgroundColor: "#1e293b" }}
                >
                  <span>Go to Questions {qStart}–{qEnd}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
              )}
            </div>
          </div>

          {/* Right: the questions */}
          <div ref={questionsPaneRef} className={`min-w-0 bg-[#f8f9fb] p-4 sm:p-8 md:min-h-0 md:overflow-y-auto space-y-7 ${
            tabbed && showPassage ? "hidden md:block" : "block"
          }`}>
            {questionGroups}
            {sectionNav}
            {navigator}
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-7">
            <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-[17px] font-bold text-slate-900 mb-2 text-center">Submit Exam?</h3>
            <p className="text-[13px] text-slate-500 mb-6 leading-relaxed text-center">
              You have {unansweredCount} unanswered {unansweredCount === 1 ? "question" : "questions"}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-bold text-[13px] rounded-lg hover:bg-slate-50 transition-colors"
              >
                Keep Working
              </button>
              <button
                onClick={() => { setShowConfirmModal(false); handleSubmit(true); }}
                className="flex-1 px-4 py-2.5 text-white font-bold text-[13px] rounded-lg transition-all"
                style={{ backgroundColor: theme.color }}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
