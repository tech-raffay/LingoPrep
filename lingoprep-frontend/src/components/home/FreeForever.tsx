"use client";

/**
 * "No paywall, no locked skills" — from "LingoPrep Home.dc.html".
 *
 * The left panel is the design's photo slot. Rather than ship a "Photo slot"
 * chip to production it renders as an ink panel with the dot texture and the
 * headline card, which stands on its own; add a §11-compliant photograph
 * (natural light, mid-action, 4:3) as the panel background when you have one.
 *
 * The four bullets use the semantic success green, not the exam accent — §07
 * keeps confirmation green in both exams.
 */

import Icon from "@/components/brand/Icon";

const BULLETS = [
  "All four skills, full length, with no account required to start.",
  "Every band comes with the criteria, an explanation and a next action.",
  "Transcripts, model answers and worked explanations after each test.",
  "No countdown offers, no fake scarcity, no upsell screens.",
];

export default function FreeForever({ ctaHref }: { ctaHref: string }) {
  return (
    <section className="bg-n-0">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-7 pt-20 sm:pt-24">
        <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] rounded-feature border border-n-300 overflow-hidden">
          {/* ── Image slot ────────────────────────────────────────────────── */}
          <div
            className="relative min-h-[300px] flex items-end p-8"
            style={{ background: "linear-gradient(160deg, #12172b, #1f2742)" }}
          >
            <div
              className="absolute inset-0"
              aria-hidden="true"
              style={{
                backgroundImage:
                  "radial-gradient(rgb(255 255 255 / .08) 1.1px, transparent 1.1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="relative flex flex-col gap-3.5">
              <span className="self-start rounded-full bg-amber-500 px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-[.1em] text-ink">
                Free forever
              </span>
              <div className="text-[24px] sm:text-[26px] font-bold leading-[1.3] text-white max-w-[16rem]">
                Every module unlocked, for every candidate
              </div>
            </div>
          </div>

          {/* ── Copy ──────────────────────────────────────────────────────── */}
          <div className="p-8 sm:p-10 flex flex-col gap-4 justify-center">
            <h2 className="text-[26px] sm:text-[30px]">
              No paywall, no locked skills
            </h2>
            <p className="text-[15.5px] leading-[1.72] text-n-600">
              Credible practice is priced out of reach for most candidates.
              LingoPrep gives the whole test away and stays honest about what an
              AI estimate can and cannot tell you.
            </p>
            <ul className="flex flex-col gap-3 m-0 p-0 list-none">
              {BULLETS.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 text-[14.5px] leading-[1.65] text-n-700"
                >
                  <Icon
                    name="check"
                    size={20}
                    className="text-success shrink-0 mt-0.5"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="pt-1.5">
              <a
                href={ctaHref}
                className="inline-flex h-[50px] items-center gap-2 rounded-full bg-accent px-7 text-[15px] font-bold text-accent-on shadow-accent transition-colors duration-[120ms] hover:bg-accent-strong"
              >
                Start a practice test
                <Icon name="next" size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
