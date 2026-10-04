"use client";

/**
 * Test intro — the screen before a practice test starts.
 * From "frontend pages svg illustrations/IELTS Test Intro.dc.html" (variant A).
 *
 * One component for all four skills, so the screens cannot drift apart. The
 * skill page supplies the copy, because only it knows its real timings and
 * rules; this component supplies the frame, the illustration and the theme.
 *
 * The design's skill tabs above the card are a preview control for switching
 * the mock between skills, not product UI, so they are not rendered.
 *
 * "Back to Dashboard" in the design returns to the exam hub, which is not the
 * results dashboard — the button says where it actually goes.
 */

import Link from "next/link";
import { useExam } from "@/components/theme/ExamThemeProvider";
import Icon from "@/components/brand/Icon";
import Art from "@/components/brand/Art";
import { skillArt, type SkillKey } from "@/lib/illustrations";
import { jumpToTop } from "@/lib/scroll";

export interface IntroPoint {
  label: string;
  text: React.ReactNode;
}

export default function TestIntro({
  skill,
  title,
  meta,
  subhead = "Exam structure & timing",
  points,
  instructions,
  startLabel = "Start exam",
  onStart,
}: {
  skill: SkillKey;
  title: string;
  meta: string;
  subhead?: string;
  points: IntroPoint[];
  instructions: React.ReactNode;
  startLabel?: string;
  onStart: () => void;
}) {
  const { exam, withExam } = useExam();
  // The test opens at its top, however far down the intro was scrolled.
  const start = () => {
    onStart();
    jumpToTop();
  };
  const art = skillArt(exam, skill);

  return (
    <div className="px-4 sm:px-7 pt-10 sm:pt-[50px] pb-12 sm:pb-[52px]">
      <div className="mx-auto max-w-[820px] rounded-[22px] border border-n-300 bg-n-0 shadow-[0_10px_30px_rgb(18_23_43/0.06)] overflow-hidden">
        {/* ── Header band with the skill illustration ─────────────────── */}
        <div
          className="bg-accent-tint border-b flex items-stretch justify-between gap-4 pl-6 pr-4 sm:pl-[42px] sm:pr-7"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 10%, var(--n-200))" }}
        >
          <div className="py-8 sm:py-11 flex flex-col items-start gap-3.5 min-w-0">
            {/* Phones: a small illustration above the badge instead of beside it */}
            <Art art={art} priority sizes="120px" className="sm:hidden w-[120px] -mt-2 -mb-1" />
            <span className="rounded-full bg-accent px-[13px] py-[5px] text-[12px] font-bold tracking-[.06em] text-accent-on">
              {exam === "toefl" ? "TOEFL iBT" : "IELTS ACADEMIC"}
            </span>
            <h1 className="text-[28px] leading-[1.18] sm:text-[34px] tracking-[-0.025em]">
              {title}
            </h1>
            <p className="text-[15px] text-n-600">{meta}</p>
          </div>
          <div className="hidden sm:flex w-[220px] shrink-0 items-end justify-center pt-4">
            <Art art={art} priority sizes="220px" className="w-full -mb-1.5" />
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="px-6 py-8 sm:px-[42px] sm:pt-10 sm:pb-[42px]">
          <h2 className="text-[17px] leading-[1.3] tracking-[-0.01em] mb-5">{subhead}</h2>
          <ul className="flex flex-col gap-3.5">
            {points.map((p) => (
              <li
                key={p.label}
                className="flex items-start gap-3 text-[15px] leading-[1.75] text-n-700"
              >
                <Icon name="correct" size={20} className="text-success shrink-0 mt-[3px]" />
                <span>
                  <strong className="text-ink">{p.label}</strong> {p.text}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-[26px] rounded-[14px] border border-n-300 bg-n-50 px-[22px] py-5 text-[14px] leading-[1.8] text-n-600">
            <strong className="text-n-700">Instructions:</strong> {instructions}
          </div>

          {/* Phones: full-width, primary on top. Wider: right-aligned row. */}
          <div className="mt-[26px] pt-5 border-t border-n-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-3.5">
            <Link
              href={withExam("/")}
              className="inline-flex items-center justify-center h-12 px-[26px] rounded-full border border-n-400 bg-n-0 text-[14.5px] font-bold text-ink hover:text-ink hover:border-ink transition-colors duration-[120ms]"
            >
              Back to practice tests
            </Link>
            <button
              type="button"
              onClick={start}
              className="inline-flex items-center justify-center gap-2 h-12 px-[30px] rounded-full bg-accent text-[14.5px] font-bold text-accent-on shadow-accent hover:bg-accent-strong transition-colors duration-[120ms] cursor-pointer"
            >
              {startLabel}
              <Icon name="next" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
