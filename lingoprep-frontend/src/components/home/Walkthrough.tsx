"use client";

/**
 * Dark walkthrough band — from "LingoPrep Home.dc.html".
 *
 * The design ships a `videoSrc` tweak and plays the clip behind this band. No
 * clip exists yet, so:
 *   - with `videoSrc` given, the video plays behind the copy at 42% opacity
 *     and the play/pause control drives it, exactly as designed;
 *   - without one, the control is replaced by a real CTA (sit a practice test)
 *     rather than a button that does nothing, and the equaliser animates as
 *     ambient decoration only.
 *
 * The three stats are the design's. "4 skills" and "0 locked modules" are
 * simply true; the "90s" figure is a claim about scoring latency — check it
 * against the real AI turnaround before this goes in front of examiners.
 */

import { useRef, useState } from "react";
import Icon from "@/components/brand/Icon";

const BAR_HEIGHTS = [8, 18, 12, 26, 16, 30, 20, 34, 14, 24, 10, 28, 18, 32, 12, 22, 9, 16];

const STATS = [
  { value: "4", label: "Skills scored end to end, in one sitting" },
  { value: "90s", label: "From finishing a task to a full band report" },
  { value: "0", label: "Locked modules, paywalls or trial timers" },
];

export default function Walkthrough({
  videoSrc,
  practiceHref,
  scoringHref,
}: {
  videoSrc?: string;
  practiceHref: string;
  scoringHref: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(true);

  function toggle() {
    const v = videoRef.current;
    if (v) {
      if (playing) v.pause();
      else void v.play().catch(() => {});
    }
    setPlaying((p) => !p);
  }

  return (
    <section className="relative overflow-hidden bg-[#14100b]">
      {/* Ambient wash. Decorative only, and stilled by prefers-reduced-motion. */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 20% 26%, rgb(245 158 11 / .5), transparent 46%)," +
            "radial-gradient(circle at 80% 72%, color-mix(in srgb, var(--accent) 50%, transparent), transparent 48%)," +
            "linear-gradient(160deg, #221a12, #14100b)",
          animation: "lp-drift 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(rgb(255 255 255 / .07) 1.1px, transparent 1.1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-[0.42]"
        />
      )}

      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-7 py-20 sm:py-[88px]">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] gap-10 lg:gap-13 items-center">
          <div className="flex flex-col gap-5">
            <h2 className="text-[30px] sm:text-[38px] text-white max-w-[22rem]">
              A full practice test, start to score, in 90 seconds
            </h2>
            <p className="text-[16px] leading-[1.75] text-n-400 max-w-[29rem]">
              See the reading split-screen, the single-play listening player,
              the essay workspace and the band report the AI returns — the real
              interface, nothing staged.
            </p>

            <div className="flex flex-wrap gap-3 pt-1.5">
              {videoSrc ? (
                <button
                  onClick={toggle}
                  className="inline-flex h-[50px] items-center gap-2.5 rounded-full bg-white px-6 text-[15px] font-bold text-ink transition-transform duration-[120ms] hover:-translate-y-0.5 cursor-pointer"
                >
                  <span className="w-[26px] h-[26px] rounded-full bg-accent text-accent-on flex items-center justify-center">
                    <Icon name={playing ? "pause" : "play"} size={16} />
                  </span>
                  {playing ? "Pause walkthrough" : "Play walkthrough"}
                </button>
              ) : (
                <a
                  href={practiceHref}
                  className="inline-flex h-[50px] items-center gap-2.5 rounded-full bg-white px-6 text-[15px] font-bold text-ink transition-transform duration-[120ms] hover:-translate-y-0.5"
                >
                  <span className="w-[26px] h-[26px] rounded-full bg-accent text-accent-on flex items-center justify-center">
                    <Icon name="next" size={16} />
                  </span>
                  Sit a practice test
                </a>
              )}
              <a
                href={scoringHref}
                className="inline-flex h-[50px] items-center rounded-full border border-white/30 px-6 text-[15px] font-bold text-white transition-colors duration-[120ms] hover:border-white"
              >
                How scoring works
              </a>
            </div>

            {/* Equaliser — decorative */}
            <div
              className="flex items-end gap-[5px] h-[34px] pt-3.5"
              aria-hidden="true"
            >
              {BAR_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className="w-[5px] rounded-full shrink-0 origin-bottom"
                  style={{
                    height: `${h}px`,
                    background:
                      i % 3 === 0
                        ? "color-mix(in srgb, var(--accent) 75%, white)"
                        : "rgb(255 255 255 / .42)",
                    animation: `lp-bar ${(1 + (i % 5) * 0.18).toFixed(2)}s ease-in-out infinite`,
                    animationDelay: `${(i * 0.07).toFixed(2)}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Glass stat cards */}
          <div className="grid gap-3.5">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-5 rounded-[18px] border border-white/15 bg-white/[0.06] px-6 py-5.5 backdrop-blur-[8px] transition-colors duration-[120ms] hover:border-white/35"
              >
                <span className="text-[32px] font-bold leading-none tracking-[-0.03em] text-white min-w-[88px]">
                  {s.value}
                </span>
                <span className="text-[14px] leading-[1.6] font-bold text-n-400">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
