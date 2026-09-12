"use client";

/**
 * Home hero — from "LingoPrep Home.dc.html".
 *
 * Two changes from the design file, both deliberate:
 *
 *  0. The figures are set in the brand sans, not JetBrains Mono. §08 assigns
 *     band scores to the mono face, but monospace forces every glyph into an
 *     equal cell, so "7.0" rendered with a visible gap around the point and
 *     read as a different typeface from the rest of the page. They keep
 *     `tabular-nums` so the criterion column still aligns.
 *
 *  1. Every crimson in the design is `var(--accent)` here, so the hero renders
 *     blue for a TOEFL candidate. The design hardcodes #c8102e throughout;
 *     shipping that would reintroduce the exam-theme bleed (brand book §07).
 *
 *  2. The sample report follows the active exam, rather than the design's fixed
 *     "IELTS band 7.0 / 9". Note that today the landing page only renders when
 *     no exam has been chosen, so in practice this always shows the IELTS
 *     variant. The TOEFL variant exists so that the moment these sections are
 *     also shown to a candidate who has picked an exam, the report cannot end
 *     up as IELTS content under a blue accent.
 */

import { useExam } from "@/components/theme/ExamThemeProvider";
import Icon from "@/components/brand/Icon";
import { ButtonLink } from "@/components/brand/ui";

const PROOFS = [
  "Free, with no locked modules",
  "All four skills scored",
  "Instant AI feedback",
];

/** Sample report contents per exam — an illustration, labelled as one. */
const SAMPLE = {
  ielts: {
    value: "7.0",
    max: 9,
    label: "IELTS band",
    criteria: [
      { label: "Task achievement", score: "7.0", pct: 78 },
      { label: "Coherence", score: "7.5", pct: 83 },
      { label: "Lexical resource", score: "6.5", pct: 72 },
      { label: "Grammatical range", score: "7.0", pct: 78 },
    ],
  },
  toefl: {
    value: "24",
    max: 30,
    label: "TOEFL score",
    criteria: [
      { label: "Reading", score: "24", pct: 80 },
      { label: "Listening", score: "23", pct: 77 },
      { label: "Speaking", score: "22", pct: 73 },
      { label: "Writing", score: "21", pct: 70 },
    ],
  },
} as const;

export default function Hero() {
  const { exam } = useExam();
  const sample = SAMPLE[exam];
  // Fraction of the ring that is filled, for the conic gradient.
  const ringPct = Math.round(
    (parseFloat(sample.value) / sample.max) * 100
  );

  return (
    <section className="tx-dots border-b border-n-200">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-7 py-14 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-10 lg:gap-14 items-center">
          {/* ── Copy ──────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            <span className="t-label text-n-500 text-[12.5px]">
              Free AI-powered practice
            </span>

            <h1 className="text-[38px] leading-[1.14] sm:text-[48px] lg:text-[58px] tracking-[-0.025em] text-ink">
              Achieve your
              <br />
              <span className="relative inline-block text-accent">
                dream score
                {/* Solid underline bar, per the design (replaces the old swash) */}
                <span className="absolute left-0 right-0 bottom-[2px] h-1 rounded-full bg-accent" />
              </span>
            </h1>

            <p className="text-[16px] sm:text-[17px] leading-[1.72] text-n-600 max-w-[30rem]">
              Exam-accurate practice tests for IELTS and TOEFL, with an
              AI-generated estimate and criterion-by-criterion feedback the
              moment you finish. All four skills. No account needed.
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
            <ul className="flex flex-wrap gap-x-6 gap-y-3 pt-2.5">
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
          </div>

          {/* ── Sample score report ───────────────────────────────────────── */}
          <div className="rounded-[22px] border border-n-300 bg-n-0 p-6 sm:p-7 shadow-[0_22px_50px_rgb(18_23_43/0.09)]">
            <div className="flex items-center justify-between gap-3 mb-6">
              <span className="flex items-center gap-2 t-label text-n-500 text-[11px] sm:text-[12px] whitespace-nowrap">
                <Icon name="report" size={16} />
                Sample score report
              </span>
              {/* §14: every score is labelled AI-generated. Amber per the
                  design, but with the darker brown text — the design's
                  #b4770d on #fff7ec is only ~3.9:1, under the 4.5:1 that
                  §07 requires for text this size. */}
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-warning-tint px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.1em] text-amber-ink">
                <Icon name="ai" size={16} className="-ml-0.5" />
                AI estimate
              </span>
            </div>

            <div className="grid sm:grid-cols-[auto_minmax(0,1fr)] gap-7 items-center">
              {/* Conic-gradient ring, per the design */}
              <div className="text-center mx-auto">
                <div
                  className="relative w-[124px] h-[124px] rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(var(--accent) 0 ${ringPct}%, var(--accent-tint) ${ringPct}% 100%)`,
                  }}
                >
                  <div className="w-24 h-24 rounded-full bg-n-0 flex flex-col items-center justify-center">
                    <span className="text-[34px] font-bold leading-none tracking-[-0.02em] tabular-nums text-ink">
                      {sample.value}
                    </span>
                    <span className="text-[11px] font-bold text-n-500 mt-0.5">
                      out of {sample.max}
                    </span>
                  </div>
                </div>
                <div className="t-label text-n-500 mt-3">{sample.label}</div>
              </div>

              <div className="flex flex-col gap-3.5">
                {sample.criteria.map((c) => (
                  <div key={c.label}>
                    <div className="flex items-baseline justify-between gap-2.5 mb-1.5">
                      <span className="text-[14px] font-bold text-ink">
                        {c.label}
                      </span>
                      <span className="text-[14px] font-bold tabular-nums text-ink">
                        {c.score}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-accent-tint overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${c.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-6 pt-[18px] border-t border-n-200 text-[12.5px] leading-[1.7] text-n-500">
              An illustration of the report you receive. Practice scores are
              AI-generated estimates, not official results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
