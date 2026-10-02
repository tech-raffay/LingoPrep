"use client";

/**
 * "Preparation library" — from
 * "frontend pages svg illustrations/LingoPrep Home.dc.html".
 *
 * The design gives each card a 16:10 image with a soft bottom fade and a slow
 * zoom on hover. Its images are stock photographs hotlinked from third-party
 * sites, which are unlicensed for this use and ruled out by §11, so each card
 * shows one of the platform's own illustrations on its category tint instead.
 *
 * Three of the four cards are articles that are not written yet; they link to
 * the nearest real destination for now.
 */

import Icon from "@/components/brand/Icon";
import Art from "@/components/brand/Art";
import Reveal from "@/components/brand/Reveal";
import { LIBRARY, type Illustration } from "@/lib/illustrations";

interface Article {
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  art: Illustration;
  /** Tint used for the thumbnail ground and the category chip. */
  tone: string;
  ink: string;
}

const ARTICLES: Article[] = [
  {
    category: "Preparation",
    title: "Sitting IELTS for the first time? Start here",
    excerpt:
      "A four-week plan that assumes nothing and fits around a full-time timetable.",
    readTime: "6 min read",
    art: LIBRARY.firstTime,
    tone: "var(--accent-tint)",
    ink: "var(--accent-on-tint)",
  },
  {
    category: "Test format",
    title: "What the computer-delivered test actually looks like",
    excerpt:
      "Screen by screen, from the headset check to the review flag on the last question.",
    readTime: "5 min read",
    art: LIBRARY.testFormat,
    tone: "var(--n-100)",
    ink: "var(--n-700)",
  },
  {
    category: "Results",
    title: "Reading your band report like an examiner",
    excerpt:
      "What each criterion rewards, and the fastest half-band you can add per skill.",
    readTime: "8 min read",
    art: LIBRARY.results,
    tone: "var(--amber-100)",
    ink: "var(--amber-ink)",
  },
  {
    category: "Practice",
    title: "Free full-length tests for all four skills",
    excerpt:
      "Every module on LingoPrep, with model answers and full transcripts after scoring.",
    readTime: "3 min read",
    art: LIBRARY.practice,
    tone: "var(--success-tint)",
    ink: "var(--success)",
  },
];

export default function Library({ href }: { href: string }) {
  return (
    <section className="bg-n-0">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-7 pt-16">
        <Reveal className="flex items-center justify-between gap-5 flex-wrap mb-7">
          <h2 className="flex items-center gap-3 text-[26px] sm:text-[32px]">
            <span className="w-[5px] h-[30px] rounded-full bg-amber-500" />
            Preparation library
          </h2>
          <a
            href={href}
            className="inline-flex h-11 items-center rounded-full border border-n-400 px-5 text-[14px] font-bold text-ink transition-colors duration-[120ms] hover:border-ink hover:text-ink"
          >
            View all
          </a>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2">
          {ARTICLES.map((a, i) => (
            <Reveal key={a.title} delay={(i % 2) * 110} className="flex">
              <a
                href={href}
                className="group flex-1 flex flex-col rounded-[18px] border border-n-300 bg-n-0 overflow-hidden
                           transition-[transform,box-shadow] duration-200
                           hover:-translate-y-[5px] hover:shadow-[0_20px_44px_rgb(18_23_43/0.12)]"
              >
                {/* 16:10 thumbnail with the design's bottom fade */}
                <div
                  className="relative aspect-[16/10] overflow-hidden border-b border-n-200 flex items-center justify-center"
                  style={{ background: a.tone }}
                >
                  <div
                    className="absolute inset-0"
                    aria-hidden="true"
                    style={{
                      backgroundImage:
                        "radial-gradient(rgb(18 23 43 / .06) 1.2px, transparent 1.2px)",
                      backgroundSize: "18px 18px",
                    }}
                  />
                  <Art
                    art={a.art}
                    sizes="(min-width: 640px) 290px, 90vw"
                    className="relative h-[92%] w-auto transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    aria-hidden="true"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 60%, rgb(18 23 43 / .10))",
                    }}
                  />
                </div>

                <div className="p-5 flex flex-col gap-2.5 flex-1">
                  <span
                    className="self-start rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.08em]"
                    style={{ background: a.tone, color: a.ink }}
                  >
                    {a.category}
                  </span>
                  <h3 className="text-[16.5px] leading-[1.35]">{a.title}</h3>
                  <p className="text-[13.5px] leading-[1.65] text-n-600 flex-1">
                    {a.excerpt}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[12.5px] font-bold text-n-500">
                    <Icon name="clock" size={16} />
                    {a.readTime}
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
