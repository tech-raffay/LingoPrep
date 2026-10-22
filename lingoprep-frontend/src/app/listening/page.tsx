"use client";

/**
 * Listening test, in the shape of the real exams.
 *
 * IELTS   Four parts, ten questions each, 40 in all. The recording for a part
 *         starts when the part opens and is heard once; it carries the exam's
 *         own directions and the pauses for reading the questions, which stay
 *         on screen throughout. After Part 4 there are two minutes to check
 *         the answers (as in the computer-delivered test), then the test is
 *         submitted.
 *
 * TOEFL   The January 2026 format: Listen and Choose a Response, Listen to a
 *         Conversation, Listen to an Announcement and Listen to an Academic
 *         Talk, 47 items. Every recording is accompanied by a picture of the
 *         speaker(s), plays once, and its questions appear when it ends.
 *
 * Both tests play each recording once only. Pausing is allowed here, as a
 * practice convenience; the real tests never pause.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { jumpToTop } from "@/lib/scroll";
import { gapContext } from "@/lib/gapContext";
import TestIntro from "@/components/test/TestIntro";
import ScoreReport, { type ReviewSection, type ReviewItem } from "@/components/test/ScoreReport";
import { useExam } from "@/components/theme/ExamThemeProvider";
import { isOptionBasedType } from "@/types";
import type { MCQQuestion } from "@/types";
import QuestionGroupRenderer, { groupQuestions } from "@/components/reading/QuestionRenderers";
import SpeakerCard, { parseScene, type Scene, type SceneKind } from "@/components/listening/SpeakerCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

interface Recording {
  id: string;
  title: string;
  content?: string;
  transcript?: string;
  transcript_display?: string;
  exam_type: string;
  questions: MCQQuestion[];
}

const TOEFL_TASK: Partial<Record<SceneKind, string>> = {
  response: "Listen and Choose a Response",
  conversation: "Listen to a Conversation",
  announcement: "Listen to an Announcement",
  talk: "Listen to an Academic Talk",
};

/** The transcript as shown afterwards (older rows have no display copy). */
const cleanTranscript = (r: Recording) =>
  r.transcript_display ??
  (r.transcript || "")
    .split("\n")
    .filter((l) => l.trim() && !/^\[pause/i.test(l.trim()))
    .map((l) => l.replace(/^([^:\n]+?)\s*\((?:m|f)\)\s*:/, "$1:"))
    .join("\n");

/** On resume, step back this far so the last words are heard again. */
const RESUME_REWIND_SECONDS = 2.5;
/** After a part ends, IELTS moves on to the next part after this long. */
const NEXT_PART_DELAY_MS = 3000;

export default function ListeningPage() {
  // Exam theme comes from the shared provider (src/lib/exam.ts), never a
  // local copy: brand book §07, one accent token, set in one place.
  const { exam: examType, theme: examTheme } = useExam();
  const theme = {
    color: examTheme.accent,
    colorDark: examTheme.accentStrong,
    colorLight: examTheme.accentTint,
    name: examTheme.name,
  };
  const isToefl = examType === "toefl";

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flow
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isReviewPeriod, setIsReviewPeriod] = useState(false);
  const [reviewTimeLeft, setReviewTimeLeft] = useState(120);

  // Playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [progress, setProgress] = useState(0);
  /** Recordings that have started (each plays once) and that have ended. */
  const [started, setStarted] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState<Record<number, boolean>>({});
  const startedRef = useRef<Set<number>>(new Set());
  const pausedAtRef = useRef(0);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [useFallbackTTS, setUseFallbackTTS] = useState(false);

  // Results
  const [bandScore, setBandScore] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState<number | null>(null);
  const [scorePercentage, setScorePercentage] = useState<number | null>(null);
  const [dbResults, setDbResults] = useState<Record<string, unknown>[] | null>(null);
  const [saved, setSaved] = useState<boolean | undefined>(undefined);

  const questionRefs = useRef<Record<string, HTMLElement | null>>({});
  const leftPaneRef = useRef<HTMLDivElement | null>(null);
  const questionsPaneRef = useRef<HTMLDivElement | null>(null);

  /* ── Audio element (off-screen, created once) ─────────────────────────── */
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audioRef.current = null;
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  /* ── Load ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const response = await api.get(`/api/listening/audios?exam_type=${examType}`);
        const data: Recording[] = response.data?.data || [];
        if (data.length > 0) {
          const sorted = [...data].sort((a, b) => a.id.localeCompare(b.id));
          for (const r of sorted) {
            for (const q of r.questions) {
              q.question_type = q.question_type || "multiple_choice";
              q.question_group_label = q.question_group_label || "";
              q.question_data = q.question_data || {};
              q.correct_answer_text = q.correct_answer_text || "";
            }
          }
          setRecordings(sorted);
        } else {
          setError(`No ${theme.name} listening test found in the database.`);
        }
      } catch (err) {
        console.error("Fetch listening error:", err);
        setError("Failed to load test content. Please verify database seeding and backend status.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examType, theme.name]);

  /* ── Derived ──────────────────────────────────────────────────────────── */
  const allQuestions = useMemo(() => recordings.flatMap((r) => r.questions), [recordings]);
  const scenes = useMemo(() => recordings.map((r) => parseScene(r.content)), [recordings]);
  const numberOf = (qId: string) => allQuestions.findIndex((q) => q.id === qId) + 1;
  const isAnswered = (qId: string) => !!answers[qId]?.trim();
  const unansweredCount = allQuestions.filter((q) => !isAnswered(q.id)).length;

  // TOEFL: recordings belong to one of four tasks, in order.
  const tasks = useMemo(() => {
    const kinds: SceneKind[] = [];
    for (const s of scenes) if (!kinds.includes(s.kind)) kinds.push(s.kind);
    return kinds.map((kind) => ({ kind, name: TOEFL_TASK[kind] ?? kind, idxs: scenes.map((s, i) => (s.kind === kind ? i : -1)).filter((i) => i >= 0) }));
  }, [scenes]);
  const taskOf = (idx: number) => {
    const t = tasks.findIndex((x) => x.idxs.includes(idx));
    return { task: t, name: tasks[t]?.name ?? "", pos: (tasks[t]?.idxs.indexOf(idx) ?? 0) + 1, count: tasks[t]?.idxs.length ?? 0 };
  };

  const sectionWord = isToefl ? "Recording" : "Part";

  /* ── Playback ─────────────────────────────────────────────────────────── */
  const audioUrlFor = (id: string) => `${API_BASE}/api/listening/audio/${id}`;

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = null;
  }, []);
  const startProgressTimer = useCallback(() => {
    stopProgressTimer();
    progressTimerRef.current = setInterval(() => {
      const audio = audioRef.current;
      if (audio && audio.duration && isFinite(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    }, 250);
  }, [stopProgressTimer]);

  /** The recording has ended: IELTS moves on by itself, TOEFL shows the questions. */
  const finishRecording = useCallback((idx: number) => {
    stopProgressTimer();
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(100);
    setFinished((prev) => ({ ...prev, [idx]: true }));
    setPlayingIdx(null);
    if (isToefl) return;
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      if (idx < recordings.length - 1) {
        setActiveIdx((cur) => (cur === idx ? idx + 1 : cur));
      } else {
        setIsReviewPeriod(true);
      }
    }, NEXT_PART_DELAY_MS);
  }, [isToefl, recordings.length, stopProgressTimer]);

  // Browser speech as a last resort, if the recording cannot be fetched.
  const fallbackRef = useRef<{ idx: number; chunks: string[]; at: number; current: SpeechSynthesisUtterance | null } | null>(null);
  // Each chunk queues the next through this ref (a callback cannot call itself).
  const speakChunkRef = useRef<(i: number) => void>(() => {});
  const speakFallbackChunk = useCallback((i: number) => {
    const fb = fallbackRef.current;
    if (!fb) return;
    if (i >= fb.chunks.length) { fallbackRef.current = null; finishRecording(fb.idx); return; }
    fb.at = i;
    const u = new SpeechSynthesisUtterance(fb.chunks[i]);
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(isToefl ? "en-US" : "en-GB")) ?? window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("en"));
    if (voice) u.voice = voice;
    u.rate = 0.95;
    fb.current = u;
    const next = () => { if (fb.current === u) { setProgress(((i + 1) / fb.chunks.length) * 100); speakChunkRef.current(i + 1); } };
    u.onend = next;
    u.onerror = (e) => { if (e.error !== "interrupted" && e.error !== "canceled") next(); };
    window.speechSynthesis.speak(u);
  }, [finishRecording, isToefl]);

  useEffect(() => { speakChunkRef.current = speakFallbackChunk; }, [speakFallbackChunk]);

  const startFallback = useCallback((idx: number) => {
    const text = cleanTranscript(recordings[idx]).replace(/^[^:\n]+:\s*/gm, "");
    const chunks = text.match(/[^.!?\n]+[.!?]+["')\]]*|[^.!?\n]+$/gm)?.map((c) => c.trim()).filter(Boolean) ?? [text];
    window.speechSynthesis.cancel();
    fallbackRef.current = { idx, chunks, at: 0, current: null };
    setUseFallbackTTS(true);
    setAudioLoading(false);
    setIsSpeaking(true);
    setIsPaused(false);
    speakFallbackChunk(0);
  }, [recordings, speakFallbackChunk]);

  /** Start a recording (each one only ever starts once). */
  const startRecording = useCallback((idx: number) => {
    const audio = audioRef.current;
    const recording = recordings[idx];
    if (!audio || !recording || startedRef.current.has(idx)) return;
    startedRef.current.add(idx);
    setStarted((prev) => ({ ...prev, [idx]: true }));
    setPlayingIdx(idx);
    setNeedsTap(false);
    setIsPaused(false);
    setProgress(0);
    setAudioLoading(true);

    const url = audioUrlFor(recording.id);
    if (audio.src !== url || audio.error) {
      audio.src = url;
      audio.load();
    }
    audio.onplaying = () => { setAudioLoading(false); setIsSpeaking(true); startProgressTimer(); };
    audio.onended = () => finishRecording(idx);
    audio.onerror = () => { console.error("Recording failed to play; using browser speech"); startFallback(idx); };

    // play() straight away: on iOS a tap unlocks the element, and after that
    // later recordings may start on their own.
    audio.play().catch((err: { name?: string }) => {
      if (err?.name === "AbortError") return;
      if (err?.name === "NotAllowedError") {
        // Autoplay refused: ask for a tap, and let the same recording start then.
        startedRef.current.delete(idx);
        setStarted((prev) => { const n = { ...prev }; delete n[idx]; return n; });
        setAudioLoading(false);
        setPlayingIdx(null);
        setNeedsTap(true);
        return;
      }
      startFallback(idx);
    });
  }, [recordings, finishRecording, startFallback, startProgressTimer]);

  // A recording starts when its screen opens, unless another is still going
  // or it has already played.
  useEffect(() => {
    if (!isTestStarted || submitted || isReviewPeriod) return;
    if (isSpeaking || isPaused || audioLoading) return;
    if (startedRef.current.has(activeIdx)) return;
    startRecording(activeIdx);
  }, [activeIdx, isTestStarted, submitted, isReviewPeriod, isSpeaking, isPaused, audioLoading, startRecording]);

  const togglePlay = () => {
    if (audioLoading) return;
    if (isSpeaking) {
      if (useFallbackTTS) {
        const fb = fallbackRef.current;
        if (fb) fb.current = null;
        window.speechSynthesis.cancel();
      } else if (audioRef.current) {
        pausedAtRef.current = audioRef.current.currentTime;
        audioRef.current.pause();
        stopProgressTimer();
      }
      setIsSpeaking(false);
      setIsPaused(true);
    } else if (isPaused) {
      setIsPaused(false);
      setIsSpeaking(true);
      if (useFallbackTTS) {
        const fb = fallbackRef.current;
        if (fb) speakFallbackChunk(fb.at);
      } else if (audioRef.current) {
        const audio = audioRef.current;
        try { audio.currentTime = Math.max(0, pausedAtRef.current - RESUME_REWIND_SECONDS); } catch { /* not seekable yet */ }
        startProgressTimer();
        audio.play().catch(() => {});
      }
    } else if (!startedRef.current.has(activeIdx)) {
      startRecording(activeIdx);
    }
  };

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= recordings.length) return;
    setActiveIdx(idx);
  };

  /* ── Scroll ───────────────────────────────────────────────────────────── */
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    return jumpToTop(leftPaneRef.current, questionsPaneRef.current);
  }, [activeIdx]);

  /* ── Answers and submission ───────────────────────────────────────────── */
  const handleSelect = (qId: string, oId: string) => { if (!submitted) setAnswers((p) => ({ ...p, [qId]: oId })); };
  const handleText = (qId: string, text: string) => { if (!submitted) setAnswers((p) => ({ ...p, [qId]: text })); };

  const handleSubmit = async (force = false) => {
    if (recordings.length === 0 || submitted) return;
    if (!force && unansweredCount > 0) { setShowConfirmModal(true); return; }

    audioRef.current?.pause();
    stopProgressTimer();
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setAudioLoading(false);

    try {
      setLoading(true);
      const payload = allQuestions.map((q) => {
        const optionBased = isOptionBasedType(q.question_type || "multiple_choice");
        return {
          question_id: q.id,
          selected_option_id: optionBased ? (answers[q.id] || "") : "",
          answer_text: optionBased ? "" : (answers[q.id] || ""),
        };
      });
      const res = await api.post("/api/listening/submit-full", { answers: payload, exam_type: examType });
      setCorrectCount(res.data.correct_answers);
      setScorePercentage(res.data.score_percentage);
      setBandScore(res.data.band_score);
      setDbResults(res.data.results);
      setSaved(typeof res.data.saved === "boolean" ? res.data.saved : undefined);
      setSubmitted(true);
      setIsReviewPeriod(false);
      window.scrollTo({ top: 0 });
    } catch (err) {
      console.error("Listening submission error:", err);
      setError("Failed to submit answers. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const autoSubmit = () => handleSubmit(true);

  // IELTS: two minutes to check answers, then the test submits itself.
  useEffect(() => {
    if (!isReviewPeriod || submitted || reviewTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setReviewTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(interval); autoSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReviewPeriod, submitted, reviewTimeLeft]);

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setScorePercentage(null);
    setCorrectCount(null);
    setBandScore(null);
    setDbResults(null);
    setSaved(undefined);
    setIsReviewPeriod(false);
    setReviewTimeLeft(120);
    setStarted({});
    setFinished({});
    startedRef.current = new Set();
    setPlayingIdx(null);
    setProgress(0);
    setIsSpeaking(false);
    setIsPaused(false);
    setAudioLoading(false);
    setNeedsTap(false);
    setUseFallbackTTS(false);
    fallbackRef.current = null;
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    setIsTestStarted(false);
    setActiveIdx(0);
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleNavClick = (qIndex: number) => {
    let count = 0;
    for (let i = 0; i < recordings.length; i++) {
      const qs = recordings[i].questions;
      if (qIndex >= count && qIndex < count + qs.length) {
        goTo(i);
        const qId = qs[qIndex - count].id;
        setTimeout(() => questionRefs.current[qId]?.scrollIntoView({ behavior: "smooth", block: "center" }), 260);
        break;
      }
      count += qs.length;
    }
  };

  const currentGroups = useMemo(
    () => (recordings[activeIdx] ? groupQuestions(recordings[activeIdx].questions) : []),
    [recordings, activeIdx],
  );

  /* ── Screens ──────────────────────────────────────────────────────────── */
  if (loading && recordings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] flex-col gap-3">
        <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${theme.color} transparent transparent transparent` }} />
        <p className="text-[14px] text-slate-500 font-medium">Loading {theme.name} listening test...</p>
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
        <button onClick={() => window.location.reload()} className="px-5 py-2.5 text-white font-semibold text-[13px] rounded-full transition-all shadow-sm cursor-pointer" style={{ backgroundColor: theme.color }}>
          Retry Load
        </button>
      </div>
    );
  }

  // 1. Intro
  if (!isTestStarted && !submitted) {
    const count = allQuestions.length;
    const points = isToefl
      ? [
          { label: "Format:", text: <>The format ETS introduced in January 2026: {recordings.length} short recordings and {count} questions, in four task types.</> },
          { label: "Listen and Choose a Response:", text: "A single spoken question or remark. Choose the reply that fits." },
          { label: "Listen to a Conversation:", text: "A short campus conversation, followed by two questions." },
          { label: "Listen to an Announcement:", text: "A classroom or campus notice, followed by three questions." },
          { label: "Listen to an Academic Talk:", text: "A short talk by a professor, followed by four questions." },
          { label: "Playback:", text: "Each recording plays ONCE, with a picture of the speaker(s). The questions appear when it ends. You may take notes." },
          { label: "Scoring:", text: "One mark per correct answer, reported on the TOEFL iBT 0–30 section scale." },
        ]
      : [
          { label: "Parts:", text: <>4 parts, 10 questions each: a conversation and a talk in everyday situations, then a discussion and a lecture in an academic setting.</> },
          { label: "Playback:", text: "Each part is heard ONCE. The recording gives you time to read the questions before each group, as in the real test." },
          { label: "Questions:", text: "Form, note and sentence completion, labelling a plan, multiple choice, matching and a flow chart. Answer as you listen." },
          { label: "Answers:", text: "Keep to the word limit in the instructions, for example NO MORE THAN TWO WORDS AND/OR A NUMBER. Spelling counts." },
          { label: "Checking:", text: "After Part 4 you have two minutes to check your answers before the test is submitted." },
          { label: "Scoring:", text: "One mark per correct answer, converted to an IELTS band from 0 to 9." },
        ];
    return (
      <TestIntro
        skill="listening"
        title={`${theme.name} Listening Test`}
        meta={isToefl ? `4 Task Types · ${count} Questions · about 30 Minutes` : `4 Parts · ${count} Questions · about 30 Minutes`}
        subhead="Exam structure & audio rules"
        points={points}
        instructions={
          <>Use headphones or speakers at a comfortable volume. The first recording starts as soon as you press &ldquo;Start exam&rdquo;. {isToefl ? "Answer each set of questions before moving on." : "Write your answers while you listen."}</>
        }
        onStart={() => {
          window.speechSynthesis?.getVoices();
          setIsTestStarted(true);
          // Started inside the tap itself, which is what iOS requires.
          startRecording(0);
        }}
      />
    );
  }

  // 2. Score report
  if (submitted) {
    const optionText = (q: MCQQuestion, id?: string) => {
      const o = q.options?.find((x) => x.id === id);
      return o ? `${o.label}. ${o.text}` : null;
    };
    const itemFor = (q: MCQQuestion, _i: number, group: MCQQuestion[]): ReviewItem => {
      const r = dbResults?.find((x) => x.question_id === q.id);
      const optionBased = isOptionBasedType(q.question_type || "multiple_choice");
      const your = optionBased
        ? optionText(q, answers[q.id] || (r?.selected as string))
        : ((r?.answer_text as string) || answers[q.id] || null);
      const answer = optionBased
        ? optionText(q, (r?.correct as string) || q.correct_option_id) ?? ""
        : ((r?.correct_answer_text as string) || q.correct_answer_text || "").split("|")[0];
      return {
        id: q.id,
        num: numberOf(q.id),
        question: q.question_text?.trim() || gapContext(q, group.filter((x) => x.question_group_label === q.question_group_label)) || q.question_group_label || `Question ${numberOf(q.id)}`,
        your,
        answer,
        ok: !!r?.is_correct,
        why: (r?.explanation as string) || q.explanation || null,
      };
    };
    const sections: ReviewSection[] = isToefl
      ? tasks.map((t) => ({
          title: t.name,
          material: {
            kind: "transcript",
            text: t.idxs.map((i) => `${recordings[i].title}\n${cleanTranscript(recordings[i])}`).join("\n\n"),
          },
          items: t.idxs.flatMap((i) => recordings[i].questions.map(itemFor)),
        }))
      : recordings.map((r) => ({
          title: r.title,
          material: { kind: "transcript", text: cleanTranscript(r) },
          items: r.questions.map(itemFor),
        }));
    return (
      <ScoreReport
        skill="listening"
        score={bandScore ?? 0}
        correct={correctCount ?? 0}
        total={allQuestions.length}
        percentage={scorePercentage ?? 0}
        saved={saved}
        sections={sections}
        onRetake={() => { handleReset(); window.scrollTo({ top: 0 }); }}
      />
    );
  }

  // 3. The test
  const current = recordings[activeIdx];
  const scene: Scene = scenes[activeIdx];
  const total = recordings.length;
  const qStart = numberOf(current.questions[0].id);
  const qEnd = numberOf(current.questions[current.questions.length - 1].id);
  const task = taskOf(activeIdx);
  const isLast = activeIdx === total - 1;

  // The player describes whatever is playing, even if another part is on screen.
  const playerIdx = playingIdx ?? activeIdx;
  const playerLabel = isToefl ? recordings[playerIdx].title : `Part ${playerIdx + 1}`;
  const activeStarted = !!started[activeIdx];
  const activeFinished = !!finished[activeIdx];
  const activePlaying = playingIdx === activeIdx && (isSpeaking || isPaused);
  const status = audioLoading ? "Loading recording"
    : isSpeaking ? "Playing"
    : isPaused ? "Paused"
    : needsTap && !activeStarted ? "Tap to play"
    : activeFinished ? "Finished"
    : activeStarted ? "Ready" : "Starting";
  const canToggle = !audioLoading && (isSpeaking || isPaused || (!activeStarted && !isReviewPeriod));
  // TOEFL questions wait for the recording; IELTS questions are always there.
  const questionsVisible = !isToefl || activeFinished || isReviewPeriod;
  const canGoNext = !isLast && (activeFinished || isReviewPeriod);

  const playerCard = (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="flex justify-center items-end gap-1 h-8" aria-hidden="true">
        {[5, 12, 8, 18, 10, 22, 16, 26, 14, 20, 9, 16, 7].map((h, i) => (
          <div key={i} className="w-1.5 rounded-full" style={{
            height: isSpeaking ? `${h}px` : audioLoading ? "6px" : "3px",
            backgroundColor: isSpeaking ? theme.color : audioLoading ? theme.color + "80" : "#CBD5E1",
            transition: "height 0.2s ease",
            animation: isSpeaking ? `pulse 0.5s ease-in-out ${i * 0.08}s infinite alternate` : audioLoading ? `pulse 0.8s ease-in-out ${i * 0.1}s infinite alternate` : "none",
          }} />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          disabled={!canToggle}
          aria-label={audioLoading ? "Loading recording" : isSpeaking ? "Pause recording" : isPaused ? "Resume recording" : activeFinished ? "Recording already played" : "Play recording"}
          className="w-10 h-10 flex items-center justify-center rounded-full text-white flex-shrink-0 transition-all shadow enabled:cursor-pointer enabled:hover:scale-105 enabled:active:scale-95 disabled:cursor-not-allowed"
          style={{ backgroundColor: canToggle ? theme.color : "#94a3b8" }}
        >
          {audioLoading ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : isSpeaking ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/></svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex justify-between gap-2 text-[11px] font-semibold">
            <span className="truncate text-slate-600">{playerLabel} · {status}</span>
            <span className="text-slate-400 tabular-nums">{Math.round(activePlaying || playingIdx === null ? progress : 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${activePlaying || playingIdx === null ? progress : 100}%`, backgroundColor: theme.color }} />
          </div>
        </div>
      </div>
      <p className="text-[11.5px] leading-snug text-slate-500">
        {isToefl ? "Plays once. The questions appear when it ends." : "Plays once. The recording includes time to read each group of questions."}
      </p>
    </div>
  );

  const sectionNav = (
    <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-3">
      <button
        disabled={activeIdx === 0}
        onClick={() => goTo(activeIdx - 1)}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        <span>Previous</span>
      </button>
      {isLast ? (
        <button
          onClick={() => handleSubmit(false)}
          disabled={!activeFinished && !isReviewPeriod}
          className="flex items-center gap-1.5 px-6 py-2.5 text-white font-bold text-[13px] rounded-xl transition-all shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{ backgroundColor: theme.color }}
        >
          <span>Finish Test</span>
        </button>
      ) : (
        <button
          onClick={() => goTo(activeIdx + 1)}
          disabled={!canGoNext}
          title={canGoNext ? undefined : "Available when the recording has finished"}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{ backgroundColor: "#1e293b" }}
        >
          <span>Next {sectionWord}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      )}
    </div>
  );

  const navigator = !isToefl && (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Question Navigator</p>
      <div className="grid grid-cols-10 gap-1.5">
        {allQuestions.map((q, qi) => {
          const answered = isAnswered(q.id);
          const inSection = current.questions.some((x) => x.id === q.id);
          return (
            <button
              key={q.id}
              onClick={() => handleNavClick(qi)}
              className={`w-full aspect-square sm:aspect-auto sm:h-9 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                answered ? "text-white shadow-sm" : inSection ? "bg-slate-200 text-slate-700 hover:bg-slate-300" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
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
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[15px] sm:text-[17px] font-extrabold tracking-tight flex-shrink-0" style={{ color: theme.color }}>LingoPrep</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-[12px] sm:text-[14px] font-semibold text-slate-600 hidden sm:inline truncate">{theme.name} Listening Test</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[12px] font-bold text-slate-500 tabular-nums">
              {isToefl ? `${activeIdx + 1}/${total}` : `Part ${activeIdx + 1}/${total}`}
            </span>
            {isReviewPeriod && (
              <div className="flex items-center gap-1.5 text-[13px] font-bold tabular-nums text-[var(--error)] bg-[var(--error-tint)] border border-[var(--error)] px-3 py-1.5 rounded-lg">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {formatTime(reviewTimeLeft)}
              </div>
            )}
            <button onClick={() => handleSubmit(false)}
              className="px-3 sm:px-5 py-2 text-white font-bold text-[12px] sm:text-[13px] rounded-lg transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              style={{ backgroundColor: theme.color }}
            >Finish</button>
          </div>
        </header>

        {/* Phone: the recording's controls stay in reach while answering */}
        {(isSpeaking || isPaused || audioLoading) && (
          <div className="md:hidden flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-2">
            <button
              onClick={togglePlay}
              disabled={audioLoading}
              aria-label={isSpeaking ? "Pause recording" : "Resume recording"}
              className="w-8 h-8 flex items-center justify-center rounded-full text-white flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
              style={{ backgroundColor: theme.color }}
            >
              {isSpeaking
                ? <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/></svg>
                : <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
            </button>
            <div className="flex-1 min-w-0">
              <p className="truncate text-[11.5px] font-semibold text-slate-600">{playerLabel} · {status}</p>
              <div className="mt-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: theme.color }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col md:flex-row md:h-[calc(100vh-113px)] md:overflow-hidden">

        {/* LEFT: what is being heard */}
        <div ref={leftPaneRef} className="md:w-80 lg:w-[22rem] bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col gap-4 p-4 md:p-5 md:min-h-0 md:overflow-y-auto md:flex-shrink-0">

          {isToefl ? (
            <>
              <div>
                <span className="px-3.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 font-extrabold rounded-full text-[10.5px] uppercase tracking-wider">
                  Task {task.task + 1} of {tasks.length}
                </span>
                <p className="mt-2.5 text-[15px] font-bold leading-snug text-slate-900">{task.name}</p>
                <p className="text-[12px] text-slate-500 mt-0.5">Recording {task.pos} of {task.count} · {qStart === qEnd ? `Question ${qStart}` : `Questions ${qStart}–${qEnd}`}</p>
              </div>
              <SpeakerCard scene={scene} talking={activePlaying && isSpeaking} />
            </>
          ) : (
            <>
              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <div className="relative h-36 bg-slate-100">
                  {scene.photo ? (
                    <Image key={scene.photo.src} src={scene.photo.src} alt={scene.photo.alt} fill sizes="(min-width: 768px) 352px, 100vw" priority className="object-cover" />
                  ) : (
                    <SpeakerCard scene={scene} talking={activePlaying && isSpeaking} />
                  )}
                  <div className="absolute inset-0" aria-hidden="true" style={{ background: "linear-gradient(180deg, transparent 45%, rgb(18 23 43 / .55))" }} />
                  <span className="absolute left-3 bottom-2.5 inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-slate-700 shadow-sm">
                    Part {activeIdx + 1} of {total}
                  </span>
                </div>
                <div className="px-4 py-3 bg-white border-t border-slate-100">
                  <p className="text-[14px] font-bold leading-snug text-slate-900">{current.title.replace(/^Part \d+:\s*/, "")}</p>
                  <p className="mt-1 text-[12.5px] leading-snug text-slate-500">
                    {scene.setting}{scene.speakers.length ? `. You will hear ${scene.speakers.map((s) => s.role).join(" and ")}.` : ""}
                  </p>
                  <p className="mt-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Questions {qStart}–{qEnd}</p>
                </div>
              </div>
            </>
          )}

          {isReviewPeriod ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
              <p className="text-[13px] font-bold text-emerald-800">That is the end of the recording</p>
              <p className="text-[11.5px] text-emerald-600">You have two minutes to check your answers.</p>
            </div>
          ) : playerCard}

          {!isToefl && (
            <div className="flex gap-2 flex-wrap">
              {recordings.map((_, idx) => (
                <button
                  key={idx}
                  disabled={!isReviewPeriod && idx !== activeIdx && !finished[idx]}
                  onClick={() => goTo(idx)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                    activeIdx === idx ? "text-white border-transparent" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  style={activeIdx === idx ? { backgroundColor: theme.color } : undefined}
                >
                  Part {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: the questions */}
        <div ref={questionsPaneRef} className="flex-1 md:min-h-0 md:overflow-y-auto px-4 sm:px-8 py-6 space-y-7">
          {questionsVisible ? (
            currentGroups.map((group, gi) => {
              const from = numberOf(group.questions[0].id);
              const to = numberOf(group.questions[group.questions.length - 1].id);
              const named = /^Questions?\s+\d+(?:\s*[–-]\s*\d+)?\s*[:.]?\s*(.*)$/.exec(group.label);
              const taskName = isToefl ? "" : named ? named[1] : "";
              return (
                <section key={`${activeIdx}-${gi}`} className="space-y-3.5">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="h-5 w-1 flex-shrink-0 rounded-full" style={{ backgroundColor: theme.color }} />
                    <h3 className="text-[15px] font-extrabold text-slate-900">
                      {from === to ? `Question ${from}` : `Questions ${from}–${to}`}
                    </h3>
                    {taskName && <span className="text-[11.5px] font-bold uppercase tracking-wider text-slate-500">{taskName}</span>}
                  </div>
                  <QuestionGroupRenderer
                    group={group}
                    selectedAnswers={answers}
                    onSelectOption={handleSelect}
                    onTextAnswer={handleText}
                    getOverallNumber={numberOf}
                    theme={theme}
                    questionRefs={questionRefs}
                  />
                </section>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: theme.colorLight }}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke={theme.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
                </svg>
              </div>
              <p className="text-[15px] font-bold text-slate-900">
                {needsTap && !activeStarted ? "Tap play to hear the recording" : "Listen to the recording"}
              </p>
              <p className="mt-1 text-[13px] text-slate-500">
                {qStart === qEnd ? `Question ${qStart} appears` : `Questions ${qStart}–${qEnd} appear`} when it ends. You may take notes while you listen.
              </p>
            </div>
          )}

          {sectionNav}
          {navigator}
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-7">
            <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 className="text-[17px] font-bold text-slate-900 mb-2 text-center">Submit Test?</h3>
            <p className="text-[13px] text-slate-500 mb-6 leading-relaxed text-center">
              You have {unansweredCount} unanswered {unansweredCount === 1 ? "question" : "questions"}.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-bold text-[13px] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                Keep Working
              </button>
              <button onClick={() => { setShowConfirmModal(false); handleSubmit(true); }} className="flex-1 px-4 py-2.5 text-white font-bold text-[13px] rounded-lg transition-all cursor-pointer" style={{ backgroundColor: theme.color }}>
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
