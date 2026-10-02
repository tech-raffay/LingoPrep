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

          {/* ── Illustration ──────────────────────────────────────────────── */}
          <div
            className="relative min-h-[320px] overflow-hidden flex items-center justify-center"
            style={{
              background:
                "linear-gradient(150deg, var(--amber-50), var(--amber-100) 60%, var(--amber-200))",
            }}
            aria-hidden="true"
          >
            {/* subtle dot texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(rgb(180 119 13 / .15) 1.4px, transparent 1.4px)",
                backgroundSize: "22px 22px",
              }}
            />
            {/* SVG illustration — person writing at a large piece of paper */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/writing-person-2.svg"
              alt=""
              className="relative w-full max-w-[340px] h-auto object-contain drop-shadow-lg"
              style={{ animation: "lp-float 7s ease-in-out infinite" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
