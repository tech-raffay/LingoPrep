"use client";

/**
 * "English self-assessment tool" band — from
 * "frontend pages svg illustrations/LingoPrep Home.dc.html".
 *
 * NOTE FOR THE BUILD: the twelve-question assessment this section describes is
 * not implemented yet. The CTA therefore points at the exam picker, which is
 * the nearest real action. Wire it to the questionnaire once that exists.
 *
 * The right-hand panel is the design's illustration layout (variant A): the
 * desk illustration on a pale amber dot ground, with the "Suggested focus"
 * card pinned to the corner. The accent chip reads var(--accent) so it follows
 * the exam theme.
 */

import Icon from "@/components/brand/Icon";
import Art from "@/components/brand/Art";
import Reveal from "@/components/brand/Reveal";
import { LANDING } from "@/lib/illustrations";

const CHIPS = ["12 questions", "About 4 minutes", "No sign-up"];

export default function SelfAssessment({ ctaHref }: { ctaHref: string }) {
  return (
    <section className="bg-n-0">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-7 pt-14">
        <Reveal className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] rounded-feature border border-amber-300 bg-amber-50 overflow-hidden">
          {/* ── Copy ──────────────────────────────────────────────────────── */}
          <div className="p-8 sm:px-10 sm:py-11 flex flex-col gap-[18px] justify-center">
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
                className="inline-flex h-[50px] items-center gap-2 rounded-full bg-accent px-[30px] text-[15px] font-bold text-accent-on shadow-accent transition-colors duration-[120ms] hover:bg-accent-strong hover:text-accent-on"
              >
                Get started
                <Icon name="next" size={16} />
              </a>
            </div>
          </div>

          {/* ── Illustration ──────────────────────────────────────────────── */}
          <div className="relative min-h-[320px] bg-amber-150 border-t lg:border-t-0 lg:border-l border-amber-300 overflow-hidden flex items-center justify-center px-6 sm:px-8 pt-6 pb-24 sm:pb-6">
            <div
              className="absolute inset-0"
              aria-hidden="true"
              style={{
                backgroundImage:
                  "radial-gradient(rgb(245 158 11 / .22) 1.4px, transparent 1.4px)",
                backgroundSize: "22px 22px",
              }}
            />
            <Art
              art={LANDING.selfAssessment}
              float
              className="relative w-full max-w-[470px]"
            />

            <div className="absolute bottom-[22px] right-[22px] rounded-[14px] bg-n-0 shadow-[0_12px_26px_rgb(120_60_0/0.14)] px-3.5 py-3">
              <div className="t-label text-n-500 mb-[7px]">Suggested focus</div>
              <div className="flex gap-2 flex-wrap">
                <span className="rounded-full bg-accent-tint px-2.5 py-[5px] text-[12px] font-bold text-accent-on-tint">
                  Listening · Part 3
                </span>
                <span className="rounded-full bg-n-100 px-2.5 py-[5px] text-[12px] font-bold text-n-700">
                  Writing Task 2
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
