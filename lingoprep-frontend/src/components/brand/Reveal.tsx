"use client";

/**
 * Scroll reveal — the React port of the design's `motion.js`.
 *
 * Content rises 26px and un-blurs as it enters the viewport, once. Grid items
 * pass a `delay` to stagger. The design applied this by scanning the DOM for
 * every <section>; here it is opt-in per element, so it can never reach inside
 * an active test (§11: "Never animate anything inside an active test").
 *
 * Under prefers-reduced-motion the CSS shows everything immediately (see
 * `.lp-reveal` in globals.css), and the observer is never created.
 */

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/** One observer for the whole page rather than one per element. */
let observer: IntersectionObserver | null = null;
function getObserver() {
  if (observer || typeof IntersectionObserver === "undefined") return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-in");
        observer?.unobserve(e.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  return observer;
}

export default function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  style,
  children,
  ...rest
}: {
  as?: ElementType;
  /** Stagger, in ms. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = getObserver();
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!io || reduce) {
      el.classList.add("is-in");
      return;
    }
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return (
    <Tag
      ref={ref}
      className={`lp-reveal ${className ?? ""}`}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
