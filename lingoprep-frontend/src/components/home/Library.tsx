"use client";

/**
 * "Preparation library" — from "LingoPrep Home.dc.html".
 *
 * The design puts a literal "Photo slot" chip in each thumbnail. That reads as
 * an unfinished page in production, so the thumbnails keep the design's
 * striped graphic (built from the pattern vocabulary, §11 "build it from the
 * icon vocabulary") with the category glyph in place of the chip. Drop real
 * 4:3 images in here when you have them — see `thumbTone` below.
 *
 * Three of the four cards are articles that are not written yet; they link to
 * the nearest real destination for now.
 */

import Icon, { type IconName } from "@/components/brand/Icon";

interface Article {
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  icon: IconName;
  /** Tint used for the striped thumbnail and the category chip. */
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
    icon: "schedule",
    tone: "var(--accent-tint)",
    ink: "var(--accent-on-tint)",
  },
  {
    category: "Test format",
    title: "What the computer-delivered test actually looks like",
    excerpt:
      "Screen by screen, from the headset check to the review flag on the last question.",
    readTime: "5 min read",
    icon: "monitor",
    tone: "var(--info-tint)",
    ink: "var(--info)",
  },
  {
    category: "Results",
    title: "Reading your band report like an examiner",
    excerpt:
      "What each criterion rewards, and the fastest half-band you can add per skill.",
    readTime: "8 min read",
    icon: "report",
    tone: "var(--amber-100)",
    ink: "var(--amber-ink)",
  },
  {
    category: "Practice",
    title: "Free full-length tests for all four skills",
    excerpt:
      "Every module on LingoPrep, with model answers and full transcripts after scoring.",
    readTime: "3 min read",
    icon: "progress",
    tone: "var(--success-tint)",
    ink: "var(--success)",
  },
];

export default function Library({ href }: { href: string }) {
  return (
    <section className="bg-n-0">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-7 pt-20 sm:pt-24">
        <div className="flex items-center justify-between gap-5 flex-wrap mb-7">
          <h2 className="flex items-center gap-3 text-[26px] sm:text-[32px]">
            <span className="w-[5px] h-[30px] rounded-full bg-amber-500" />
            Preparation library
          </h2>
          <a
            href={href}
            className="inline-flex h-11 items-center rounded-full border border-n-400 px-5 text-[14px] font-bold text-ink transition-colors duration-[120ms] hover:border-ink"
          >
            View all
          </a>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {ARTICLES.map((a) => (
            <a
              key={a.title}
              href={href}
              className="group flex flex-col rounded-[18px] border border-n-300 bg-n-0 overflow-hidden
                         transition-[transform,box-shadow] duration-200
                         hover:-translate-y-1 hover:shadow-[0_20px_44px_rgb(18_23_43/0.12)]"
            >
              {/* Image slot — replace with a real 4:3 asset when available */}
              <div
                className="h-[150px] flex items-center justify-center border-b border-n-200"
                style={{
                  background: `repeating-linear-gradient(135deg, ${a.tone}, ${a.tone} 10px, #ffffff 10px, #ffffff 20px)`,
                }}
              >
                <span
                  className="w-14 h-14 rounded-2xl bg-n-0/90 flex items-center justify-center shadow-e1"
                  style={{ color: a.ink }}
                >
                  <Icon name={a.icon} size={24} />
                </span>
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
          ))}
        </div>
      </div>
    </section>
  );
}
