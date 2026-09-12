/**
 * LingoPrep logo — "The Progress Bubble" (brand book §03).
 *
 * "A speech bubble — language, spoken and written — containing three ascending
 *  bars: measurable progress toward a target band. The tail doubles as a
 *  downward pointer, reading as a cursor placing the learner inside the
 *  conversation."
 *
 * Construction (§03), on an 8×8 unit grid where 1u = 6px at a 48px viewBox:
 *   bubble stroke = 0.7u · corner radius = 2.5u · bars 1u wide, 1u gaps,
 *   rising in 2u steps · wordmark cap height = 4u · gap to wordmark = stroke×3.
 *
 * Wordmark (§03): Proxima Nova Bold, tracking −0.04em, camel case, never
 * spaced. "Lingo" is Ink, "Prep" is the accent — a neutral first element and a
 * saturated second element, "so the brand reads correctly even at small sizes
 * in a browser tab strip". The accent follows the active exam, matching the
 * brand book's own scheme 04 where "Prep" is rendered in TOEFL blue.
 *
 * The mark takes `currentColor`, so it inherits whatever accent the caller
 * sets — it can never render the wrong exam's colour.
 */

interface LogoProps {
  /** Mark height in px. The wordmark scales with it. */
  size?: number;
  /** Render the mark alone, without the wordmark. */
  markOnly?: boolean;
  /** For dark grounds (§05 reversed lockup): "Lingo" becomes white. */
  reversed?: boolean;
  className?: string;
}

/** The mark alone. Inherits `currentColor`. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="LingoPrep"
      className={className}
      style={{ flexShrink: 0 }}
    >
      {/* Bubble — stroke 0.7u ≈ 3.4px at this scale, radius 2.5u ≈ 10px */}
      <rect x="4" y="6" width="40" height="30" rx="10" stroke="currentColor" strokeWidth="3.4" />
      {/* Tail, doubling as a downward cursor */}
      <path d="M16 34v10l11-9" fill="currentColor" />
      {/* Three ascending bars — 1u wide, 1u gaps, rising in 2u steps */}
      <rect x="14" y="24" width="4.5" height="6" rx="2.25" fill="currentColor" />
      <rect x="21.5" y="20" width="4.5" height="10" rx="2.25" fill="currentColor" />
      <rect x="29" y="15.5" width="4.5" height="14.5" rx="2.25" fill="currentColor" />
    </svg>
  );
}

export default function Logo({ size = 32, markOnly, reversed, className }: LogoProps) {
  if (markOnly) {
    return <LogoMark size={size} className={`text-accent ${className ?? ""}`} />;
  }

  return (
    <span
      className={`inline-flex items-center ${className ?? ""}`}
      // §03: gap between mark and wordmark = the mark's stroke × 3
      style={{ gap: size * 0.215 }}
    >
      <LogoMark size={size} className="text-accent" />
      <span
        style={{
          fontWeight: 700,
          fontSize: size * 0.72,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: reversed ? "#FFFFFF" : "var(--ink)" }}>Lingo</span>
        <span style={{ color: "var(--accent)" }}>Prep</span>
      </span>
    </span>
  );
}
