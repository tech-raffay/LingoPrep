"use client";

/**
 * "English self-assessment tool" band — from "LingoPrep Home.dc.html".
 *
 * NOTE FOR THE BUILD: the twelve-question assessment this section describes is
 * not implemented yet. The CTA therefore points at the exam picker, which is
 * the nearest real action. Wire it to the questionnaire once that exists, or
 * soften the copy — as written it promises a feature the app does not have.
 *
 * The right-hand panel is the design's "illustration slot": a composed
 * placeholder built from floating cards rather than stock art (§11 forbids
 * stock-smiling photography and mandates building diagrams from the icon
 * vocabulary). Swap it for real artwork when you have it — the design file
 * marks this as an "illustration slot"; that chip is not rendered in
 * production, since a live page should not label itself unfinished.
 */

import Icon from "@/components/brand/Icon";

const CHIPS = ["12 questions", "About 4 minutes", "No sign-up"];

export default function SelfAssessment({ ctaHref }: { ctaHref: string }) {
  return (
    <section className="bg-n-0">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-7 pt-20 sm:pt-24">
        <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] rounded-feature border border-amber-300 bg-amber-50 overflow-hidden">
          {/* ── Copy ──────────────────────────────────────────────────────── */}
          <div className="p-8 sm:p-10 flex flex-col gap-4 justify-center">
            <Icon name="sparkle" size={32} className="text-amber-500" />
            <h2 className="text-[28px] sm:text-[34px] text-ink">
              English self-assessment tool
            </h2>
            <p className="text-[15.5px] leading-[1.72] text-amber-800">
              Not sure where to start? Answer twelve short questions and get an
              estimated starting band, the two skills holding your score back,
              and a practice plan for your first week.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-0.5">
              {CHIPS.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-amber-300 bg-n-0 px-3.5 py-[7px] text-[13px] font-bold text-amber-700"
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="pt-2.5">
              <a
                href={ctaHref}
                className="inline-flex h-[50px] items-center gap-2 rounded-full bg-accent px-7 text-[15px] font-bold text-accent-on shadow-accent transition-colors duration-[120ms] hover:bg-accent-strong"
              >
                Get started
                <Icon name="next" size={16} />
              </a>
            </div>
          </div>

          {/* ── Illustration slot ─────────────────────────────────────────── */}
          <div
            className="relative min-h-[320px] overflow-hidden"
            style={{
              background:
                "linear-gradient(150deg, var(--amber-400), var(--amber-500) 55%, var(--amber-600))",
            }}
            aria-hidden="true"
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(rgb(255 255 255 / .35) 1.4px, transparent 1.4px)",
                backgroundSize: "22px 22px",
              }}
            />

            {/* Floating bar-chart card */}
            <div
              className="absolute top-11 left-11 w-[124px] h-[88px] rounded-[14px] bg-white/95 shadow-[0_12px_26px_rgb(120_60_0/0.18)] p-3.5 flex items-end gap-2"
              style={{ animation: "lp-float 6s ease-in-out infinite" }}
            >
              <div className="flex-1 h-[34%] rounded bg-amber-500" />
              <div className="flex-1 h-[62%] rounded bg-amber-600" />
              <div className="flex-1 h-[88%] rounded bg-accent" />
              <div className="flex-1 h-[50%] rounded bg-amber-400" />
            </div>

            {/* Floating progress ring */}
            <div
              className="absolute top-16 right-14 w-[104px] h-[104px] rounded-full shadow-[0_12px_26px_rgb(120_60_0/0.18)] flex items-center justify-center"
              style={{
                background:
                  "conic-gradient(var(--accent) 0 62%, rgb(255 255 255 / .92) 62% 100%)",
                animation: "lp-float 7.5s ease-in-out infinite",
              }}
            >
              <div className="w-[62px] h-[62px] rounded-full bg-amber-50 flex items-center justify-center text-[17px] font-bold tabular-nums text-ink">
                62%
              </div>
            </div>

            {/* Suggested focus card */}
            <div className="absolute bottom-10 left-14 right-14 rounded-[14px] bg-white/95 shadow-[0_12px_26px_rgb(120_60_0/0.18)] px-[18px] py-4">
              <div className="t-label text-n-500 mb-2">Suggested focus</div>
              <div className="flex gap-2.5 flex-wrap">
                <span className="rounded-full bg-accent-tint px-3 py-1.5 text-[12.5px] font-bold text-accent-on-tint">
                  Listening · Part 3
                </span>
                <span className="rounded-full bg-n-100 px-3 py-1.5 text-[12.5px] font-bold text-n-700">
                  Writing Task 2
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
