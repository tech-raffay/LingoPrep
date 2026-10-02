"use client";

/**
 * Error screen — from "frontend pages svg illustrations/Error Page.dc.html".
 *
 * One frame for 404, 500 and 403, as the design defines them. The digits are
 * set in weight 700, not the design's 900: §08 allows two weights only.
 * The map illustration has a TOEFL variant, so a TOEFL candidate who hits a
 * dead link still sees a single accent (§07).
 */

import Link from "next/link";
import { useExam } from "@/components/theme/ExamThemeProvider";
import Icon from "@/components/brand/Icon";
import Art from "@/components/brand/Art";
import Reveal from "@/components/brand/Reveal";
import { lostArt } from "@/lib/illustrations";

export type ErrorKind = "404" | "500" | "403";

const COPY: Record<ErrorKind, { title: string; tag: string; body: string }> = {
  "404": {
    title: "Page not found",
    tag: "LOST?",
    body: "The page you are looking for does not exist or has moved. Head back to the homepage or pick a skill to practise.",
  },
  "500": {
    title: "Something went wrong",
    tag: "OOPS",
    body: "Something broke on our side. Try again in a moment — if it keeps happening, head back to the homepage and start again.",
  },
  "403": {
    title: "Access denied",
    tag: "LOCKED",
    body: "You need to be signed in to view this page. Sign in to see your results and continue practising.",
  },
};

export default function ErrorScreen({
  kind,
  onRetry,
}: {
  kind: ErrorKind;
  /** 500 only: re-render the failed segment. */
  onRetry?: () => void;
}) {
  const { exam, unset, withExam } = useExam();
  const c = COPY[kind];
  const home = unset ? "/" : withExam("/");
  // The design flanks the art with the first and last digit: 4·4, 5·0, 4·3.
  const [d1, , d3] = kind.split("");

  const secondary =
    kind === "403" ? (
      <SecondaryLink href="/auth/login">Sign in</SecondaryLink>
    ) : kind === "500" && onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className={SECONDARY}
      >
        <Icon name="retry" size={16} />
        Try again
      </button>
    ) : (
      <SecondaryLink href={unset ? "/#choose-path" : withExam("/#skills")}>
        Browse practice tests
      </SecondaryLink>
    );

  return (
    <>
      {/* ── Title band ──────────────────────────────────────────────────── */}
      <section
        className="border-b border-n-200"
        style={{
          background:
            "linear-gradient(110deg, var(--accent-tint) 0%, #fff 48%, var(--n-100) 100%)",
        }}
      >
        <div className="mx-auto max-w-[1200px] px-5 sm:px-7 py-14 sm:pt-[84px] sm:pb-20 flex flex-col items-center gap-[18px] text-center">
          <h1 className="text-[34px] leading-[1.18] sm:text-[48px] tracking-[-0.025em]">
            {kind}: {c.title}
          </h1>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[15px] font-bold">
            <Link href={home} className="text-n-600 hover:text-accent">
              Home
            </Link>
            <Icon name="chevronRight" size={16} className="text-n-500" />
            <span className="text-accent" aria-current="page">
              Error {kind}
            </span>
          </nav>
        </div>
      </section>

      {/* ── Digits around the illustration ─────────────────────────────── */}
      <div className="mx-auto max-w-[1200px] px-5 sm:px-7 pt-16 sm:pt-20 pb-20 sm:pb-24 flex flex-col items-center text-center">
        <Reveal
          className="relative flex items-center justify-center gap-[clamp(4px,1.5vw,18px)] mb-[46px]"
          aria-hidden="true"
        >
          <Digit>{d1}</Digit>
          <div
            className="relative w-[clamp(130px,22vw,270px)] aspect-square shrink-0 rounded-full bg-accent-tint border flex items-center justify-center"
            style={{ borderColor: "color-mix(in srgb, var(--accent) 10%, var(--n-200))" }}
          >
            <Art art={lostArt(exam)} float sizes="270px" className="w-[98%]" />
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-bold tracking-[.14em] text-white">
              {c.tag}
            </span>
          </div>
          <Digit>{d3}</Digit>
        </Reveal>

        <Reveal delay={90} className="flex flex-col items-center">
          <h2 className="text-[30px] sm:text-[36px] mb-3.5">{kind} error</h2>
          <p className="text-[16px] sm:text-[17px] leading-[1.75] text-n-600 max-w-[34rem] [text-wrap:pretty] mb-8">
            {c.body}
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link
              href={home}
              className="inline-flex items-center gap-2 h-[52px] px-7 rounded-full bg-accent text-[15px] font-bold text-accent-on hover:text-accent-on shadow-accent
                         transition-[background-color,transform] duration-200 hover:bg-accent-strong hover:-translate-y-0.5"
            >
              <Icon name="chevronLeft" size={16} />
              Back to homepage
            </Link>
            {secondary}
          </div>
        </Reveal>
      </div>
    </>
  );
}

const SECONDARY =
  "inline-flex items-center gap-2 h-[52px] px-7 rounded-full border border-n-400 bg-n-0 text-[15px] font-bold text-ink hover:text-ink cursor-pointer " +
  "transition-[border-color,transform] duration-200 hover:border-ink hover:-translate-y-0.5";

function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={SECONDARY}>
      {children}
    </Link>
  );
}

function Digit({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-accent font-bold leading-[.9] tracking-[-0.06em] text-[clamp(110px,19vw,230px)]">
      {children}
    </span>
  );
}
