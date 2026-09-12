"use client";

/**
 * "Questions candidates ask" — from the "LingoPrep community" section of
 * "LingoPrep Home.dc.html". Layout is the design's: amber panel, two-column
 * top with floating question cards, and a three-up carousel with prev/next
 * and a progress rail.
 *
 * ── What was changed, and why ───────────────────────────────────────────────
 * The design advertises a Q&A forum staffed by examiners, with "2,400+
 * questions answered", "38 contributing examiners" and a "< 24h median reply
 * time". None of that exists — there is no community feature and no examiners
 * on the platform — and §01 ("free without asterisks", no invented numbers)
 * plus §02 ("calm examiner, not cheerleader") rule out inventing them. A
 * fabricated metric on the front page is also the first thing an examiner will
 * ask about in a viva.
 *
 * So the section keeps its exact shape and becomes what it can honestly be: a
 * real FAQ with real answers. The three stats are facts about the product, and
 * each card carries an answer instead of a reply count. If you build the forum
 * later, the original copy is in the design file.
 */

import { useState } from "react";
import Icon from "@/components/brand/Icon";

const FACTS = [
  { value: "All 4", label: "Skills scored end to end" },
  { value: "0", label: "Cost to practice, always" },
  { value: "AI", label: "Feedback the moment you submit" },
];

const FAQS = [
  {
    q: "How accurate is the AI band estimate compared with a real examiner?",
    a: "It is close on the measurable criteria and weaker on nuance. Treat it as a guide to what to work on, never as a predicted result.",
  },
  {
    q: "Can I use a LingoPrep score for a university application?",
    a: "No. Every score here is a practice estimate and is not accepted by any institution. Only an official test result can be used.",
  },
  {
    q: "What score do I need for a UK student visa?",
    a: "It depends on the course and the institution. Check the requirement on the exam board and university sites. This platform cannot confirm it.",
  },
  {
    q: "How many practice tests should I do before test day?",
    a: "Enough that the format stops surprising you. Most candidates find the format costs them more marks than their English does.",
  },
  {
    q: "Is the listening audio played once, like the real exam?",
    a: "Yes. The player is single-play by design, because that is the constraint you will face on the day.",
  },
  {
    q: "How do I improve Writing Task 2 coherence quickly?",
    a: "Your band report names coherence separately from grammar. Start with paragraph purpose and linking, which move that criterion fastest.",
  },
];

const PAGE = 3;

export default function Questions({ ctaHref }: { ctaHref: string }) {
  const pages = Math.ceil(FAQS.length / PAGE);
  const [page, setPage] = useState(0);
  const shown = FAQS.slice(page * PAGE, page * PAGE + PAGE);

  const navBtn = (enabled: boolean) =>
    [
      "w-[38px] h-[38px] rounded-full flex items-center justify-center border bg-n-0",
      "transition-colors duration-[120ms] cursor-pointer",
      enabled
        ? "border-ink text-ink hover:bg-n-50"
        : "border-amber-300 text-amber-300 cursor-not-allowed",
    ].join(" ");

  return (
    <section className="bg-n-0">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-7 pt-20 sm:pt-24">
        <h2 className="flex items-center gap-3 text-[26px] sm:text-[32px] mb-6">
          <span className="w-[5px] h-[30px] rounded-full bg-amber-500" />
          Questions candidates ask
        </h2>

        <div className="rounded-[26px] border border-amber-200 bg-amber-100 p-6 sm:p-10 flex flex-col gap-9">
          {/* ── Top: copy + illustration ──────────────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div className="flex flex-col gap-4">
              <h3 className="text-[24px] sm:text-[30px] max-w-[18rem]">
                Straight answers
              </h3>
              <p className="text-[15.5px] leading-[1.72] text-amber-800 max-w-[26rem]">
                What the AI estimate can and cannot tell you, what the format
                actually demands, and where a practice score stops being
                useful. No hedging.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-4 pt-1">
                {FACTS.map((f) => (
                  <div key={f.label}>
                    <div className="text-[26px] font-bold leading-none tracking-[-0.02em] text-ink">
                      {f.value}
                    </div>
                    <div className="text-[12.5px] font-bold text-amber-700 mt-1.5 max-w-[11rem]">
                      {f.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <a
                  href={ctaHref}
                  className="inline-flex h-[50px] items-center gap-2 rounded-full bg-accent px-7 text-[15px] font-bold text-accent-on shadow-accent transition-colors duration-[120ms] hover:bg-accent-strong"
                >
                  Start practicing
                  <Icon name="next" size={16} />
                </a>
              </div>
            </div>

            {/* Illustration slot — composed from the two questions themselves */}
            <div
              className="relative min-h-[260px] rounded-[20px] overflow-hidden"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(150deg, #ffe9c2, var(--amber-400))",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(rgb(255 255 255 / .4) 1px, transparent 1px)," +
                    "linear-gradient(90deg, rgb(255 255 255 / .4) 1px, transparent 1px)",
                  backgroundSize: "26px 26px",
                }}
              />
              <div className="absolute top-8 left-8 right-20 rounded-[14px] bg-n-0 shadow-[0_14px_28px_rgb(120_80_10/0.16)] px-[18px] py-4">
                <div className="text-[13px] font-bold text-ink mb-1.5">
                  How do I stop running out of time in Reading?
                </div>
                <div className="text-[12px] font-bold text-n-500">
                  Answered below
                </div>
              </div>
              <div
                className="absolute bottom-9 left-[76px] right-8 rounded-[14px] bg-n-0 shadow-[0_14px_28px_rgb(120_80_10/0.16)] px-[18px] py-4"
                style={{ animation: "lp-float 7s ease-in-out infinite" }}
              >
                <div className="text-[13px] font-bold text-ink mb-1.5">
                  Is a practice 7.0 the same as a real 7.0?
                </div>
                <div className="text-[12px] font-bold text-n-500">
                  Short answer: no
                </div>
              </div>
            </div>
          </div>

          {/* ── FAQ carousel ──────────────────────────────────────────────── */}
          <div className="border-t border-amber-300 pt-7">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
              <div className="flex items-center gap-2.5 text-[15.5px] font-bold text-ink">
                <Icon name="support" size={20} className="text-accent" />
                Frequently asked
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setPage((p) => (p - 1 + pages) % pages)}
                  className={navBtn(page > 0)}
                  aria-label="Previous questions"
                >
                  <Icon name="chevronLeft" size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => (p + 1) % pages)}
                  className={navBtn(page < pages - 1)}
                  aria-label="More questions"
                >
                  <Icon name="chevronRight" size={16} />
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((f) => (
                <div
                  key={f.q}
                  className="flex flex-col gap-3.5 rounded-card border border-amber-300 bg-n-0 p-5
                             transition-[transform,box-shadow] duration-200
                             hover:-translate-y-1 hover:shadow-[0_18px_36px_rgb(120_80_10/0.14)]"
                >
                  <Icon name="lightbulb" size={20} className="text-amber-500" />
                  <div className="text-[15px] font-bold leading-[1.45] text-ink">
                    {f.q}
                  </div>
                  <p className="text-[13.5px] leading-[1.65] text-n-600 flex-1">
                    {f.a}
                  </p>
                </div>
              ))}
            </div>

            {/* Progress rail */}
            <div className="h-1 rounded-full bg-amber-300 mt-5 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-[margin-left] duration-[250ms]"
                style={{
                  width: `${100 / pages}%`,
                  marginLeft: `${page * (100 / pages)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
