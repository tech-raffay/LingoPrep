"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  DEFAULT_EXAM,
  EXAM_STORAGE_KEY,
  type ExamTheme,
  type ExamType,
  isExamType,
  themeFor,
} from "@/lib/exam";

/**
 * Exam theme context.
 *
 * ── Why this exists ──────────────────────────────────────────────────────────
 * Previously Navbar, Footer and every module page each ran its own
 * `useEffect` → `localStorage.getItem` → `setState`. Because `activeExam`
 * started as `null`, the first paint was always crimson, then flipped to blue
 * on hydration for TOEFL candidates: a visible red→blue flash on every single
 * page load, plus two components could disagree mid-render and show crimson
 * and blue chrome on the same screen — exactly what brand book §07 forbids.
 *
 * ── How it is fixed ──────────────────────────────────────────────────────────
 * Two independent mechanisms, each doing one job:
 *
 *  1. Colour. `examThemeScript` runs synchronously in <head> and stamps
 *     `data-exam` on <html> before the browser's first paint. Every accent
 *     token in globals.css hangs off that attribute, so the correct accent is
 *     on screen in frame one — no flash, and no component can disagree because
 *     none of them own a colour.
 *
 *  2. State, one-way. The URL is the single source of truth for the theme:
 *     `?exam=` names it and `?pick=1` means "no choice yet". localStorage is
 *     only a convenience for restoring the last exam when you arrive with no
 *     parameter, read through `useSyncExternalStore` and written *only* on an
 *     explicit choice.
 *
 *     Earlier versions synced the URL and storage to each other with effects,
 *     and the two writes fought: clearing the exam was immediately undone by
 *     the URL→storage sync, so the accent flipped back and forth and "Change
 *     exam" never took effect. There is now exactly one effect, and it only
 *     writes the DOM attribute.
 */

/** Fired when this tab changes the exam; `storage` only covers other tabs. */
const EXAM_EVENT = "lingoprep:exam";

/**
 * Marks the exam picker. "Change exam" must carry its intent in the URL, not
 * in localStorage: clearing storage while the URL still said `?exam=ielts`
 * made the URL→storage sync effect below immediately write the exam back, so
 * the accent oscillated and the choice never actually cleared.
 */
const PICK_PARAM = "pick";

/** href for "Change exam" — the picker. */
export const PICKER_HREF = `/?${PICK_PARAM}=1`;

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EXAM_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EXAM_EVENT, onChange);
  };
}

function readStoredExam(): ExamType | null {
  try {
    const value = localStorage.getItem(EXAM_STORAGE_KEY);
    return isExamType(value) ? value : null;
  } catch {
    return null; // private mode / storage blocked
  }
}

/** The server cannot see localStorage, so it reports "no choice yet". */
function noStoredExam(): null {
  return null;
}

function writeStoredExam(exam: ExamType | null) {
  try {
    if (exam) localStorage.setItem(EXAM_STORAGE_KEY, exam);
    else localStorage.removeItem(EXAM_STORAGE_KEY);
  } catch {
    /* the URL still carries the theme */
  }
  window.dispatchEvent(new Event(EXAM_EVENT));
}

/**
 * Write `data-exam` so every CSS variable in the document re-binds at once.
 *
 * Transitions are disabled for the single frame in which the attribute
 * changes. Without that, the `transition-colors` that buttons and links use
 * for hover also animates the accent swap, cross-fading #0057B8 → #C8102E
 * through purple — which looks exactly like two themes fighting.
 */
function paint(exam: ExamType) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (root.dataset.exam === exam) return; // nothing to repaint

  root.dataset.themeSwitching = "";
  root.dataset.exam = exam;
  // Force a reflow so the un-transitioned value is committed before the flag
  // is dropped; otherwise the browser may coalesce both changes and animate.
  void root.offsetHeight;
  requestAnimationFrame(() => {
    delete root.dataset.themeSwitching;
  });
}

interface ExamContextValue {
  /** The active exam. Never null — falls back to the default. */
  exam: ExamType;
  /** Tokens and scoring rules for the active exam. */
  theme: ExamTheme;
  /** False during SSR and the hydrating render, true afterwards. */
  hydrated: boolean;
  /**
   * True when the candidate has not chosen an exam yet. The landing page uses
   * this to show the "Choose your path" picker. Distinct from `exam`, which is
   * always a usable value so chrome never has to render un-themed.
   */
  unset: boolean;
  /**
   * Remember a choice. Storage only — it does not navigate and does not
   * repaint. Call it from the onClick of a link whose href already points at
   * `examHref(...)` / `PICKER_HREF`, so the navigation does the recolouring.
   */
  persistExam: (exam: ExamType | null) => void;
  /** The URL that selects an exam. Use as a real href. */
  examHref: (exam: ExamType) => string;
  /**
   * Switch exam programmatically, for callers with no link to hang off (the
   * dashboard reconciling against the backend's track). Does a full document
   * load so the pre-paint script sets the accent before anything renders.
   */
  setExam: (exam: ExamType) => void;
  /** Append `?exam=…` to a path so the theme survives navigation. */
  withExam: (path: string) => string;
}

const ExamContext = createContext<ExamContextValue | null>(null);

export function ExamThemeProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  // The URL is readable during SSR, so a themed link renders correctly on the
  // server and needs no client round-trip.
  const rawUrlExam = searchParams.get("exam");
  const urlExam = isExamType(rawUrlExam) ? rawUrlExam : null;

  // ?pick=1 overrides everything: it means "show me the picker", and it
  // survives navigation because it lives in the URL.
  const picking = searchParams.get(PICK_PARAM) === "1";

  const storedExam = useSyncExternalStore(subscribe, readStoredExam, noStoredExam);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);

  // The URL wins over storage: a shared link must open the exam it names.
  const resolved = picking ? null : urlExam ?? storedExam;
  const exam = resolved ?? DEFAULT_EXAM;

  // The ONLY effect: push the resolved exam out to the DOM attribute. There is
  // deliberately no effect syncing the URL and localStorage to each other —
  // two such effects existed and each undid the other's write, which is what
  // made the accent oscillate and "Change exam" fail to stick. Storage is now
  // written only at the moment of an explicit choice (persistExam / setExam).
  useEffect(() => {
    paint(exam);
  }, [exam]);

  const persistExam = useCallback((next: ExamType | null) => {
    writeStoredExam(next);
  }, []);

  const examHref = useCallback((next: ExamType) => `/?exam=${next}`, []);

  const setExam = useCallback((next: ExamType) => {
    writeStoredExam(next);
    // A full load, deliberately. Soft-navigating to the same route with only a
    // changed search param does not re-render this statically generated page,
    // so the picker stayed on screen after a choice. A real navigation also
    // means the pre-paint script sets the accent before the first frame, which
    // makes a mid-transition wrong colour impossible rather than merely rare.
    // Stay on the current page — the dashboard reconciling its track must not
    // be thrown back to the landing page.
    const url = new URL(window.location.href);
    url.searchParams.set("exam", next);
    url.searchParams.delete(PICK_PARAM);
    window.location.assign(url.toString());
  }, []);

  const withExam = useCallback(
    (path: string) => {
      const [base, hash] = path.split("#");
      const joiner = base.includes("?") ? "&" : "?";
      return `${base}${joiner}exam=${exam}${hash ? `#${hash}` : ""}`;
    },
    [exam]
  );

  const value = useMemo<ExamContextValue>(
    () => ({
      exam,
      theme: themeFor(exam),
      hydrated,
      unset: resolved === null,
      persistExam,
      examHref,
      setExam,
      withExam,
    }),
    [exam, hydrated, resolved, persistExam, examHref, setExam, withExam]
  );

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

/** Read the active exam theme. Must be used under <ExamThemeProvider>. */
export function useExam(): ExamContextValue {
  const ctx = useContext(ExamContext);
  if (!ctx) {
    throw new Error("useExam must be used within <ExamThemeProvider>");
  }
  return ctx;
}

/**
 * Runs synchronously in <head>, before first paint, so the correct accent is
 * on screen in frame one. Kept dependency-free and tiny; failures are
 * swallowed because a missing attribute simply yields the crimson default.
 */
export const examThemeScript = `(function(){var d='${DEFAULT_EXAM}';try{if(/[?&]${PICK_PARAM}=1/.test(location.search)){document.documentElement.dataset.exam=d;return}var e=null;var m=location.search.match(/[?&]exam=(ielts|toefl)/);if(m){e=m[1]}else{e=localStorage.getItem('${EXAM_STORAGE_KEY}')}document.documentElement.dataset.exam=(e==='toefl'||e==='ielts')?e:d}catch(_){document.documentElement.dataset.exam=d}})();`;
