"use client";

/**
 * Home hero — from "frontend pages svg illustrations/LingoPrep Home.dc.html".
 *
 * The right column is the design's illustration layout (variant A): the
 * laptop-and-charts art over a tinted disc, on a dot-grid ground. It replaces
 * the earlier sample score report, which the new design retires.
 *
 * Every crimson in the design is `var(--accent)` / `bg-accent-tint` here, so
 * nothing in the hero is hardcoded to one exam (brand book §07).
 */

import { ButtonLink } from "@/components/brand/ui";
import Art from "@/components/brand/Art";
import Reveal from "@/components/brand/Reveal";
import { LANDING } from "@/lib/illustrations";

const PROOFS = [
  "Free, with no locked modules",
  "All four skills scored",
  "Instant AI feedback",
];

export default function Hero() {
  return (
    <section
      className="bg-n-0 border-b border-n-200"
      style={{
        backgroundImage: "radial-gradient(var(--n-200) 1.1px, transparent 1.1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-7 py-14 sm:py-[76px] sm:pb-[84px]">
        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-10 lg:gap-14 items-center">
          {/* ── Copy ──────────────────────────────────────────────────────── */}
          <Reveal className="flex flex-col gap-[22px]">
            <span className="t-label text-n-500 text-[12.5px] tracking-[.16em]">
              Free AI-powered practice
            </span>

            <h1 className="text-[38px] leading-[1.14] sm:text-[48px] lg:text-[58px] lg:leading-[1.18] tracking-[-0.025em] text-ink">
              Achieve your
              <br />
              <span className="relative inline-block text-accent">
                dream score
                <span className="absolute left-0 right-0 bottom-[2px] h-1 rounded-full bg-accent" />
              </span>
            </h1>

            <p className="text-[16px] sm:text-[17px] leading-[1.72] text-n-600 max-w-[30rem]">
              Exam-accurate practice tests for IELTS and TOEFL, with an
              AI-generated estimate and criterion-by-criterion feedback the
              moment you finish. All four skills.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <ButtonLink
                href="#choose-path"
                trailingIcon="next"
                className="h-[52px] px-7 text-[15.5px] shadow-accent hover:-translate-y-0.5 transition-transform"
              >
                Choose your exam
              </ButtonLink>
              <ButtonLink
                href="/dashboard"
                variant="secondary"
                icon="report"
                className="h-[52px] px-6 text-[15.5px] border-n-400 hover:border-ink"
              >
                Your results
              </ButtonLink>
            </div>

            {/* Honest, checkable claims — the design's three proof points */}
            <ul className="flex flex-wrap gap-x-[26px] gap-y-3.5 pt-2.5">
              {PROOFS.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-2 text-[14px] font-bold text-n-700"
                >
                  <span className="w-[7px] h-[7px] rounded-full bg-accent shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* ── Illustration on a tinted disc ─────────────────────────────── */}
          <Reveal delay={110} className="relative flex items-center justify-center">
            <div
              className="absolute w-[78%] aspect-square rounded-full bg-accent-tint"
              aria-hidden="true"
            />
            <Art
              art={LANDING.hero}
              priority
              float
              className="relative w-full max-w-[580px]"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
