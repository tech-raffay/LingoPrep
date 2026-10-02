"use client";

/**
 * "Preparation library" — from
 * "frontend pages svg illustrations/LingoPrep Home.dc.html".
 *
 * Each card has a 16:10 photograph with a soft bottom fade and a slow zoom on
 * hover, as designed. The photographs are hotlinked from third-party hosts
 * (chosen by the project owner), so each card keeps one of the platform's own
 * illustrations as a fallback: if a host blocks, moves or removes an image,
 * the card shows the illustration instead of a broken-image icon.
 *
 * NOTE: these are stock images owned by others (iStock and the hosting
 * sites). Replace them with licensed or self-shot photos before any public,
 * non-academic launch.
 *
 * Three of the four cards are articles that are not written yet; they link to
 * the nearest real destination for now.
 */

import { useState } from "react";
import Icon from "@/components/brand/Icon";
import Art from "@/components/brand/Art";
import Reveal from "@/components/brand/Reveal";
import { LIBRARY, type Illustration } from "@/lib/illustrations";

interface Article {
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  photo: string;
  alt: string;
  /** Shown if the photo fails to load. */
  fallback: Illustration;
  /** Tint used for the category chip and the fallback ground. */
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
    photo:
      "https://media.istockphoto.com/id/1250195664/photo/smiling-black-girl-with-headset-studying-online-using-laptop.jpg?s=612x612&w=0&k=20&c=Ho0DbSl2P5ELCkVIPyrTniztCwvNrQdJpU3Vzn_0YNk=",
    alt: "Student with a headset studying on a laptop",
    fallback: LIBRARY.firstTime,
    tone: "var(--accent-tint)",
    ink: "var(--accent-on-tint)",
  },
  {
    category: "Test format",
    title: "What the computer-delivered test actually looks like",
    excerpt:
      "Screen by screen, from the headset check to the review flag on the last question.",
    readTime: "5 min read",
    photo:
      "https://student-cms.prd.timeshighereducation.com/sites/default/files/styles/default/public/2022-01/iStock-622015126.jpg?itok=T446kMLS",
    alt: "Students taking a test at computers",
    fallback: LIBRARY.testFormat,
    tone: "var(--n-100)",
    ink: "var(--n-700)",
  },
  {
    category: "Results",
    title: "Reading your band report like an examiner",
    excerpt:
      "What each criterion rewards, and the fastest half-band you can add per skill.",
    readTime: "8 min read",
    photo:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQypm_0qOazB9fE_aSF5pT_cTavQdZHCATSeg0mpX7MFhF5J_2zd1k_AD9D&s=10",
    alt: "Student reviewing results",
    fallback: LIBRARY.results,
    tone: "var(--amber-100)",
    ink: "var(--amber-ink)",
  },
  {
    category: "Practice",
    title: "Free full-length tests for all four skills",
    excerpt:
      "Every module on LingoPrep, with model answers and full transcripts after scoring.",
    readTime: "3 min read",
    photo:
      "https://www.irishexaminer.com/cms_media/module_img/10117/5058560_8_org_iStock-1399376478.jpg",
    alt: "Person studying online",
    fallback: LIBRARY.practice,
    tone: "var(--success-tint)",
    ink: "var(--success)",
  },
];

export default function Library({ href }: { href: string }) {
  return (
    <section className="bg-n-0">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-7 pt-16">
        <Reveal className="flex items-center justify-between gap-4 flex-wrap mb-7">
          <h2 className="flex items-center gap-3 text-[26px] sm:text-[32px]">
            <span className="w-[5px] h-[30px] rounded-full bg-amber-500 shrink-0" />
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
                className="group flex-1 flex flex-col rounded-[18px] border border-n-300 bg-n-0 overflow-hidden text-ink hover:text-ink
                           transition-[transform,box-shadow] duration-200
                           hover:-translate-y-[5px] hover:shadow-[0_20px_44px_rgb(18_23_43/0.12)]"
              >
                <Thumb article={a} />

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

/** 16:10 photo with the design's bottom fade; illustration if the photo fails. */
function Thumb({ article: a }: { article: Article }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="relative aspect-[16/10] overflow-hidden border-b border-n-200 bg-n-100 flex items-center justify-center"
      style={failed ? { background: a.tone } : undefined}
    >
      {failed ? (
        <Art
          art={a.fallback}
          sizes="(min-width: 640px) 290px, 90vw"
          className="h-[88%] w-auto transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]"
        />
      ) : (
        // Remote stock photos: a plain <img> rather than next/image, so no
        // remotePatterns config is needed and a failure can fall back cleanly.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={a.photo}
          alt={a.alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover object-[center_25%] transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]"
        />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "linear-gradient(180deg, transparent 55%, rgb(18 23 43 / .28))",
        }}
      />
    </div>
  );
}
