"use client";

/**
 * Landing page and exam hub.
 *
 * ── A · Landing (no exam chosen) ────────────────────────────────────────────
 * Implements "frontend pages svg illustrations/LingoPrep Home.dc.html". The
 * sections live in `src/components/home/` — one file each, in the order the
 * design lays them out.
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
 * Implements "IELTS Practice Tests v2.dc.html" — see components/hub/ExamHub.
 */

import { useExam } from "@/components/theme/ExamThemeProvider";
import { Spinner } from "@/components/brand/ui";

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
import ExamHub from "@/components/hub/ExamHub";

/**
 * The walkthrough clip, served from /public so it plays without a third-party
 * player's controls and without depending on a signed URL that expires.
 * Original source: https://streamable.com/zkdzh4
 */
const WALKTHROUGH_CLIP = "/media/exam-walkthrough.mp4";

export default function Home() {
  const { unset, hydrated } = useExam();

  // Until localStorage has been read, we cannot tell a first-time visitor from
  // a returning one. Hold for that one tick rather than flashing the picker at
  // someone who already chose. The accent is already correct — the pre-paint
  // script set it — so this spinner is themed, not crimson-by-default.
  if (!hydrated) {
    return <Spinner label="Loading…" />;
  }

  /* ═══ A · Landing — the design file, section by section ═══════════════ */
  if (unset) {
    // Nothing is chosen yet, so "practice" links go to the picker rather than
    // silently committing the visitor to the default exam.
    const pick = "#choose-path";
    const results = "/dashboard";

    return (
      <>
        <Hero />
        <SelfAssessment ctaHref={pick} />
        <ChoosePath />
        {/* Walkthrough still has no background loop. That one needs a
            self-hosted MP4 (muted + looping behind the copy) — pass
            `videoSrc` when you have one. */}
        <Walkthrough practiceHref={pick} scoringHref={results} />
        <Library href={pick} />
        <FreeForever ctaHref={pick} />
        <StartHere libraryHref={pick} practiceHref={pick} resultsHref={results} />
        <ExamFeel videoSrc={WALKTHROUGH_CLIP} ctaHref={pick} />
        <Questions ctaHref={pick} />
        <ExploreAll href={pick} />
      </>
    );
  }

  /* ═══ B · Exam chosen — one accent governs the whole screen ═══════════ */
  return <ExamHub />;
}
