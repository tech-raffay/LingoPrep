/**
 * Illustration registry — the single place that maps a slot on the page to an
 * SVG in /public/illustrations.
 *
 * The design files ("frontend pages svg illustrations/*.dc.html") refer to the
 * art by working names (self-assessment-2.svg, beginner-map.svg …). Those are
 * byte-identical to the files already in /public under descriptive names, so
 * the working names are mapped here rather than duplicating 2 MB of SVG.
 *
 * ── Exam isolation (brand book §07) ─────────────────────────────────────────
 * The art is drawn in a coral/crimson palette and some pieces are lettered
 * "IELTS". Neither may appear on a TOEFL screen. Every slot a TOEFL candidate
 * can see therefore has a TOEFL entry pointing at /illustrations/toefl/, which
 * holds unlettered pieces with their reds moved onto the TOEFL blue — generated
 * by `node scripts/recolor-illustrations.mjs`.
 *
 * The landing-page slots have no TOEFL entry on purpose: the landing page only
 * renders before an exam is chosen, under the default IELTS accent.
 */

import type { ExamType } from "@/lib/exam";

export interface Illustration {
  src: string;
  alt: string;
  /** Intrinsic size, so the browser reserves the right box before load. */
  width: number;
  height: number;
}

const WIDE = { width: 1216, height: 896 };
const SQUARE = { width: 1024, height: 1024 };

/* ── Landing page (exam not yet chosen) ─────────────────────────────────── */

export const LANDING = {
  hero: {
    src: "/illustrations/ielts-hero-2.svg",
    alt: "Student practising at a laptop with score charts",
    ...WIDE,
  },
  selfAssessment: {
    src: "/illustrations/ielts-hero.svg",
    alt: "Student taking the self-assessment at a desk",
    ...WIDE,
  },
  choosePath: {
    src: "/illustrations/dashboard-illustration.svg",
    alt: "Student choosing between IELTS and TOEFL at a signpost",
    ...WIDE,
  },
  freeForever: {
    src: "/illustrations/student-map.svg",
    alt: "Student with a map beside a signpost and a winding path",
    ...WIDE,
  },
  questions: {
    src: "/illustrations/students-group-2.svg",
    alt: "Three students sharing tips around a table",
    ...WIDE,
  },
} satisfies Record<string, Illustration>;

/** Preparation-library thumbnails. The design hotlinks stock photographs from
 *  third-party sites; those are unlicensed for this use and §11 rules out
 *  stock photography, so the cards use the unlettered illustrations instead. */
export const LIBRARY = {
  firstTime: { src: "/illustrations/reading-person.svg", alt: "Student reading with a magnifier", ...SQUARE },
  testFormat: { src: "/illustrations/listening-person.svg", alt: "Student wearing a headset", ...SQUARE },
  results: { src: "/illustrations/writing-person.svg", alt: "Student reviewing a checklist of criteria", ...SQUARE },
  practice: { src: "/illustrations/speaking-person.svg", alt: "Student speaking into a microphone", ...SQUARE },
} satisfies Record<string, Illustration>;

/* ── Exam-aware slots ───────────────────────────────────────────────────── */

export type SkillKey = "listening" | "reading" | "writing" | "speaking";

const SKILL_ART: Record<ExamType, Record<SkillKey, Illustration>> = {
  ielts: {
    listening: { src: "/illustrations/listening-person.svg", alt: "Student listening with headphones", ...SQUARE },
    reading: { src: "/illustrations/reading-person-2.svg", alt: "Student reading an IELTS passage with a magnifier", ...SQUARE },
    writing: { src: "/illustrations/writing-person-2.svg", alt: "Student writing an IELTS essay with a checklist", ...SQUARE },
    speaking: { src: "/illustrations/speaking-person-2.svg", alt: "Student speaking into a microphone", ...SQUARE },
  },
  toefl: {
    listening: { src: "/illustrations/toefl/listening-person.svg", alt: "Student listening with headphones", ...SQUARE },
    reading: { src: "/illustrations/toefl/reading-person.svg", alt: "Student reading a passage with a magnifier", ...SQUARE },
    writing: { src: "/illustrations/toefl/writing-person.svg", alt: "Student writing an essay against a checklist", ...SQUARE },
    speaking: { src: "/illustrations/toefl/speaking-person.svg", alt: "Student speaking into a microphone", ...SQUARE },
  },
};

const HUB_HERO: Record<ExamType, Illustration> = {
  ielts: { src: "/illustrations/students-group.svg", alt: "Three students sharing study tips", ...WIDE },
  toefl: { src: "/illustrations/toefl/students-group-2.svg", alt: "Three students sharing study tips", ...WIDE },
};

const LOST: Record<ExamType, Illustration> = {
  ielts: { src: "/illustrations/student-map.svg", alt: "Student holding a map, looking for the way", ...WIDE },
  toefl: { src: "/illustrations/toefl/student-map.svg", alt: "Student holding a map, looking for the way", ...WIDE },
};

export const skillArt = (exam: ExamType, skill: SkillKey) => SKILL_ART[exam][skill];
export const hubHeroArt = (exam: ExamType) => HUB_HERO[exam];
export const lostArt = (exam: ExamType) => LOST[exam];
