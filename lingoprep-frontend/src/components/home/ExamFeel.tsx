"use client";

/**
 * "What the exam actually feels like" — from "LingoPrep Home.dc.html".
 *
 * The 16:9 panel holds the walkthrough clip, self-hosted from /public/media.
 *
 * ── Why the file is local, not a Streamable embed ───────────────────────────
 * Two reasons. An embedded third-party player brings its own controls,
 * scrubber, speed and settings chrome, and this panel wants a clip that simply
 * plays. And Streamable's direct .mp4 links are CloudFront URLs signed with a
 * short-lived `Expires` parameter, so they cannot be hardcoded at all.
 * Serving the file ourselves solves both problems.
 *
 * ── Playback ────────────────────────────────────────────────────────────────
 * Muted, looping, no controls — moving illustration rather than media the
 * visitor has to operate. It deliberately does NOT autoplay on load:
 * `preload="none"` plus an IntersectionObserver means the 10 MB file is not
 * fetched until this section is scrolled to, keeping it off the landing page's
 * initial load.
 *
 * §11 requires respecting prefers-reduced-motion, and for video the honest
 * reading is not to move at all — so under that setting the clip never starts.
 */

import { useEffect, useRef } from "react";
import Icon from "@/components/brand/Icon";

const POINTS = [
  "The same on-screen layout you will see in the test centre.",
  "Listening audio that plays once, exactly as the real exam does.",
  "A full band report at the end, criterion by criterion.",
];

export default function ExamFeel({
  videoSrc,
  ctaHref,
}: {
  videoSrc?: string;
  ctaHref: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // §11: no motion for anyone who has asked not to have any.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    // Fetch and play only once the panel is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [videoSrc]);

  return (
    <section className="bg-n-0">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-7 pt-20 sm:pt-24">
        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-10 items-center">
          {/* ── Clip ──────────────────────────────────────────────────────── */}
          <div className="relative rounded-[22px] overflow-hidden bg-[#14100b] aspect-video shadow-[0_24px_54px_rgb(18_23_43/0.16)]">
            <div
              className="absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(circle at 32% 34%, rgb(245 158 11 / .55), transparent 52%)," +
                  "radial-gradient(circle at 72% 70%, color-mix(in srgb, var(--accent) 45%, transparent), transparent 52%)," +
                  "linear-gradient(155deg, #2a2015, #14100b)",
                animation: "lp-drift 26s ease-in-out infinite",
              }}
            />
            {videoSrc ? (
              <video
                ref={ref}
                src={videoSrc}
                muted
                loop
                playsInline
                preload="none"
                // Decorative: the three bullets beside it say the same thing
                // in text, so there is nothing here to caption.
                aria-hidden="true"
                tabIndex={-1}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 text-center p-8">
                <Icon name="playCircle" size={32} className="text-white/80" />
                <div className="text-[14px] font-bold text-white/90">
                  Video placeholder
                </div>
                <div className="text-[13px] leading-[1.6] text-white/60 max-w-[20rem]">
                  Drop in the clip of a student working through a test at their
                  screen — it fills this whole panel.
                </div>
              </div>
            )}
          </div>

          {/* ── Copy ──────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <span className="t-label text-amber-ink text-[12.5px]">
              Test day, without the surprises
            </span>
            <h2 className="text-[28px] sm:text-[34px] max-w-[20rem]">
              What the exam actually feels like
            </h2>
            <p className="text-[15.5px] leading-[1.72] text-n-600">
              Most candidates lose marks to the format, not the English. Watch
              someone sit a full test the way you will — same screens, same
              timer, same single-play audio — so nothing on the day is new.
            </p>
            <ul className="flex flex-col gap-3.5 m-0 p-0 list-none">
              {POINTS.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-3 text-[14.5px] leading-[1.65] text-n-700"
                >
                  <Icon
                    name="check"
                    size={20}
                    className="text-accent shrink-0 mt-0.5"
                  />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <div className="pt-1">
              <a
                href={ctaHref}
                className="inline-flex h-[50px] items-center gap-2 rounded-full bg-accent px-7 text-[15px] font-bold text-accent-on shadow-accent transition-colors duration-[120ms] hover:bg-accent-strong"
              >
                Sit a practice test
                <Icon name="next" size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
