"use client";

/**
 * Footer — brand book §14 "Legal & assets".
 *
 * ── Brand-safety fixes made here ─────────────────────────────────────────────
 * The previous footer breached the §14 "Never do" list. It offered "IELTS by
 * IDP app" (naming a trademark owner as a product), "Find a test centre",
 * "IELTS Events & Seminars", "IELTS Masterclass" and "Who accepts IELTS?" —
 * all of which present LingoPrep as an official test provider, and one of
 * which links an examination board's brand. Those are gone. What remains
 * describes only what this platform actually does.
 *
 * The disclaimer is now the exact required wording from §14, including the
 * final sentence on AI-generated estimates that was previously missing.
 *
 * Link columns are exam-aware: an IELTS candidate is not offered "TOEFL
 * integrated writing" and vice versa, so the footer never mixes the two
 * exams' language on one screen (§07).
 */

import Link from "next/link";
import { EXAM_THEMES, type ExamType } from "@/lib/exam";
import { useExam } from "@/components/theme/ExamThemeProvider";
import Logo from "@/components/brand/Logo";
import Icon, { type IconName } from "@/components/brand/Icon";

const SOCIALS: Array<{ label: string; path: string }> = [
  { label: "Facebook", path: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" },
  { label: "Instagram", path: "M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.55.22.94.47 1.35.88.41.41.66.8.88 1.35.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.86s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.55-.47.94-.88 1.35-.41.41-.8.66-1.35.88-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.59-.01-4.86-.07c-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 0 1-1.36-.88 3.7 3.7 0 0 1-.88-1.35c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.59.07-4.86c.05-1.17.25-1.8.41-2.22.22-.55.47-.95.88-1.36.41-.41.8-.66 1.36-.88.42-.16 1.05-.36 2.22-.41C8.41 2.21 8.8 2.2 12 2.2zm0 5.3a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 7.43a2.93 2.93 0 1 1 0-5.86 2.93 2.93 0 0 1 0 5.86zm5.74-7.63a1.05 1.05 0 1 1-2.1 0 1.05 1.05 0 0 1 2.1 0z" },
  { label: "X", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
];

export default function Footer() {
  const { exam, theme, withExam, examHref, persistExam } = useExam();

  // The footer previously only ever offered the active exam, so a visitor on
  // the default theme saw four IELTS links and no route to TOEFL at all. It
  // now always carries both paths.
  const otherExam: ExamType = exam === "ielts" ? "toefl" : "ielts";
  const other = EXAM_THEMES[otherExam];

  /* Practice links, in the brand book's module order (§09). */
  const practice: Array<{ label: string; href: string; icon: IconName }> = [
    { label: `${theme.name} Listening`, href: withExam("/listening"), icon: "listening" },
    { label: `${theme.name} Reading`, href: withExam("/reading"), icon: "reading" },
    { label: `${theme.name} Writing`, href: withExam("/writing"), icon: "writing" },
    { label: `${theme.name} Speaking`, href: withExam("/speaking"), icon: "speaking" },
  ];

  /* Honest platform links only — nothing implying an official service (§14). */
  const platform = [
    { label: "Your practice results", href: withExam("/dashboard") },
    { label: "Choose your exam", href: "/" },
    { label: "How AI scoring works", href: withExam("/dashboard") },
    { label: `${theme.scoreRange} explained`, href: withExam("/dashboard") },
  ];

  return (
    <footer className="bg-ink text-white w-full mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/12 pb-6 mb-8">
          {/* reversed: "Lingo" goes white on the ink ground (§05) */}
          <Logo size={30} reversed />
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/60">
            <Icon name="globe" size={16} />
            Pakistan
          </span>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          <div>
            <h4 className="t-label text-white/50 mb-4">Practice {theme.name}</h4>
            <ul className="space-y-2.5">
              {practice.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center gap-2 text-[13px] font-medium text-white/70 hover:text-white transition-colors duration-[120ms]"
                  >
                    <Icon name={l.icon} size={16} className="text-white/40" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Cross-link to the other examination. Deliberately not tinted
                with that exam's colour: §07 keeps one accent per screen, and
                the label alone is unambiguous here. */}
            <div className="mt-4 pt-4 border-t border-white/12">
              <a
                href={examHref(otherExam)}
                onClick={() => persistExam(otherExam)}
                className="group inline-flex items-center gap-2 text-[13px] font-bold text-white/70 hover:text-white transition-colors duration-[120ms]"
              >
                <Icon name="target" size={16} className="text-white/40" />
                Practice {other.name} instead
                <Icon
                  name="next"
                  size={16}
                  className="text-white/40 transition-transform duration-[120ms] group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </div>

          <div>
            <h4 className="t-label text-white/50 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {platform.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[13px] font-medium text-white/70 hover:text-white transition-colors duration-[120ms]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="t-label text-white/50 mb-4">What this is</h4>
            {/* §01 "Free without asterisks" · §02 calm, plain statements */}
            <p className="text-[13px] leading-6 text-white/70 mb-4">
              An independent, free practice platform. All four skills, instant
              AI-generated estimates, and no locked modules. Built as a final
              year project.
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-ink flex items-center justify-center text-white/70 transition-colors duration-[120ms]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Required disclaimer — exact §14 wording, every page ─────────── */}
        <div className="border-t border-white/12 pt-6">
          <p className="text-[11px] leading-[1.8] text-white/45 mb-5 max-w-4xl">
            LingoPrep is an independent learning platform. IELTS&reg; is a
            registered trademark of the University of Cambridge ESOL
            Examinations, the British Council and IDP Education Australia.
            TOEFL&reg; and TOEFL iBT&reg; are registered trademarks of
            Educational Testing Service (ETS). This platform is not endorsed
            by, affiliated with, or approved by any of these trademark owners.
            Practice scores are AI-generated estimates and are not official
            results.
          </p>
          <div className="flex flex-wrap justify-between items-center gap-3 text-[11px] text-white/45">
            <span>&copy; {new Date().getFullYear()} LingoPrep. All rights reserved.</span>
            <div className="flex gap-5">
              <span className="hover:text-white cursor-pointer transition-colors duration-[120ms]">Legal notice</span>
              <span className="hover:text-white cursor-pointer transition-colors duration-[120ms]">Privacy policy</span>
              <span className="hover:text-white cursor-pointer transition-colors duration-[120ms]">Terms of use</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
