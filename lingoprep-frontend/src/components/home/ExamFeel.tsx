"use client";

/**
 * "What the exam actually feels like" — from "LingoPrep Home.dc.html".
 *
 * The 16:10 panel is the design's video slot, and takes either source:
 *
 *  - `embedUrl` renders a third-party player in an iframe. This is what the
 *    Streamable clip uses. Streamable's direct .mp4 links are CloudFront URLs
 *    signed with a short-lived `Expires`/`Signature` pair (the one for this
 *    clip expired 2026-09-15), so hardcoding the file URL would have shown a
 *    broken player within days. The /o/ embed path is the stable, supported
 *    address and is what Streamable's own API hands back.
 *
 *  - `videoSrc` renders a real <video> for a file you host yourself. Prefer
 *    this once the clip lives in /public or on your own CDN: it can be muted,
 *    looped and posterised, and it drops the third-party frame.
 *
 * With neither, the panel shows the design's placeholder state, which reads as
 * a deliberate empty player rather than a broken image.
 */

import Icon from "@/components/brand/Icon";

const POINTS = [
  "The same on-screen layout you will see in the test centre.",
  "Listening audio that plays once, exactly as the real exam does.",
  "A full band report at the end, criterion by criterion.",
];

export default function ExamFeel({
  videoSrc,
  embedUrl,
  ctaHref,
}: {
  videoSrc?: string;
  /** Third-party player URL, rendered in an iframe. */
  embedUrl?: string;
  ctaHref: string;
}) {
  return (
    <section className="bg-n-0">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-7 pt-20 sm:pt-24">
        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-10 items-center">
          {/* ── Video slot ────────────────────────────────────────────────── */}
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
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title="A full LingoPrep practice test, start to finish"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 w-full h-full border-0"
              />
            ) : videoSrc ? (
              <video
                src={videoSrc}
                controls
                playsInline
                preload="metadata"
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
