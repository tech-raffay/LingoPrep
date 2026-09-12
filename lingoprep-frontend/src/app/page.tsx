"use client";

/**
 * Landing page and exam hub.
 *
 * ── A · Landing (no exam chosen) ────────────────────────────────────────────
 * Implements "LingoPrep Home.dc.html". The sections live in
 * `src/components/home/` — one file each, in the order the design lays them
 * out — because the composed page runs to roughly a thousand lines otherwise.
 *
 * Every accent surface reads var(--accent), so the whole page renders blue for
 * a TOEFL candidate (brand book §07). The only fixed exam colours are the two
 * identity swatches in ChoosePath, which label the choice itself.
 *
 * Three sections describe things that do not exist yet — the self-assessment
 * questionnaire, the article library and the walkthrough videos. Their CTAs
 * point at the nearest real destination and each file says so at the top.
 *
 * ── B · Hub (exam chosen) ──────────────────────────────────────────────────
 * Unchanged: the design file covers the landing page only.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PICKER_HREF, useExam } from "@/components/theme/ExamThemeProvider";
import Icon, { type IconName } from "@/components/brand/Icon";
import { Badge, Button, ButtonLink, Card, Spinner } from "@/components/brand/ui";

import Hero from "@/components/home/Hero";
import SelfAssessment from "@/components/home/SelfAssessment";
import ChoosePath from "@/components/home/ChoosePath";
import Walkthrough from "@/components/home/Walkthrough";
import Library from "@/components/home/Library";
import FreeForever from "@/components/home/FreeForever";
import StartHere from "@/components/home/StartHere";
import ExamFeel from "@/components/home/ExamFeel";
import Questions from "@/components/home/Questions";
import ExploreAll from "@/components/home/ExploreAll";

/**
 * The walkthrough clip. Streamable's /o/ embed path rather than its .mp4,
 * because the direct file URLs are signed and expire within days.
 * Source: https://streamable.com/zkdzh4
 */
const WALKTHROUGH_EMBED = "https://streamable.com/o/zkdzh4";

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

export default function Home() {
  const router = useRouter();
  const { exam, theme, unset, hydrated, persistExam, withExam } = useExam();

  // Until localStorage has been read, we cannot tell a first-time visitor from
  // a returning one. Hold for that one tick rather than flashing the picker at
  // someone who already chose. The accent is already correct — the pre-paint
  // script set it — so this spinner is themed, not crimson-by-default.
  if (!hydrated) {
    return <Spinner label="Loading…" />;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     A · Landing — the design file, section by section.
     ═══════════════════════════════════════════════════════════════════════ */
  if (unset) {
    // Nothing is chosen yet, so "practise" links go to the picker rather than
    // silently committing the visitor to the default exam.
    const pick = "#choose-path";
    const results = "/dashboard";

    return (
      <>
        <Hero />
        <SelfAssessment ctaHref={pick} />
        <ChoosePath />
        {/* Walkthrough still has no background loop. That one needs a
            self-hosted MP4 (muted + looping behind the copy), which a
            third-party iframe cannot do — pass `videoSrc` when you have one. */}
        <Walkthrough practiceHref={pick} scoringHref={results} />
        <Library href={pick} />
        <FreeForever ctaHref={pick} />
        <StartHere libraryHref={pick} practiceHref={pick} resultsHref={results} />
        <ExamFeel embedUrl={WALKTHROUGH_EMBED} ctaHref={pick} />
        <Questions ctaHref={pick} />
        <ExploreAll href={pick} />
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
