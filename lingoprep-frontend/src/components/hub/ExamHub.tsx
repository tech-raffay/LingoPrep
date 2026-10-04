"use client";

/**
 * Exam hub — the page a candidate lands on once an exam is chosen.
 * From "frontend pages svg illustrations/IELTS Practice Tests v2.dc.html".
 *
 * ── Deviations from the design, all deliberate ──────────────────────────────
 * 1. Accent. The design hardcodes crimson; every accent surface here reads
 *    var(--accent), so the same page renders blue for TOEFL (§07).
 *
 * 2. Per-skill colours. The design colours Writing with #0057B8 — the TOEFL
 *    accent — which on an IELTS screen is exactly the two-accent mix §07
 *    forbids (and Reading's crimson would do the same on TOEFL). Reading now
 *    takes the exam accent, and Writing takes the deep green of the brand
 *    book's "Reading Room" scheme (§13), which belongs to neither exam.
 *
 * 3. Format chips. The design gives Writing "60 min" and Speaking "3 parts".
 *    The Writing page is an untimed single-prompt workspace and Speaking
 *    records one long turn, so the chips describe what the pages really do.
 *
 * 4. Hover. The design drives hover from React state; here it is pure CSS
 *    (`group-hover`), so it costs no re-renders and works without JS.
 */

import Link from "next/link";
import type { CSSProperties } from "react";
import { PICKER_HREF, useExam } from "@/components/theme/ExamThemeProvider";
import Icon, { type IconName } from "@/components/brand/Icon";
import Art from "@/components/brand/Art";
import Reveal from "@/components/brand/Reveal";
import { hubHeroArt, skillArt, type SkillKey } from "@/lib/illustrations";
import type { ExamType } from "@/lib/exam";
import { HUES } from "@/lib/skillHues";

/* ── Per-skill palette: src/lib/skillHues.ts ───────────────────────────── */

/* ── Copy, per exam ─────────────────────────────────────────────────────── */

interface Skill {
  key: SkillKey;
  title: string;
  icon: IconName;
  desc: Record<ExamType, string>;
  chips: Record<ExamType, [string, string]>;
}

const SKILLS: Skill[] = [
  {
    key: "listening", title: "Listening", icon: "listening",
    desc: {
      ielts: "Four sections, 40 questions, with transcripts after scoring.",
      toefl: "One conversation and two academic lectures, 17 questions.",
    },
    chips: { ielts: ["Single-play audio", "4 sections · 40 Qs"], toefl: ["Single-play audio", "3 recordings · 17 Qs"] },
  },
  {
    key: "reading", title: "Reading", icon: "reading",
    desc: {
      ielts: "Three passages of rising complexity, 40 questions in 60 minutes.",
      toefl: "Two academic passages, 20 questions in 35 minutes.",
    },
    chips: { ielts: ["60 min", "3 passages · 40 Qs"], toefl: ["35 min", "2 passages · 20 Qs"] },
  },
  {
    key: "writing", title: "Writing", icon: "writing",
    desc: {
      ielts: "Task 1 and Task 2 prompts, scored against the four band criteria.",
      toefl: "Academic writing prompts, scored on the 0–30 section scale.",
    },
    chips: { ielts: ["Your own pace", "Task 1 · Task 2"], toefl: ["Your own pace", "Scored 0–30"] },
  },
  {
    key: "speaking", title: "Speaking", icon: "speaking",
    desc: {
      ielts: "Record a Part 2 long turn and get fluency and pronunciation feedback.",
      toefl: "Record an independent response and get a transcribed, scored answer.",
    },
    chips: { ielts: ["Recorded answer", "Part 2 long turn"], toefl: ["Recorded answer", "Independent task"] },
  },
];

/** The floating score chip in the hero — illustrative, per exam. */
const SAMPLE: Record<ExamType, { value: string; pct: number; label: string }> = {
  ielts: { value: "7.0", pct: 78, label: "Band estimate" },
  toefl: { value: "24", pct: 80, label: "Score estimate" },
};

/** Primary pill gradient, derived from the active accent. */
const ACCENT_GRADIENT =
  "linear-gradient(180deg, color-mix(in srgb, var(--accent) 88%, white), color-mix(in srgb, var(--accent) 88%, black))";

export default function ExamHub() {
  const { exam, theme, persistExam, withExam } = useExam();
  const sample = SAMPLE[exam];

  return (
    <>
      {/* ═══ Hero ═══════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden border-b"
        style={{
          background: "color-mix(in srgb, var(--accent-tint) 45%, white)",
          borderColor: "color-mix(in srgb, var(--accent) 10%, var(--n-200))",
        }}
      >
        {/* Ambient: drifting orbs, accent dot field, film grain */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute rounded-full w-[460px] h-[460px] -top-40 -right-20 opacity-35 blur-[70px]"
            style={{ background: "color-mix(in srgb, var(--accent) 50%, white)", animation: "lp-orb-a 18s ease-in-out infinite" }}
          />
          <div
            className="absolute rounded-full w-[380px] h-[380px] -bottom-44 left-[30%] opacity-35 blur-[70px]"
            style={{ background: "var(--amber-400)", animation: "lp-orb-b 22s ease-in-out infinite" }}
          />
          <div
            className="absolute rounded-full w-[260px] h-[260px] top-10 -left-[120px] opacity-[.12] blur-[70px]"
            style={{ background: "var(--accent)", animation: "lp-orb-b 26s ease-in-out infinite" }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(color-mix(in srgb, var(--accent) 13%, transparent) 1.2px, transparent 1.2px)",
              backgroundSize: "22px 22px",
              maskImage: "radial-gradient(ellipse 70% 80% at 70% 40%, #000 20%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 70% 40%, #000 20%, transparent 75%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-5 sm:px-7 pt-12 pb-14 sm:pt-14 sm:pb-16 grid lg:grid-cols-2 gap-10 items-center">
          {/* ── Copy ──────────────────────────────────────────────────── */}
          <Reveal className="flex flex-col items-start gap-5">
            <a
              href={PICKER_HREF}
              onClick={() => persistExam(null)}
              className="group inline-flex items-center gap-2 text-[13.5px] font-bold text-accent whitespace-nowrap"
            >
              <span
                className="w-[26px] h-[26px] rounded-full bg-n-0 border flex items-center justify-center transition-transform duration-[120ms] group-hover:-translate-x-0.5"
                style={{ borderColor: "color-mix(in srgb, var(--accent) 25%, white)" }}
              >
                <Icon name="chevronLeft" size={16} />
              </span>
              Change exam
            </a>

            <h1 className="text-[40px] sm:text-[52px] lg:text-[62px] leading-[1.04] tracking-[-0.045em] text-ink">
              {theme.name}{" "}
              <span
                style={{
                  background:
                    "linear-gradient(transparent 62%, #FFD98A 62%, #FFD98A 90%, transparent 90%)",
                }}
              >
                practice
              </span>
              <br />
              <span className="text-accent">tests</span>
            </h1>

            <p className="text-[16px] sm:text-[17px] leading-[1.8] text-n-600 max-w-[34rem] [text-wrap:pretty]">
              {exam === "toefl"
                ? "Practice the iBT format across Reading, Listening, Speaking and Writing, with section scores on the 0–30 scale."
                : "Practice IELTS Academic across Listening, Reading, Writing and Speaking, with band-level feedback on every criterion."}
            </p>

            <div className="flex flex-wrap gap-3 mt-1">
              <a
                href="#skills"
                className="group inline-flex items-center gap-3 rounded-full py-2 pr-2 pl-6 text-[15px] font-bold text-accent-on hover:text-accent-on whitespace-nowrap
                           transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5"
                style={{
                  background: ACCENT_GRADIENT,
                  boxShadow:
                    "inset 0 1px 0 rgb(255 255 255 / .25), 0 10px 26px color-mix(in srgb, var(--accent) 32%, transparent)",
                }}
              >
                Choose a skill
                <span className="w-9 h-9 rounded-full bg-n-0 text-accent flex items-center justify-center">
                  <Icon name="chevronDown" size={16} />
                </span>
              </a>
              <Link
                href={withExam("/dashboard")}
                className="inline-flex items-center gap-2 h-[52px] px-6 rounded-full border border-n-300 bg-white/80 backdrop-blur-[6px] text-[15px] font-bold text-ink hover:text-ink whitespace-nowrap
                           transition-[border-color,transform] duration-200 hover:border-ink hover:-translate-y-0.5"
              >
                <Icon name="progress" size={16} />
                Your results
              </Link>
            </div>
          </Reveal>

          {/* ── Illustration stage ────────────────────────────────────── */}
          <Reveal delay={110} className="relative flex items-center justify-center min-h-[340px] sm:min-h-[400px]">
            <div
              className="absolute w-[min(92%,440px)] aspect-square border"
              aria-hidden="true"
              style={{
                borderRadius: "46% 54% 52% 48% / 52% 44% 56% 48%",
                background: "linear-gradient(150deg, #fff 0%, var(--accent-tint) 100%)",
                borderColor: "color-mix(in srgb, var(--accent) 12%, white)",
                boxShadow: "0 30px 60px color-mix(in srgb, var(--accent) 10%, transparent)",
              }}
            />
            <div
              className="absolute w-[min(104%,500px)] aspect-square rounded-full border-[1.5px] border-dashed"
              aria-hidden="true"
              style={{
                borderColor: "color-mix(in srgb, var(--accent) 22%, transparent)",
                animation: "lp-spin 60s linear infinite",
              }}
            />
            <div className="relative w-[min(100%,480px)] lp-float">
              <Art art={hubHeroArt(exam)} priority sizes="480px" className="w-full" />
              {/* The traced IELTS art renders "Tips?" faint and broken. Patch
                  the bubble with its own red and set the word as real text,
                  in the illustration's 1216×896 coordinates so it scales and
                  floats with the art. (The TOEFL art has no lettering.) */}
              {exam === "ielts" && (
                <svg
                  viewBox="0 0 1216 896"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  aria-hidden="true"
                >
                  <rect x="314" y="150" width="110" height="60" rx="14" fill="#FE4D5D" />
                  <text
                    x="369" y="194" textAnchor="middle"
                    fill="#fff" fontSize="40" fontWeight="700"
                    style={{ fontFamily: "var(--font-brand)", letterSpacing: "-0.01em" }}
                  >
                    Tips?
                  </text>
                </svg>
              )}
            </div>

            {/* Floating score chip — illustrative */}
            <div
              className="absolute left-0 bottom-[30px] flex items-center gap-3 rounded-[18px] border border-n-200 bg-white/90 backdrop-blur-[8px] py-3 pl-3 pr-[18px] shadow-[0_18px_40px_rgb(18_23_43/0.12)]"
              style={{ animation: "lp-float 6s ease-in-out infinite" }}
              aria-hidden="true"
            >
              <div
                className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(var(--accent) 0 ${sample.pct}%, var(--accent-tint) ${sample.pct}% 100%)`,
                }}
              >
                <div className="w-10 h-10 rounded-full bg-n-0 flex items-center justify-center text-[14px] font-bold tabular-nums text-ink">
                  {sample.value}
                </div>
              </div>
              <div>
                <div className="text-[13.5px] font-bold text-ink">{sample.label}</div>
                <div className="text-[11px] font-bold tracking-[.1em] text-amber-ink mt-0.5">
                  AFTER EVERY TEST
                </div>
              </div>
            </div>

            {/* Floating skill tiles */}
            <div
              className="absolute right-1 top-[30px] hidden sm:flex items-center gap-1.5 rounded-2xl border border-n-200 bg-white/90 backdrop-blur-[8px] p-2 shadow-[0_18px_40px_rgb(18_23_43/0.12)]"
              style={{ animation: "lp-float 7s ease-in-out 1.2s infinite" }}
              aria-hidden="true"
            >
              {SKILLS.map((s) => (
                <span
                  key={s.key}
                  className="w-9 h-9 rounded-[11px] flex items-center justify-center"
                  style={{ background: HUES[s.key].tint, color: HUES[s.key].accent }}
                >
                  <Icon name={s.icon} size={20} />
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ Practice by skill ══════════════════════════════════════════ */}
      <section id="skills" className="relative bg-n-50 overflow-hidden scroll-mt-16">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgb(18 23 43 / .045) 1px, transparent 1px), linear-gradient(90deg, rgb(18 23 43 / .045) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "linear-gradient(180deg, #000, transparent 70%)",
            WebkitMaskImage: "linear-gradient(180deg, #000, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-[1200px] px-5 sm:px-7 pt-16 sm:pt-[76px] pb-20 sm:pb-[110px]">
          <Reveal className="flex flex-wrap items-end justify-between gap-5 mb-9">
            <div>
              <span className="t-label text-accent text-[12.5px] tracking-[.16em]">
                Four skills · all unlocked
              </span>
              <h2 className="text-[30px] sm:text-[36px] mt-2.5">Practice by skill</h2>
            </div>
            <p className="text-[15px] leading-[1.7] text-n-600 max-w-[26rem]">
              Each test follows the real exam format, then scores you against
              the official {exam === "toefl" ? "section" : "band"} criteria.
            </p>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-2">
            {SKILLS.map((s, i) => (
              <Reveal key={s.key} delay={(i % 2) * 110} className="flex">
                <SkillCard skill={s} index={i} exam={exam} href={withExam(`/${s.key}`)} />
              </Reveal>
            ))}
          </div>

          {/* §14: scoring is AI-generated, said plainly wherever practice starts */}
          <Reveal className="relative mt-14 sm:mt-[72px] rounded-feature bg-ink overflow-hidden px-6 py-7 sm:px-10 sm:py-[34px] flex flex-wrap items-center gap-5 sm:gap-7">
            <div
              className="absolute inset-0"
              aria-hidden="true"
              style={{
                backgroundImage: "radial-gradient(rgb(255 255 255 / .07) 1.2px, transparent 1.2px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div
              className="absolute -right-[60px] -top-20 w-[260px] h-[260px] rounded-full"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in srgb, var(--accent) 45%, transparent), transparent 70%)",
              }}
            />
            <div
              className="relative w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 text-ink shadow-[0_10px_22px_rgb(245_158_11/0.3)]"
              style={{ background: "linear-gradient(145deg, #FFC35A, var(--amber-500))" }}
            >
              <Icon name="info" size={24} />
            </div>
            <p className="relative flex-[1_1_420px] text-[14.5px] leading-[1.75] text-n-400">
              Every score on LingoPrep is an AI-generated practice estimate on
              the <strong className="text-white">{theme.scoreRange}</strong>{" "}
              scale. It is not an official {theme.legalName} result and cannot
              be used for admissions or visa applications.
            </p>
            <Link
              href={withExam("/dashboard")}
              className="relative inline-flex items-center gap-2 rounded-full bg-n-0 px-5 py-3 text-[14px] font-bold text-ink hover:text-ink whitespace-nowrap
                         transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-amber-100"
            >
              How scoring works
              <Icon name="next" size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ── Skill card ─────────────────────────────────────────────────────────── */

function SkillCard({
  skill,
  index,
  exam,
  href,
}: {
  skill: Skill;
  index: number;
  exam: ExamType;
  href: string;
}) {
  const hue = HUES[skill.key];
  const [time, parts] = skill.chips[exam];

  return (
    <Link
      href={href}
      className="group flex-1 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(170px,40%)] rounded-[26px] bg-n-0 border border-[#E9ECF2] overflow-hidden text-ink hover:text-ink
                 shadow-[0_1px_2px_rgb(18_23_43/0.04),0_8px_24px_rgb(18_23_43/0.04)]
                 transition-[transform,box-shadow,border-color] duration-[450ms] ease-[cubic-bezier(.2,.7,.2,1)]
                 hover:-translate-y-1.5 hover:border-[var(--dot)] hover:shadow-[0_30px_60px_-12px_var(--glow),0_8px_20px_rgb(18_23_43/0.06)]"
      style={{ "--dot": hue.dot, "--glow": hue.glow } as CSSProperties}
    >
      {/* ── Copy ──────────────────────────────────────────────────────── */}
      <div className="order-2 sm:order-1 flex flex-col gap-3 p-6 sm:py-7 sm:pl-[30px] sm:pr-[26px]">
        <div className="flex items-center justify-between mb-1.5">
          <div
            className="relative w-14 h-14 rounded-[17px] flex items-center justify-center text-white
                       transition-transform duration-[450ms] ease-[cubic-bezier(.2,.7,.2,1)]
                       group-hover:-rotate-[8deg] group-hover:scale-[1.06]"
            style={{
              background: `linear-gradient(145deg, ${hue.accent}, ${hue.deep})`,
              boxShadow: `inset 0 1px 0 rgb(255 255 255 / .3), 0 10px 22px ${hue.glow}`,
            }}
          >
            <Icon name={skill.icon} size={24} />
            <span
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-n-0 border-[3px]"
              style={{ borderColor: hue.tint }}
            />
          </div>
          <span className="t-numeric text-[13px] text-n-400">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h3 className="text-[23px] leading-[1.2]">{skill.title}</h3>
        <p className="text-[14.5px] leading-[1.7] text-n-600 flex-1">{skill.desc[exam]}</p>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-n-100 px-[11px] py-1.5 text-[12.5px] font-bold text-n-700 whitespace-nowrap">
            <Icon name="clock" size={16} className="text-n-500" />
            {time}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-n-100 px-[11px] py-1.5 text-[12.5px] font-bold text-n-700 whitespace-nowrap">
            <Icon name="report" size={16} className="text-n-500" />
            {parts}
          </span>
        </div>

        {/* CTA pill — tinted at rest, fills with the accent on hover */}
        <span className="relative mt-2.5 self-start inline-flex items-center gap-3 rounded-full py-1.5 pr-1.5 pl-5 bg-accent-tint text-accent text-[14.5px] font-bold whitespace-nowrap overflow-hidden transition-colors duration-300 group-hover:text-accent-on">
          <span
            className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: ACCENT_GRADIENT }}
            aria-hidden="true"
          />
          <span className="relative">Start practice</span>
          <span
            className="relative w-8 h-8 rounded-full bg-accent text-accent-on flex items-center justify-center
                       transition-[transform,background-color,color] duration-[350ms] ease-[cubic-bezier(.2,.7,.2,1)]
                       group-hover:bg-n-0 group-hover:text-accent group-hover:translate-x-1 group-hover:-rotate-45"
          >
            <Icon name="next" size={16} />
          </span>
        </span>
      </div>

      {/* ── Illustration panel ────────────────────────────────────────── */}
      <div
        className="order-1 sm:order-2 relative flex items-center justify-center p-[18px] overflow-hidden min-h-[200px]"
        style={{ background: hue.tint }}
      >
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(${hue.dot} 1.3px, transparent 1.3px)`,
            backgroundSize: "18px 18px",
          }}
        />
        <div
          className="absolute w-[82%] max-w-[240px] aspect-square bg-white/85
                     transition-transform duration-[800ms] ease-[cubic-bezier(.2,.7,.2,1)]
                     group-hover:rotate-[18deg] group-hover:scale-110"
          aria-hidden="true"
          style={{ borderRadius: "44% 56% 50% 50% / 55% 45% 55% 45%" }}
        />
        <Art
          art={skillArt(exam, skill.key)}
          sizes="260px"
          className="relative w-full max-w-[200px] sm:max-w-[260px]
                     transition-transform duration-[600ms] ease-[cubic-bezier(.2,.7,.2,1)]
                     group-hover:scale-[1.07] group-hover:-translate-y-1"
        />
      </div>
    </Link>
  );
}
