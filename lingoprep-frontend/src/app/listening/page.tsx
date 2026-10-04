"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import api from "@/lib/api";
import TestIntro from "@/components/test/TestIntro";
import ScoreReport, { type ReviewSection } from "@/components/test/ScoreReport";
import { useExam } from "@/components/theme/ExamThemeProvider";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

/**
 * One photo per recording, matched to its topic. Free Unsplash photos
 * (Unsplash License), stored in /public/media/listening so the test never
 * depends on a third-party host. Sources: public/media/listening/CREDITS.md.
 */
const SECTION_PHOTOS: Record<"ielts" | "toefl", { src: string; alt: string }[]> = {
  ielts: [
    { src: "/media/listening/ielts-1-library.jpg", alt: "Rows of library bookshelves" },
    { src: "/media/listening/ielts-2-museum.jpg", alt: "Museum gallery wall of framed paintings" },
    { src: "/media/listening/ielts-3-research.jpg", alt: "Students discussing a project at their laptops" },
    { src: "/media/listening/ielts-4-ocean.jpg", alt: "Aerial view of ocean waves meeting the shore" },
  ],
  toefl: [
    { src: "/media/listening/toefl-1-library.jpg", alt: "Library shelves of books" },
    { src: "/media/listening/toefl-2-tectonics.jpg", alt: "Mountain range formed by tectonic uplift" },
    { src: "/media/listening/toefl-3-decisions.jpg", alt: "Chess pieces, a pawn stepping forward" },
  ],
};

interface Option {
  id: string;
  text: string;
  label: string;
}

interface Question {
  id: string;
  question_text: string;
  options: Option[];
  correct_option_id: string;
  explanation?: string;
  sort_order: number;
}

interface AudioExercise {
  id: string;
  title: string;
  audio_url: string;
  duration_seconds: number;
  transcript?: string;
  difficulty: string;
  exam_type: string;
  questions: Question[];
}


export default function ListeningPage() {
  // Exam theme comes from the shared provider (src/lib/exam.ts), never a
  // local copy — see brand book §07: one accent token, set in one place.
  const { exam: examType, theme: examTheme } = useExam();
  const theme = {
    color: examTheme.accent,
    colorDark: examTheme.accentStrong,
    colorLight: examTheme.accentTint,
    name: examTheme.name,
  };

  const [exercises, setExercises] = useState<AudioExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flow control
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Review screen state
  const [isReviewPeriod, setIsReviewPeriod] = useState(false);
  const [reviewTimeLeft, setReviewTimeLeft] = useState(120); // 2 minutes in seconds

  // Audio playback states (neural TTS via backend)
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Paused mid-recording. Kept separate from "already played": a paused
  // recording must stay resumable, only a finished one is locked.
  const [isPaused, setIsPaused] = useState(false);
  const [speechProgress, setSpeechProgress] = useState(0);
  const [playedSections, setPlayedSections] = useState<Record<number, boolean>>({});
  // Neural TTS audio element + loading state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  // Whether backend TTS is available (falls back to browser speechSynthesis)
  const [useFallbackTTS, setUseFallbackTTS] = useState(false);

  // Results from backend
  const [bandScore, setBandScore] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState<number | null>(null);
  const [scorePercentage, setScorePercentage] = useState<number | null>(null);
  const [dbResults, setDbResults] = useState<any[] | null>(null);
  // Backend-confirmed: this attempt is now in the candidate's Results page.
  const [saved, setSaved] = useState<boolean | undefined>(undefined);


  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Scrollable panes, so a new section always starts at the top.
  const leftPaneRef = useRef<HTMLDivElement | null>(null);
  const questionsPaneRef = useRef<HTMLDivElement | null>(null);
  const firstSectionRender = useRef(true);
  useEffect(() => {
    if (firstSectionRender.current) { firstSectionRender.current = false; return; }
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
    window.scrollTo({ top: 0, behavior });
    leftPaneRef.current?.scrollTo({ top: 0, behavior });
    questionsPaneRef.current?.scrollTo({ top: 0, behavior });
  }, [activeSectionIdx]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    async function fetchAudios() {
      try {
        setLoading(true);
        const response = await api.get(`/api/listening/audios?exam_type=${examType}`);
        const data = response.data?.data || [];
        if (data.length > 0) {
          // Sort by ID to ensure Section 1, 2, 3, 4 ordering
          const sorted = [...data].sort((a, b) => a.id.localeCompare(b.id));
          setExercises(sorted);
        } else {
          setError(`No ${theme.name} listening exercises found in the database.`);
        }
      } catch (err) {
        console.error("Fetch listening exercises error:", err);
        setError("Failed to load test content. Please verify database seeding and backend status.");
      } finally {
        setLoading(false);
      }
    }
    fetchAudios();
  }, [examType, theme.name]);

  // Review period timer countdown
  useEffect(() => {
    if (!isReviewPeriod || submitted || reviewTimeLeft <= 0) return;

    const interval = setInterval(() => {
      setReviewTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isReviewPeriod, submitted, reviewTimeLeft]);

  // ── Neural TTS Audio Player ────────────────────────────────────────────────
  // Uses Edge-TTS backend for authentic British (IELTS) or American (TOEFL)
  // accented audio. Falls back to browser speechSynthesis only if backend
  // audio streaming fails.
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track which section the audio belongs to (for auto-advance after finish).
  const audioSectionRef = useRef<number>(0);

  const clearAdvance = () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = null;
  };

  const stopProgressTimer = () => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = null;
  };

  /** Stop any playing audio and reset state. */
  const stopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    stopProgressTimer();
    clearAdvance();
    window.speechSynthesis.cancel();
  };

  /** Go to a specific section. */
  const goToSection = (idx: number) => {
    stopSpeech();
    setIsSpeaking(false);
    setIsPaused(false);
    setSpeechProgress(0);
    setAudioLoading(false);
    setActiveSectionIdx(idx);
  };

  useEffect(() => () => { clearAdvance(); stopProgressTimer(); }, []);

  /** Recording finished: show 100%, then move on after a short pause. */
  const finishRecording = useCallback((sectionIdx: number) => {
    stopProgressTimer();
    setIsSpeaking(false);
    setIsPaused(false);
    setSpeechProgress(100);

    clearAdvance();
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      if (sectionIdx < exercises.length - 1) {
        setActiveSectionIdx((cur) => (cur === sectionIdx ? sectionIdx + 1 : cur));
        setSpeechProgress(0);
      } else {
        setIsReviewPeriod(true);
      }
    }, 3000);
  }, [exercises.length]);

  /** Start playback using neural TTS backend audio. */
  const startNeuralAudio = useCallback(async () => {
    const exercise = exercises[activeSectionIdx];
    if (!exercise) return;

    const audioId = exercise.id;
    const audioUrl = `${API_BASE}/api/listening/audio/${audioId}`;
    audioSectionRef.current = activeSectionIdx;

    setAudioLoading(true);
    setIsPaused(false);
    setSpeechProgress(0);
    setPlayedSections((prev) => ({ ...prev, [activeSectionIdx]: true }));

    try {
      const audio = audioRef.current;
      if (!audio) return;

      audio.src = audioUrl;
      audio.load();

      // Wait for enough data to begin playback
      await new Promise<void>((resolve, reject) => {
        const onCanPlay = () => { audio.removeEventListener("canplay", onCanPlay); audio.removeEventListener("error", onError); resolve(); };
        const onError = () => { audio.removeEventListener("canplay", onCanPlay); audio.removeEventListener("error", onError); reject(new Error("Audio load failed")); };
        audio.addEventListener("canplay", onCanPlay);
        audio.addEventListener("error", onError);
      });

      setAudioLoading(false);
      setIsSpeaking(true);

      // Progress tracking
      stopProgressTimer();
      progressTimerRef.current = setInterval(() => {
        if (audio && audio.duration && isFinite(audio.duration)) {
          setSpeechProgress((audio.currentTime / audio.duration) * 100);
        }
      }, 250);

      // When audio ends
      const sectionAtStart = activeSectionIdx;
      audio.onended = () => {
        stopProgressTimer();
        finishRecording(sectionAtStart);
      };

      audio.onerror = () => {
        console.error("Neural TTS audio playback error, falling back to browser TTS");
        setAudioLoading(false);
        setUseFallbackTTS(true);
        startFallbackSpeech();
      };

      await audio.play();
    } catch {
      console.error("Neural TTS failed, falling back to browser speech synthesis");
      setAudioLoading(false);
      setUseFallbackTTS(true);
      startFallbackSpeech();
    }
  }, [activeSectionIdx, exercises, finishRecording]);

  // ── Fallback: browser speechSynthesis (robotic, only if backend fails) ────
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const playbackRef = useRef<{
    section: number; chunks: string[]; starts: number[]; total: number; idx: number;
  } | null>(null);
  const boundaryPosRef = useRef(0);

  const SPEECH_RATE = 0.95;
  const CHARS_PER_SEC = 14 * SPEECH_RATE;

  const toChunks = (text: string): string[] => {
    const pieces = text.split(/\n+/)
      .flatMap((line) => line.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) ?? [])
      .map((p) => p.trim()).filter(Boolean)
      .flatMap((p) => (p.length > 220 ? (p.match(/[^,]+,?/g) ?? [p]).map((x) => x.trim()) : [p]))
      .filter(Boolean);
    const out: string[] = [];
    for (const p of pieces) {
      if (out.length && out[out.length - 1].length < 40) out[out.length - 1] += " " + p;
      else out.push(p);
    }
    return out;
  };

  const speakChunk = (i: number) => {
    const pb = playbackRef.current;
    if (!pb) return;
    pb.idx = i;
    const text = pb.chunks[i];
    const utterance = new SpeechSynthesisUtterance(text);
    currentUtteranceRef.current = utterance;
    let done = false;
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find((v) => v.lang.startsWith("en"));
    if (naturalVoice) utterance.voice = naturalVoice;
    utterance.rate = SPEECH_RATE;
    boundaryPosRef.current = pb.starts[i];
    let elapsed = 0;
    stopProgressTimer();
    progressTimerRef.current = setInterval(() => {
      if (currentUtteranceRef.current !== utterance) return;
      elapsed += 0.2;
      const est = pb.starts[i] + Math.min(text.length, elapsed * CHARS_PER_SEC);
      const pos = Math.max(est, boundaryPosRef.current);
      setSpeechProgress(Math.min(99.5, (pos / pb.total) * 100));
    }, 200);
    utterance.onboundary = (event) => {
      if (currentUtteranceRef.current !== utterance) return;
      boundaryPosRef.current = Math.max(boundaryPosRef.current, pb.starts[i] + event.charIndex);
    };
    const next = () => {
      if (done || currentUtteranceRef.current !== utterance) return;
      done = true; stopProgressTimer();
      if (i + 1 < pb.chunks.length) speakChunk(i + 1);
      else finishRecording(pb.section);
    };
    utterance.onend = next;
    utterance.onerror = (err) => {
      if (currentUtteranceRef.current !== utterance) return;
      if (err.error === "interrupted" || err.error === "canceled") return;
      next();
    };
    window.speechSynthesis.speak(utterance);
  };

  const startFallbackSpeech = () => {
    const transcript = exercises[activeSectionIdx]?.transcript;
    if (!transcript) return;
    window.speechSynthesis.cancel();
    const chunks = toChunks(transcript);
    const starts: number[] = []; let acc = 0;
    for (const c of chunks) { starts.push(acc); acc += c.length + 1; }
    playbackRef.current = { section: activeSectionIdx, chunks, starts, total: acc, idx: 0 };
    setIsPaused(false); setIsSpeaking(true); setSpeechProgress(0);
    setPlayedSections((prev) => ({ ...prev, [activeSectionIdx]: true }));
    speakChunk(0);
  };

  const togglePlay = () => {
    if (audioLoading) return; // still loading, ignore clicks

    if (isSpeaking) {
      // Pause
      if (!useFallbackTTS && audioRef.current) {
        audioRef.current.pause();
        stopProgressTimer();
      } else {
        currentUtteranceRef.current = null;
        stopProgressTimer();
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setIsPaused(true);
    } else if (isPaused) {
      // Resume
      setIsPaused(false);
      setIsSpeaking(true);
      if (!useFallbackTTS && audioRef.current && audioRef.current.src) {
        // Restart progress tracker
        progressTimerRef.current = setInterval(() => {
          const audio = audioRef.current;
          if (audio && audio.duration && isFinite(audio.duration)) {
            setSpeechProgress((audio.currentTime / audio.duration) * 100);
          }
        }, 250);
        audioRef.current.play();
      } else {
        const pb = playbackRef.current;
        if (pb) speakChunk(pb.idx);
      }
    } else {
      // First play — recording can only play once!
      if (playedSections[activeSectionIdx]) return;
      if (!useFallbackTTS) {
        startNeuralAudio();
      } else {
        startFallbackSpeech();
      }
    }
  };

  // Helper: flatten all questions
  const allQuestions = exercises.reduce<Question[]>((acc, ex) => {
    return [...acc, ...ex.questions];
  }, []);

  const handleSelect = (qId: string, oId: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: oId }));
  };

  const handleSubmit = async (force: boolean = false) => {
    if (exercises.length === 0 || submitted) return;

    if (!force) {
      const unanswered = allQuestions.length - Object.keys(selectedAnswers).length;
      if (unanswered > 0) {
        setShowConfirmModal(true);
        return;
      }
    }

    // Stop audio
    stopSpeech();
    setIsSpeaking(false);
    setAudioLoading(false);

    try {
      setLoading(true);
      const answersPayload = allQuestions.map((q) => ({
        question_id: q.id,
        selected_option_id: selectedAnswers[q.id] || "",
      }));

      const res = await api.post("/api/listening/submit-full", {
        answers: answersPayload,
        exam_type: examType,
      });

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
    setIsReviewPeriod(false);
    setReviewTimeLeft(120);
    setPlayedSections({});
    setSpeechProgress(0);
    setIsPaused(false);
    setAudioLoading(false);
    setUseFallbackTTS(false);
    clearAdvance();
    currentUtteranceRef.current = null;
    setIsTestStarted(false);
    setActiveSectionIdx(0);
    stopSpeech();
  };

  const handleNavClick = (qIndex: number) => {
    let questionCount = 0;
    for (let eIdx = 0; eIdx < exercises.length; eIdx++) {
      const exQuestions = exercises[eIdx].questions;
      if (qIndex >= questionCount && qIndex < questionCount + exQuestions.length) {
        setActiveSectionIdx(eIdx);
        const qId = exQuestions[qIndex - questionCount].id;
        setTimeout(() => {
          const el = questionRefs.current[qId];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
        break;
      }
      questionCount += exQuestions.length;
    }
  };

  const getOverallQuestionNumber = (qId: string) => {
    return allQuestions.findIndex((q) => q.id === qId) + 1;
  };

  if (loading && exercises.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] flex-col gap-3">
        <div
          className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${theme.color} transparent transparent transparent` }}
        />
        <p className="text-[14px] text-slate-500 font-medium">Loading {theme.name} listening exam content...</p>
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
    return (
      <TestIntro
        skill="listening"
        title={`${theme.name} Listening Test`}
        meta={examType === "toefl" ? "1 Conversation + 2 Academic Lectures · 17 Questions" : "4 Sections · 40 Questions"}
        subhead="Exam structure & audio rules"
        points={[
          { label: "Audio playback:", text: "Each recording is played exactly ONCE. Playback cannot be restarted once completed." },
          examType === "toefl"
            ? { label: "Recordings:", text: "One campus conversation and two academic lectures (17 questions total)." }
            : { label: "Sections:", text: "4 distinct conversational and academic listening modules (40 questions total)." },
          { label: "Review period:", text: "A 2-minute review countdown begins automatically after all audios complete." },
          examType === "toefl"
            ? { label: "🇺🇸 Authentic accent:", text: "Audio uses studio-quality North American English neural voices for an authentic TOEFL experience." }
            : { label: "🇬🇧 Authentic accent:", text: "Audio uses studio-quality British English (UK RP) neural voices for an authentic IELTS experience." },
        ]}
        instructions={<>Ensure your speakers or headphones are connected and set to a comfortable volume. The first play may take a few seconds while the audio is generated. Once you press &ldquo;Start exam&rdquo;, the audio player interface will load.</>}
        onStart={() => {
          setIsTestStarted(true);
          window.speechSynthesis.getVoices();
        }}
      />
    );
  }

  // 2. Score report ("Listening Score Report.dc.html")
  if (submitted) {
    const optionText = (q: Question, id?: string) => {
      const o = q.options.find((x) => x.id === id);
      return o ? `${o.label}. ${o.text}` : null;
    };
    const sections: ReviewSection[] = exercises.map((ex) => ({
      title: ex.title,
      material: ex.transcript ? { kind: "transcript", text: ex.transcript } : undefined,
      items: ex.questions.map((q) => {
        const r = dbResults?.find((x) => x.question_id === q.id);
        const correctId = (r?.correct as string) || q.correct_option_id;
        return {
          id: q.id,
          num: getOverallQuestionNumber(q.id),
          question: q.question_text,
          your: optionText(q, selectedAnswers[q.id] || (r?.selected as string)),
          answer: optionText(q, correctId) ?? "",
          ok: !!r?.is_correct,
          why: (r?.explanation as string) || q.explanation || null,
        };
      }),
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

  // 3. Active Test Screen
  const currentExercise = exercises[activeSectionIdx];
  const totalSections = exercises.length;
  const qStart = getOverallQuestionNumber(currentExercise.questions[0].id);
  const qEnd   = getOverallQuestionNumber(currentExercise.questions[currentExercise.questions.length - 1].id);

  // Clean section cards - gradient bg + SVG icon
  const sectionCards = [
    {
      bg: "var(--n-100)", color: "var(--n-600)", label: "Telephone Conversation",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--n-600)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 010.07 2.18 2 2 0 012.07.07h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.29 6.29l.41-1.21a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
        </svg>
      )
    },
    {
      bg: "#F0FDF4", color: "#22C55E", label: "Training / Social Context",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      )
    },
    {
      bg: "#FFF7ED", color: "#F97316", label: "General Training Monologue",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      bg: "#F5F3FF", color: "#8B5CF6", label: "Academic Lecture",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      )
    },
  ];
  const toeflSectionCards = [
    {
      bg: "var(--n-100)", color: "var(--n-600)", label: "Campus Conversation",
      svg: (<svg viewBox="0 0 24 24" fill="none" stroke="var(--n-600)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 010.07 2.18 2 2 0 012.07.07h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.29 6.29l.41-1.21a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>)
    },
    {
      bg: "#F5F3FF", color: "#8B5CF6", label: "Academic Lecture 1",
      svg: (<svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>)
    },
    {
      bg: "#FFF7ED", color: "#F97316", label: "Academic Lecture 2",
      svg: (<svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>)
    },
  ];
  const card = examType === "toefl"
    ? (toeflSectionCards[activeSectionIdx] ?? toeflSectionCards[0])
    : (sectionCards[activeSectionIdx] ?? sectionCards[0]);
  const photos = SECTION_PHOTOS[examType === "toefl" ? "toefl" : "ielts"];
  const photo = photos[activeSectionIdx] ?? photos[0];
  // The play button locks only after the recording has fully played.
  const locked = !!playedSections[activeSectionIdx] && !isSpeaking && !isPaused;
  const accentLabel = examType === "toefl" ? "🇺🇸 North American English" : "🇬🇧 British English (UK RP)";

  return (
    <>
    {/* Hidden HTML5 audio element for neural TTS playback */}
    <audio ref={audioRef} preload="none" style={{ display: "none" }} />
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col">

      {/* TOP BAR */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[15px] sm:text-[17px] font-extrabold tracking-tight flex-shrink-0" style={{ color: theme.color }}>LingoPrep</span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-[12px] sm:text-[14px] font-semibold text-slate-600 hidden sm:inline truncate">{theme.name} Listening Test</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isReviewPeriod && (
            <div className="flex items-center gap-1.5 text-[13px] font-mono font-bold text-[var(--error)] bg-[var(--error-tint)] border border-[var(--error)] px-3 py-1.5 rounded-lg">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {formatTime(reviewTimeLeft)}
            </div>
          )}
          <button onClick={() => handleSubmit(false)}
            className="px-3 sm:px-5 py-2 text-white font-bold text-[12px] sm:text-[13px] rounded-lg transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: theme.color }}
          >Finish</button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* LEFT PANEL */}
        <div ref={leftPaneRef} className="md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col gap-4 p-4 md:p-5 overflow-y-auto md:flex-shrink-0">

          {/* Section photo card */}
          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <div className="relative h-36 bg-slate-100">
              <Image
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 288px, 100vw"
                priority
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                aria-hidden="true"
                style={{ background: "linear-gradient(180deg, transparent 45%, rgb(18 23 43 / .55))" }}
              />
              <span className="absolute left-3 bottom-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-slate-700 shadow-sm">
                {card.svg && <span className="[&>svg]:w-3.5 [&>svg]:h-3.5 flex">{card.svg}</span>}
                {card.label}
              </span>
            </div>
            <div className="px-4 py-2.5 bg-white border-t border-slate-100 text-center">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                Part {activeSectionIdx + 1}: Questions {qStart}-{qEnd}
              </p>
            </div>
          </div>

          {/* Section info row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] font-bold text-slate-800">Section {activeSectionIdx + 1}</p>
              <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">{currentExercise.title}</p>
            </div>
            <span
              className="px-2.5 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider text-white flex-shrink-0"
              style={{ backgroundColor: theme.color }}
            >
              Q {qStart}-{qEnd}
            </span>
          </div>

          {/* Audio player */}
          {isReviewPeriod ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p className="text-[13px] font-bold text-emerald-800">All Recordings Complete</p>
              <p className="text-[11.5px] text-emerald-600">Review your answers before submitting.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              {/* Accent badge */}
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider border" style={{ backgroundColor: theme.colorLight, color: theme.colorDark, borderColor: theme.color + '33' }}>
                  {accentLabel}
                </span>
              </div>
              {/* Waveform bars */}
              <div className="flex justify-center items-end gap-1 h-8">
                {[5,12,8,18,10,22,16,26,14,20,9,16,7].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full"
                    style={{
                      height: isSpeaking ? `${h}px` : audioLoading ? "6px" : "3px",
                      backgroundColor: isSpeaking ? theme.color : audioLoading ? theme.color + '80' : "#CBD5E1",
                      transition: "height 0.2s ease",
                      animation: isSpeaking ? `pulse 0.5s ease-in-out ${i * 0.08}s infinite alternate` : audioLoading ? `pulse 0.8s ease-in-out ${i * 0.1}s infinite alternate` : "none",
                    }}
                  />
                ))}
              </div>
              {/* Play + progress */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  disabled={locked || audioLoading}
                  aria-label={audioLoading ? "Generating audio..." : isSpeaking ? "Pause recording" : isPaused ? "Resume recording" : locked ? "Recording already played" : "Play recording"}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-white flex-shrink-0 transition-all shadow enabled:cursor-pointer enabled:hover:scale-105 enabled:active:scale-95 disabled:cursor-not-allowed"
                  style={{ backgroundColor: locked ? "#94a3b8" : theme.color }}
                >
                  {audioLoading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : isSpeaking ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="5" y="4" width="4" height="16" rx="1"/>
                      <rect x="15" y="4" width="4" height="16" rx="1"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-600">
                      {audioLoading ? "Generating audio..." : isSpeaking ? "Listening..." : isPaused ? "Paused" : speechProgress === 100 ? "Completed" : locked ? "Played once" : "Ready to play"}
                    </span>
                    <span className="text-slate-400 font-mono">{Math.round(speechProgress)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${speechProgress}%`, backgroundColor: theme.color }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[13px] font-bold text-slate-800 mb-2">Instructions</p>
            <p className="text-[12.5px] text-slate-600 leading-relaxed">
              {currentExercise.transcript
                ? currentExercise.transcript.slice(0, 180).trim() + "..."
                : "You will hear a recording for this section. Answer the questions as you listen."}
            </p>
            {!isReviewPeriod && (
              <p className="text-[12px] font-bold mt-3" style={{ color: theme.color }}>
                Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.
              </p>
            )}
          </div>

          {/* Section pills */}
          <div className="flex gap-2 flex-wrap">
            {exercises.map((_, idx) => (
              <button
                key={idx}
                disabled={!isReviewPeriod && idx !== activeSectionIdx}
                onClick={() => goToSection(idx)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  activeSectionIdx === idx
                    ? "text-white border-transparent"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                style={activeSectionIdx === idx ? { backgroundColor: theme.color } : undefined}
              >
                Section {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - Questions */}
        <div ref={questionsPaneRef} className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
          <div className="mb-4">
            <h2 className="text-[18px] font-bold text-slate-900">{currentExercise.title}</h2>
            <p className="text-[13px] text-slate-500 mt-1">
              Questions {qStart}-{qEnd} - Choose the correct letter A, B, C or D.
            </p>
          </div>

          {currentExercise.questions.map((q) => {
            const overallNum = getOverallQuestionNumber(q.id);
            const userSelectedOpt = selectedAnswers[q.id];

            return (
              <div
                key={q.id}
                ref={(el) => { questionRefs.current[q.id] = el; }}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
                  userSelectedOpt ? "border-slate-300" : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[12px] font-extrabold flex-shrink-0"
                    style={{ backgroundColor: theme.color }}
                  >
                    {overallNum}
                  </span>
                  <p className="text-[14.5px] font-semibold text-slate-900 leading-snug pt-0.5">
                    {q.question_text}
                  </p>
                </div>

                <div className="space-y-2 pl-10">
                  {q.options.map((opt) => {
                    const isSelected = userSelectedOpt === opt.id;
                    return (
                      <label
                        key={opt.id}
                        onClick={() => handleSelect(q.id, opt.id)}
                        className={`flex items-center gap-3 py-2.5 px-4 rounded-xl border cursor-pointer text-[13.5px] transition-all select-none ${
                          isSelected
                            ? "font-semibold border-transparent shadow-sm"
                            : "border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700"
                        }`}
                        style={isSelected ? { backgroundColor: theme.colorLight, borderColor: theme.color, color: theme.color } : undefined}
                      >
                        <span
                          className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                          style={isSelected ? { borderColor: theme.color } : { borderColor: "#CBD5E1" }}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.color }}/>}
                        </span>
                        <span className="font-bold w-4 text-slate-400">{opt.label}.</span>
                        <span className="flex-1">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Clean Inline Navigation Bar below questions */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-3 mt-6">
            <button
              disabled={activeSectionIdx === 0}
              onClick={() => goToSection(activeSectionIdx - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              <span>Previous Section</span>
            </button>

            {activeSectionIdx < totalSections - 1 ? (
              <button
                onClick={() => goToSection(activeSectionIdx + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all shadow-sm hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#1e293b" }}
              >
                <span>Next Section</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                className="flex items-center gap-1.5 px-6 py-2.5 text-white font-bold text-[13px] rounded-xl transition-all shadow-sm hover:opacity-90 active:scale-95"
                style={{ backgroundColor: theme.color }}
              >
                <span>Finish Test</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-7">
            <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 className="text-[17px] font-bold text-slate-900 mb-2 text-center">Submit Exam?</h3>
            <p className="text-[13px] text-slate-500 mb-6 leading-relaxed text-center">
              You have {allQuestions.length - Object.keys(selectedAnswers).length} unanswered questions.
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
    </>
  );
}
