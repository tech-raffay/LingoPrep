"use client";

/**
 * LingoPrep UI kit — brand book §10 "Pills, cards and one radius scale".
 *
 * Every accent surface here reads var(--accent) via the Tailwind `accent`
 * tokens, so a component rendered on a TOEFL page is blue and on an IELTS page
 * crimson without being told which — and cannot be both. Semantic colours
 * (correct/incorrect) deliberately do NOT follow the accent: §07 requires
 * correct to be green and the candidate's wrong choice red in both exams.
 */

import Link from "next/link";
import Icon, { type IconName } from "./Icon";

/* ═══ Buttons (§10) ════════════════════════════════════════════════════════
   Height 44px (40 compact) · radius full pill · label 700 / 15px
   Focus ring 2px accent, 2px offset (inherited from globals.css)
   ═══════════════════════════════════════════════════════════════════════ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "default" | "compact";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon. Always paired with a text label (§09). */
  icon?: IconName;
  /** Trailing icon — use "next" for forward motion. */
  trailingIcon?: IconName;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-on border border-transparent hover:bg-accent-strong shadow-e1",
  secondary:
    "bg-n-0 text-ink border border-n-300 hover:border-n-400 hover:bg-n-50",
  ghost:
    "bg-transparent text-accent border border-transparent hover:bg-accent-tint",
  // Destructive actions use the semantic error colour, never the accent —
  // "Submit exam" must read the same in both exams.
  danger:
    "bg-error text-white border border-transparent hover:brightness-90 shadow-e1",
};

function buttonClasses({ variant = "primary", size = "default", fullWidth, className }: Partial<ButtonBaseProps>) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-full font-bold",
    "transition-colors duration-[120ms] cursor-pointer select-none",
    "disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none",
    size === "compact" ? "h-10 px-4 text-[14px]" : "h-11 px-6 text-[15px]",
    VARIANTS[variant],
    fullWidth ? "w-full" : "",
    className ?? "",
  ].join(" ");
}

export function Button({
  variant, size, icon, trailingIcon, fullWidth, className, children, ...rest
}: ButtonBaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      {icon && <Icon name={icon} size={16} />}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={16} />}
    </button>
  );
}

export function ButtonLink({
  href, variant, size, icon, trailingIcon, fullWidth, className, children,
}: ButtonBaseProps & { href: string }) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, fullWidth, className })}>
      {icon && <Icon name={icon} size={16} />}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={16} />}
    </Link>
  );
}

/* ═══ Badges & pills (§10) ═════════════════════════════════════════════════ */

type BadgeTone = "accent" | "neutral" | "success" | "warning" | "error" | "ai";

const BADGE_TONES: Record<BadgeTone, string> = {
  accent: "bg-accent-tint text-accent-on-tint",
  neutral: "bg-n-100 text-n-600",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-[#78350F]",
  error: "bg-error-tint text-error",
  ai: "bg-ai-tint text-ai",
};

export function Badge({
  tone = "accent", icon, children, className,
}: {
  tone?: BadgeTone;
  icon?: IconName;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        "text-[11px] font-bold uppercase tracking-[.12em] leading-4",
        BADGE_TONES[tone],
        className ?? "",
      ].join(" ")}
    >
      {icon && <Icon name={icon} size={16} className="-ml-0.5" />}
      {children}
    </span>
  );
}

/* ═══ Card (§10) ═══════════════════════════════════════════════════════════
   Radius 16px (24px feature) · border 1px #E3E6EE
   "Borders carry structure; shadows are a light accent on hover and modals
    only. Never both a heavy border and a heavy shadow."
   ═══════════════════════════════════════════════════════════════════════ */

export function Card({
  feature, interactive, className, style, children,
}: {
  feature?: boolean;
  interactive?: boolean;
  className?: string;
  /**
   * Escape hatch for rebinding --accent on one subtree — used by the landing
   * picker, whose chrome is neutral but whose sample report is labelled IELTS
   * and must therefore be crimson.
   */
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      style={style}
      className={[
        "bg-n-0 border border-n-300",
        feature ? "rounded-feature" : "rounded-card",
        interactive
          ? "transition-[box-shadow,border-color] duration-[120ms] hover:border-n-400 hover:shadow-e2"
          : "",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* ═══ Eyebrow / section label (§08 label token) ════════════════════════════ */

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`t-label text-n-500 ${className ?? ""}`}>{children}</div>
  );
}

/* ═══ Score circle (§10) ═══════════════════════════════════════════════════
   "8px accent-tint ring, neutral fill, Proxima Nova 700 numeral.
    One decimal for IELTS, integer for TOEFL."
   The fraction filled is drawn in the accent; the remainder in accent-tint.
   ═══════════════════════════════════════════════════════════════════════ */

export function ScoreCircle({
  value, max, decimals = 1, label, caption, size = 132,
}: {
  value: number | null;
  max: number;
  decimals?: number;
  /** e.g. "IELTS band" — comes from the exam theme, never hardcoded. */
  label: string;
  caption?: string;
  size?: number;
}) {
  const ring = 8; // §10: 8px ring
  const r = (size - ring) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = value !== null && max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          {/* Track — accent tint */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="var(--accent-tint)" strokeWidth={ring}
          />
          {/* Progress — accent */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="var(--accent)" strokeWidth={ring}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            style={{ transition: "stroke-dashoffset 600ms var(--ease)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold text-ink leading-none"
            style={{ fontSize: size * 0.3, letterSpacing: "-0.02em" }}
          >
            {value !== null ? value.toFixed(decimals) : "—"}
          </span>
          <span className="text-[11px] font-bold text-n-500 mt-1">out of {max}</span>
        </div>
      </div>
      <div className="text-center">
        <div className="t-label text-n-500">{label}</div>
        {caption && <div className="text-[12px] text-n-500 mt-0.5">{caption}</div>}
      </div>
    </div>
  );
}

/* ═══ Criterion bar (§10) ══════════════════════════════════════════════════
   "8px track, full radius, accent fill. Always label the numeric value."
   ═══════════════════════════════════════════════════════════════════════ */

export function CriterionBar({
  label, value, max, decimals = 1,
}: {
  label: string;
  value: number;
  max: number;
  decimals?: number;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[14px] font-medium text-n-700">{label}</span>
        {/* §10: always label the numeric value; §08: figures are JetBrains Mono */}
        <span className="t-numeric text-[14px] text-ink">{value.toFixed(decimals)}</span>
      </div>
      <div className="h-2 rounded-full bg-accent-tint overflow-hidden">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${pct}%`, transition: "width 600ms var(--ease)" }}
        />
      </div>
    </div>
  );
}

/* ═══ Form field (§10) ════════════════════════════════════════════════════
   "Inputs use 8px radius — the one place radius is not a pill. Labels are
    always visible, never placeholder-only."
   ═══════════════════════════════════════════════════════════════════════ */

export function Field({
  label, error, hint, id, className, ...rest
}: {
  label: string;
  error?: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? `f-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className={className}>
      {/* §10: the label is always visible */}
      <label htmlFor={inputId} className="block text-[13px] font-bold text-ink mb-1.5">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
        className={[
          "w-full h-11 px-3.5 rounded-input bg-n-0 text-[14px] text-ink",
          "border transition-colors duration-[120ms]",
          "placeholder:text-n-500",
          error
            ? "border-error focus:border-error"
            : "border-n-300 focus:border-accent",
          "outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
          error ? "focus-visible:outline-error" : "focus-visible:outline-accent",
        ].join(" ")}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-err`} className="flex items-center gap-1.5 text-[12px] text-error mt-1.5 font-medium">
          {/* §07: never rely on colour alone — the icon carries the state too */}
          <Icon name="warning" size={16} />
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-[12px] text-n-500 mt-1.5">{hint}</p>
      )}
    </div>
  );
}

/* ═══ Timer (§08 numeric token, §11 "Timers — no animation") ═══════════════ */

export function Timer({ seconds, urgent }: { seconds: number; urgent?: boolean }) {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return (
    <span
      className={[
        "t-numeric inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[15px]",
        // Time-low uses the semantic error colour (§07), not the exam accent
        urgent ? "bg-error-tint text-error" : "bg-n-100 text-ink",
      ].join(" ")}
      // §11: never animate a timer
      role="timer"
      aria-live="off"
    >
      <Icon name="timer" size={16} />
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

/* ═══ Answer option (§10) ═════════════════════════════════════════════════
   Selected rows take the accent tint. Reviewed rows take semantic green/red
   regardless of exam, and always carry an icon plus a text label (§07).
   ═══════════════════════════════════════════════════════════════════════ */

export function AnswerOption({
  letter, children, selected, state, onClick,
}: {
  letter: string;
  children: React.ReactNode;
  selected?: boolean;
  /** Review states. Undefined while the test is live. */
  state?: "correct" | "chosen-wrong";
  onClick?: () => void;
}) {
  const base =
    "w-full flex items-start gap-3 text-left rounded-input border px-3.5 py-3 text-[14px] transition-colors duration-[120ms]";

  const tone =
    state === "correct"
      ? "border-success bg-success-tint text-ink"
      : state === "chosen-wrong"
      ? "border-error bg-error-tint text-ink"
      : selected
      ? "border-accent bg-accent-tint text-accent-on-tint font-bold"
      : "border-n-300 bg-n-0 text-n-700 hover:border-n-400 hover:bg-n-50 cursor-pointer";

  return (
    <button type="button" onClick={onClick} className={`${base} ${tone}`} aria-pressed={selected}>
      <span
        className={[
          "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
          state === "correct" ? "border-success" :
          state === "chosen-wrong" ? "border-error" :
          selected ? "border-accent" : "border-n-400",
        ].join(" ")}
      >
        {selected && !state && <span className="w-2 h-2 rounded-full bg-accent" />}
        {state === "correct" && <Icon name="check" size={16} className="text-success" />}
        {state === "chosen-wrong" && <Icon name="close" size={16} className="text-error" />}
      </span>
      <span className="flex-1">
        <span className="font-bold mr-1.5">{letter}.</span>
        {children}
      </span>
      {/* §07: correct/incorrect always carry a text label, not just colour */}
      {state && (
        <span
          className={`t-label shrink-0 mt-1 ${state === "correct" ? "text-success" : "text-error"}`}
        >
          {state === "correct" ? "Correct" : "Your answer"}
        </span>
      )}
    </button>
  );
}

/* ═══ Spinner ══════════════════════════════════════════════════════════════ */

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div
        className="w-7 h-7 rounded-full border-2 border-accent border-t-transparent"
        style={{ animation: "lp-spin 700ms linear infinite" }}
        role="status"
        aria-label={label ?? "Loading"}
      />
      {label && <p className="text-[13px] text-n-500 font-medium">{label}</p>}
    </div>
  );
}

/* ═══ AI-scoring notice (§14) ══════════════════════════════════════════════
   "State that scoring is AI-generated wherever a band is shown."
   Uses the AI semantic violet, never the exam accent.
   ═══════════════════════════════════════════════════════════════════════ */

export function AiScoreNotice({ className }: { className?: string }) {
  return (
    <p
      className={[
        "flex items-start gap-2 rounded-input bg-ai-tint px-3.5 py-2.5",
        "text-[12px] leading-5 text-ai font-medium",
        className ?? "",
      ].join(" ")}
    >
      <Icon name="ai" size={16} className="mt-0.5 shrink-0" />
      <span>
        This is an AI-generated practice estimate, not an official result.
      </span>
    </p>
  );
}
