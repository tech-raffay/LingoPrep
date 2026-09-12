/**
 * LingoPrep icon library — brand book §09.
 *
 * "Icons are drawn on a 24×24 grid with a 1.8px stroke, round caps and round
 *  joins... They are monochrome, taking currentColor — never multi-coloured,
 *  never filled, never emoji."
 *
 * Don'ts enforced here (§09): no emoji anywhere in production UI (the earlier
 * module tiles used 🎧 📖 ✒ 🎙), no filled/duotone mixes, no scaling below
 * 16px, and one stroke weight with no per-shape "balancing" tweaks.
 *
 * Every glyph maps to exactly one meaning across the product.
 */

export type IconName =
  | "listening" | "reading" | "writing" | "speaking"
  | "timer" | "correct" | "incorrect" | "progress"
  | "target" | "achievement" | "globe" | "account"
  | "schedule" | "download" | "search" | "reminder"
  | "play" | "pause" | "waveform" | "secure"
  | "saved" | "streak" | "bookmark" | "next"
  | "info" | "support" | "report" | "ai"
  | "menu" | "close" | "check" | "chevronRight"
  | "signOut" | "retry" | "warning";

interface IconProps {
  name: IconName;
  /** §09: sizes shipped are 16 / 20 / 24 / 32. Never below 16. */
  size?: 16 | 20 | 24 | 32;
  className?: string;
  /** Decorative icons are hidden from screen readers; label makes one meaningful. */
  label?: string;
}

/* Paths are authored against the 24×24 grid with a 20×20 live area. */
const PATHS: Record<IconName, React.ReactNode> = {
  /* ── The four skill modules (§09) ──────────────────────────────────────── */
  listening: (
    <>
      <path d="M3 17v-5a9 9 0 0 1 18 0v5" />
      <path d="M21 18a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 18a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </>
  ),
  reading: (
    <>
      <path d="M12 6.5v14" />
      <path d="M12 6.5C10.5 5 8.5 4.2 4 4.2v13.6c4.5 0 6.5.8 8 2.2 1.5-1.4 3.5-2.2 8-2.2V4.2c-4.5 0-6.5.8-8 2.3Z" />
    </>
  ),
  writing: (
    <>
      <path d="M12 20h8" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />
    </>
  ),
  speaking: (
    <>
      <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
      <path d="M19 11v1a7 7 0 0 1-14 0v-1" />
      <path d="M12 19v2" />
    </>
  ),

  /* ── Test chrome ───────────────────────────────────────────────────────── */
  timer: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9.5V13l2.5 2" />
      <path d="M9 2h6" />
    </>
  ),
  correct: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.8 2.8L16 10" />
    </>
  ),
  incorrect: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </>
  ),
  progress: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20V7" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </>
  ),
  achievement: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 14.5L7 22l5-2.5L17 22l-1.5-7.5" />
    </>
  ),

  /* ── Account & navigation ──────────────────────────────────────────────── */
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9Z" />
    </>
  ),
  account: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  schedule: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="M7.5 10.5L12 15l4.5-4.5" />
      <path d="M4 19h16" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </>
  ),
  reminder: (
    <>
      <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5Z" />
      <path d="M10.3 20a2 2 0 0 0 3.4 0" />
    </>
  ),

  /* ── Audio ─────────────────────────────────────────────────────────────── */
  play: <path d="M8 5.5l11 6.5-11 6.5V5.5Z" />,
  pause: (
    <>
      <path d="M9.5 5v14M14.5 5v14" />
    </>
  ),
  waveform: (
    <>
      <path d="M3 12h2M8 7.5v9M12 4.5v15M16 8.5v7M20 11h2" />
    </>
  ),

  /* ── Trust & state ─────────────────────────────────────────────────────── */
  secure: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </>
  ),
  saved: (
    <>
      <path d="M5 13.5l4.5 4.5L19 8.5" />
    </>
  ),
  streak: (
    <>
      <path d="M12 3s5.5 4.5 5.5 9.5a5.5 5.5 0 0 1-11 0C6.5 9 12 3 12 3Z" />
      <path d="M12 19.5a2.8 2.8 0 0 0 2.8-2.8c0-2-2.8-4.2-2.8-4.2s-2.8 2.2-2.8 4.2A2.8 2.8 0 0 0 12 19.5Z" />
    </>
  ),
  bookmark: <path d="M18 21l-6-4.5L6 21V5.5A2.5 2.5 0 0 1 8.5 3h7A2.5 2.5 0 0 1 18 5.5V21Z" />,
  next: (
    <>
      <path d="M4 12h15" />
      <path d="M13.5 6.5L20 12l-6.5 5.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <path d="M12 7.8h.01" />
    </>
  ),
  support: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.6 2.6 0 1 1 3.6 2.4c-.7.3-1.1 1-1.1 1.8v.3" />
      <path d="M12 17.5h.01" />
    </>
  ),
  report: (
    <>
      <path d="M14 3.5H7A2.5 2.5 0 0 0 4.5 6v12A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5V9L14 3.5Z" />
      <path d="M13.5 3.5V9h6" />
      <path d="M8.5 15.5h7M8.5 12h4" />
    </>
  ),
  ai: (
    <>
      <path d="M12 3l1.7 4.8L18.5 9.5l-4.8 1.7L12 16l-1.7-4.8L5.5 9.5l4.8-1.7L12 3Z" />
      <path d="M18 16.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
    </>
  ),

  /* ── Interface utility ─────────────────────────────────────────────────── */
  menu: <path d="M3.5 12h17M3.5 6.5h17M3.5 17.5h17" />,
  close: <path d="M18 6L6 18M6 6l12 12" />,
  check: <path d="M20 6.5L9.5 17 4.5 12" />,
  chevronRight: <path d="M9.5 5.5L16 12l-6.5 6.5" />,
  signOut: (
    <>
      <path d="M9.5 21H6a2.5 2.5 0 0 1-2.5-2.5v-13A2.5 2.5 0 0 1 6 3h3.5" />
      <path d="M16 7.5L20.5 12 16 16.5" />
      <path d="M20 12H9" />
    </>
  ),
  retry: (
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.8-6.3" />
      <path d="M20.5 4.5V10H15" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4.5L21 20H3l9-15.5Z" />
      <path d="M12 10v4.5" />
      <path d="M12 17.6h.01" />
    </>
  ),
};

export default function Icon({ name, size = 20, className, label }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0 }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {PATHS[name]}
    </svg>
  );
}

/** The four modules, in the brand book's order (§09). */
export const MODULE_ICONS: Record<string, IconName> = {
  listening: "listening",
  reading: "reading",
  writing: "writing",
  speaking: "speaking",
};
