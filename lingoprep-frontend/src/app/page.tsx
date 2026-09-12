"use client";

/**
 * Landing page and exam hub.
 *
 * ── Brand corrections made here ──────────────────────────────────────────────
 * §01 "Free without asterisks" and §02 "Calm examiner, not cheerleader":
 *   removed the invented social proof — a row of stock-photo avatars captioned
 *   "Trusted by students worldwide" and an overlay card reading "Target Score
 *   IELTS 8.0 / Probability 92%". None of those numbers were real, and a
 *   platform whose whole pitch is honest scoring cannot open with fabricated
 *   statistics. The hero now states only what is actually true and checkable.
 *
 * §11 Photography: "never stock-smiling into camera". The three Unsplash
 *   portraits and the smiling-students hero image are gone. Per §11, "where a
 *   diagram is needed, build it from the icon vocabulary" — so the hero panel
 *   is now a real score-report preview drawn from the brand's own components.
 *
 * §07 on the picker: this is the one screen that shows crimson and blue
 *   together, and deliberately so — they are identity swatches for a choice,
 *   not the interface accent. The page chrome stays ink and neutral, so there
 *   is never a moment where the user cannot tell which exam they are "in".
 *   The moment a path is chosen, exactly one accent governs everything.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EXAM_THEMES, type ExamType } from "@/lib/exam";
import { PICKER_HREF, useExam } from "@/components/theme/ExamThemeProvider";
import Icon, { type IconName } from "@/components/brand/Icon";
import {
  Badge, Button, ButtonLink, Card, CriterionBar, Eyebrow, ScoreCircle, Spinner,
} from "@/components/brand/ui";

const MODULES: Array<{ key: string; title: string; icon: IconName; ielts: string; toefl: string }> = [
  { key: "listening", title: "Listening", icon: "listening",
    ielts: "Four sections, 40 questions, with transcripts after scoring.",
    toefl: "One conversation and two academic lectures, 17 questions." },
  { key: "reading", title: "Reading", icon: "reading",
    ielts: "Three passages of rising complexity, 40 questions in 60 minutes.",
    toefl: "Two academic passages, 20 questions in 35 minutes." },
  { key: "writing", title: "Writing", icon: "writing",
    ielts: "Task 1 and Task 2 prompts, scored against the four band criteria.",
    toefl: "Integrated and independent tasks, scored 0–30." },
  { key: "speaking", title: "Speaking", icon: "speaking",
    ielts: "Record all three parts; get fluency and pronunciation feedback.",
    toefl: "Independent and integrated tasks with a transcribed response." },
];

/* ── The four brand principles (§01) ─────────────────────────────────────── */
const PRINCIPLES: Array<{ title: string; body: string; icon: IconName; tone: string }> = [
  { title: "Exam-true", icon: "timer", tone: "text-accent",
    body: "Timers, layouts and question types mirror the real test. No invented formats." },
  { title: "Legible first", icon: "reading", tone: "text-info",
    body: "Reading passages set the pace of the design. Decoration never competes with text." },
  { title: "Explain the score", icon: "report", tone: "text-warning",
    body: "Every band comes with criteria, an explanation and a next action." },
  { title: "Free without asterisks", icon: "secure", tone: "text-success",
    body: "No locked modules, no countdown offers, no fake scarcity anywhere." },
];

export default function Home() {
  const router = useRouter();
  const { exam, theme, unset, hydrated, persistExam, examHref, withExam } = useExam();

  // Until localStorage has been read, we cannot tell a first-time visitor from
  // a returning one. Hold for that one tick rather than flashing the picker at
  // someone who already chose. The accent is already correct — the pre-paint
  // script set it — so this spinner is themed, not crimson-by-default.
  if (!hydrated) {
    return <Spinner label="Loading…" />;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     A · No exam chosen — hero + picker. Chrome stays neutral.
     ═══════════════════════════════════════════════════════════════════════ */
  if (unset) {
    return (
      <>
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="tx-dots border-b border-n-300">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6">
                <Eyebrow className="mb-4">Free AI-powered practice</Eyebrow>
                <h1 className="text-[36px] leading-[42px] sm:text-[48px] sm:leading-[52px] tracking-[-0.02em] mb-5">
                  Achieve your{" "}
                  <span className="relative inline-block text-accent">
                    dream score
                    {/* Hand-drawn underline, accent-coloured */}
                    <svg
                      className="absolute left-0 -bottom-1 w-full h-3 text-accent"
                      viewBox="0 0 100 10" preserveAspectRatio="none" fill="none" aria-hidden="true"
                    >
                      <path d="M3 7 C 30 3, 70 3, 97 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </h1>
                <p className="t-body-lg text-n-600 max-w-lg mb-7">
                  Exam-accurate practice tests for IELTS and TOEFL, with an
                  AI-generated estimate and criterion-by-criterion feedback the
                  moment you finish. All four skills. No account needed.
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  <ButtonLink href="#choose-path" trailingIcon="next">
                    Choose your exam
                  </ButtonLink>
                  <ButtonLink href="/dashboard" variant="secondary" icon="report">
                    Your results
                  </ButtonLink>
                </div>

                {/* Honest, checkable facts — not invented social proof */}
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {[
                    { icon: "secure" as IconName, text: "Free, with no locked modules" },
                    { icon: "progress" as IconName, text: "All four skills scored" },
                    { icon: "ai" as IconName, text: "Instant AI feedback" },
                  ].map((f) => (
                    <li key={f.text} className="flex items-center gap-2 text-[13px] font-bold text-n-600">
                      <Icon name={f.icon} size={16} className="text-accent" />
                      {f.text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Score-report preview, built from the icon vocabulary ─── */}
              <div className="lg:col-span-6">
                <Card feature className="p-6 sm:p-7 shadow-e2">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Icon name="report" size={20} className="text-n-500" />
                      <span className="t-label text-n-500">Sample score report</span>
                    </div>
                    <Badge tone="ai" icon="ai">AI estimate</Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-7">
                    <ScoreCircle
                      value={7} max={9} decimals={1}
                      label="IELTS band" caption="Practice estimate" size={124}
                    />
                    <div className="flex-1 w-full space-y-4">
                      <CriterionBar label="Task achievement" value={7.0} max={9} />
                      <CriterionBar label="Coherence" value={7.5} max={9} />
                      <CriterionBar label="Lexical resource" value={6.5} max={9} />
                      <CriterionBar label="Grammatical range" value={7.0} max={9} />
                    </div>
                  </div>

                  <p className="text-[12px] text-n-500 mt-6 pt-5 border-t border-n-200">
                    An illustration of the report you receive. Practice scores
                    are AI-generated estimates, not official results.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ── Choose your path ─────────────────────────────────────────────
            The only screen where both exam colours appear, as identity
            swatches for a choice. Chrome stays ink and neutral. (§07)
            ───────────────────────────────────────────────────────────────── */}
        <section id="choose-path" className="bg-n-50 border-b border-n-300 py-16 sm:py-20 scroll-mt-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <Eyebrow className="mb-3">Step one</Eyebrow>
              <h2 className="mb-3">Choose your path</h2>
              <p className="t-body-lg text-n-600">
                Pick your target examination. Everything after this point —
                timings, question types, scoring scale and the colour of the
                interface — follows the exam you choose.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {(["ielts", "toefl"] as ExamType[]).map((id) => {
                const t = EXAM_THEMES[id];
                return (
                  <Card key={id} feature interactive className="p-7 flex flex-col">
                    <div className="flex items-center gap-3.5 mb-5">
                      {/* Identity swatch — the one place a fixed exam colour
                          is correct, because it labels the choice itself. */}
                      <span
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-[17px] shrink-0"
                        style={{ backgroundColor: t.accent }}
                      >
                        {t.name.charAt(0)}
                      </span>
                      <div>
                        <h3>{id === "toefl" ? "TOEFL iBT®" : "IELTS®"}</h3>
                        <p className="text-[13px] text-n-500 font-bold">{t.scoreRange}</p>
                      </div>
                    </div>

                    <p className="t-body text-n-600 mb-6">
                      {id === "ielts"
                        ? "Academic and General Training practice, scored as IELTS Academic bands across all four skills."
                        : "iBT-format practice with integrated tasks and academic source material, scored on the 0–30 section scale."}
                    </p>

                    <ul className="grid grid-cols-2 gap-2 mb-7">
                      {MODULES.map((m) => (
                        <li
                          key={m.key}
                          className="flex items-center gap-2 py-2 px-3 bg-n-100 rounded-input text-[12px] font-bold text-n-600"
                        >
                          <Icon name={m.icon} size={16} className="text-n-500" />
                          {m.title}
                        </li>
                      ))}
                    </ul>

                    {/* A real link, not a button: the exam lives in the URL, so
                        selecting one is a navigation. It also means the accent
                        is set by the pre-paint script on the next document,
                        which makes a wrong-colour frame impossible. */}
                    <a
                      href={examHref(id)}
                      onClick={() => persistExam(id)}
                      className="mt-auto w-full h-11 inline-flex items-center justify-center gap-2
                                 rounded-full text-white font-bold text-[15px]
                                 transition-[filter] duration-[120ms] hover:brightness-90 shadow-e1"
                      style={{ backgroundColor: t.accent }}
                    >
                      Start {t.name} practice
                      <Icon name="next" size={16} />
                    </a>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── The four principles (§01) ────────────────────────────────────── */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <Eyebrow className="mb-3">Why it works</Eyebrow>
              <h2 className="mb-3">Free, honest test preparation</h2>
              <p className="t-body-lg text-n-600">
                Credible practice is priced out of reach for most candidates.
                LingoPrep is built to feel as trustworthy as a paid service
                while being free, and transparent about how its AI scores you.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRINCIPLES.map((p) => (
                <div key={p.title} className="border-t-[3px] border-current pt-4" style={{ borderColor: "currentColor" }}>
                  <div className={p.tone}>
                    <Icon name={p.icon} size={24} />
                  </div>
                  <h3 className="text-[17px] leading-[24px] mt-3 mb-2">{p.title}</h3>
                  <p className="text-[14px] leading-[23px] text-n-600">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     B · Exam chosen — one accent governs the whole screen.
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <section className="tx-dots border-b border-n-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div>
              <a
                href={PICKER_HREF}
                onClick={() => persistExam(null)}
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-accent hover:text-accent-strong transition-colors duration-[120ms] mb-4"
              >
                <Icon name="chevronRight" size={16} className="rotate-180" />
                Change exam
              </a>
              <h1 className="text-[32px] leading-[38px] sm:text-[40px] sm:leading-[46px] mb-3">
                {theme.name} practice tests
              </h1>
              <p className="t-body-lg text-n-600 max-w-xl">
                {exam === "toefl"
                  ? "Practice the iBT format across Reading, Listening, Speaking and Writing, with section scores on the 0–30 scale."
                  : "Practice IELTS Academic across Listening, Reading, Writing and Speaking, with band-level feedback on every criterion."}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Badge icon="target">{theme.name}</Badge>
              <ButtonLink href={withExam("/dashboard")} variant="secondary" size="compact" icon="report">
                Your results
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            {/* Accent rule — one per section heading */}
            <span className="w-1 h-7 rounded-full bg-accent" />
            <h2 className="text-[24px] leading-[30px]">Practice by skill</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MODULES.map((m) => (
              <Link key={m.key} href={withExam(`/${m.key}`)} className="group">
                <Card interactive className="p-6 h-full flex flex-col min-h-[210px]">
                  {/* §09: resting module tile is neutral; the active one takes
                      the accent tint. 44px tile, 12px radius. */}
                  <span
                    className="w-11 h-11 rounded-xl bg-n-100 text-n-600 flex items-center justify-center mb-5
                               transition-colors duration-[120ms]
                               group-hover:bg-accent-tint group-hover:text-accent"
                  >
                    <Icon name={m.icon} size={24} />
                  </span>
                  <h3 className="text-[17px] leading-[24px] mb-1.5">{m.title}</h3>
                  <p className="text-[13px] leading-[22px] text-n-600">
                    {exam === "toefl" ? m.toefl : m.ielts}
                  </p>
                  <span
                    className="mt-auto pt-5 inline-flex items-center gap-1 text-[13px] font-bold text-accent"
                  >
                    Start practice
                    <Icon
                      name="next" size={16}
                      className="transition-transform duration-[120ms] group-hover:translate-x-0.5"
                    />
                  </span>
                </Card>
              </Link>
            ))}
          </div>

          {/* §14: scoring is AI-generated, said plainly wherever practice starts */}
          <Card className="mt-8 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Icon name="info" size={24} className="text-n-500 shrink-0" />
            <p className="t-body text-n-600 flex-1">
              Every score on LingoPrep is an AI-generated practice estimate on
              the <strong>{theme.scoreRange}</strong> scale. It is not an
              official {theme.legalName} result and cannot be used for
              admissions or visa applications.
            </p>
            <Button
              variant="ghost" size="compact" trailingIcon="next"
              onClick={() => router.push(withExam("/dashboard"))}
            >
              How scoring works
            </Button>
          </Card>
        </div>
      </section>
    </>
  );
}
