/**
 * Per-skill colours, shared by the exam hub and the results page.
 *
 * Reading takes the exam accent; the other three use hues that belong to
 * neither exam — amber, the deep green of the brand book's "Reading Room"
 * scheme (§13), and ink — so no skill can put the other exam's accent on
 * screen (§07). The design's Writing blue (#0057B8) was the TOEFL accent.
 */

import type { SkillKey } from "@/lib/illustrations";

export interface Hue {
  accent: string;
  deep: string;
  tint: string;
  dot: string;
  glow: string;
}

export const HUES: Record<SkillKey, Hue> = {
  listening: {
    accent: "var(--amber-500)", deep: "#B4690D", tint: "#FFF4DE",
    dot: "rgb(245 158 11 / .28)", glow: "rgb(245 158 11 / .35)",
  },
  reading: {
    accent: "var(--accent)", deep: "var(--accent-strong)", tint: "var(--accent-tint)",
    dot: "color-mix(in srgb, var(--accent) 20%, transparent)",
    glow: "color-mix(in srgb, var(--accent) 30%, transparent)",
  },
  writing: {
    accent: "#1F7A5C", deep: "#12503C", tint: "#EAF5EF",
    dot: "rgb(18 80 60 / .2)", glow: "rgb(18 80 60 / .3)",
  },
  speaking: {
    accent: "#2E3A5C", deep: "var(--ink)", tint: "#EEF0F6",
    dot: "rgb(18 23 43 / .16)", glow: "rgb(18 23 43 / .3)",
  },
};
