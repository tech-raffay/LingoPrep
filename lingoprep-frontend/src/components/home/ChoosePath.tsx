"use client";

/**
 * "Choose your path" — from "LingoPrep Home.dc.html".
 *
 * This is the one screen where crimson and blue legitimately appear together:
 * they are identity swatches labelling a choice, not the interface accent
 * (brand book §07). The surrounding chrome stays neutral, and the moment a
 * path is taken exactly one accent governs everything.
 *
 * The CTAs are real anchors rather than buttons. The exam lives in the URL, so
 * choosing one is a navigation — and a real document load means the pre-paint
 * script sets the accent before the first frame, which is what makes a
 * wrong-colour flash impossible.
 */

import { EXAM_THEMES, type ExamType } from "@/lib/exam";
import { useExam } from "@/components/theme/ExamThemeProvider";
import Icon, { MODULE_ICONS } from "@/components/brand/Icon";

const SKILLS = ["Listening", "Reading", "Writing", "Speaking"] as const;

const BLURB: Record<ExamType, string> = {
  ielts:
    "Academic and General Training practice, scored as IELTS Academic bands across all four skills.",
  toefl:
    "iBT-format practice with integrated tasks and academic source material, scored on the 0–30 section scale.",
};

const TITLE: Record<ExamType, string> = {
  ielts: "IELTS®",
  toefl: "TOEFL iBT®",
};

export default function ChoosePath() {
  const { persistExam, examHref } = useExam();

  return (
    <section
      id="choose-path"
      className="bg-n-100 mt-20 sm:mt-24 border-y border-n-200 scroll-mt-20"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-7 py-20 sm:py-24">
        <span className="t-label text-n-500 text-[12.5px]">Step one</span>
        <h2 className="text-[28px] sm:text-[34px] mt-2 mb-3">
          Choose your path
        </h2>
        <p className="text-[15.5px] leading-[1.72] text-n-600 max-w-[34rem] mb-9">
          Pick your target examination. Timings, question types, scoring
          scale and the colour of the interface all follow the exam you choose.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {(["ielts", "toefl"] as ExamType[]).map((id) => {
            const t = EXAM_THEMES[id];
            return (
              <div
                key={id}
                className="group flex flex-col rounded-[22px] border border-n-300 bg-n-0 p-7 sm:p-[30px]
                           transition-[transform,box-shadow] duration-200
                           hover:-translate-y-1 hover:shadow-[0_20px_44px_rgb(18_23_43/0.11)]"
              >
                <div className="flex items-center gap-3.5 mb-4.5">
                  {/* Identity swatch — the one correct use of a fixed exam
                      colour, because it labels the choice itself. */}
                  <span
                    className="w-11 h-11 rounded-[13px] flex items-center justify-center text-[18px] font-bold text-white shrink-0"
                    style={{ backgroundColor: t.accent }}
                  >
                    {t.name.charAt(0)}
                  </span>
                  <div>
                    <h3 className="text-[21px]">{TITLE[id]}</h3>
                    <div className="text-[13.5px] font-bold text-n-500 mt-0.5">
                      {t.scoreRange}
                    </div>
                  </div>
                </div>

                <p className="text-[14.5px] leading-[1.7] text-n-600 mb-5.5">
                  {BLURB[id]}
                </p>

                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  {SKILLS.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-2 rounded-[10px] bg-n-100 px-3.5 py-2.5 text-[13.5px] font-bold text-n-700"
                    >
                      <Icon
                        name={MODULE_ICONS[s.toLowerCase()]}
                        size={16}
                        className="text-n-500"
                      />
                      {s}
                    </span>
                  ))}
                </div>

                <a
                  href={examHref(id)}
                  onClick={() => persistExam(id)}
                  className="mt-auto w-full h-[52px] inline-flex items-center justify-center gap-2
                             rounded-full text-[15px] font-bold text-white
                             transition-[filter] duration-[120ms] hover:brightness-90"
                  style={{ backgroundColor: t.accent }}
                >
                  Start {t.name} practice
                  <Icon name="next" size={16} />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
