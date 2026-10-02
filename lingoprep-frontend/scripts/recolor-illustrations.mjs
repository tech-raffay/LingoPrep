/**
 * Generates the TOEFL variants of the home/hub illustrations.
 *
 *   node scripts/recolor-illustrations.mjs
 *
 * The illustration set is drawn in a coral/crimson palette. On a TOEFL screen
 * that would put a second exam accent beside the blue one, which brand book
 * §07 forbids ("Never mix both accents on one screen"). This script writes a
 * copy of each file into public/illustrations/toefl/ with every saturated red
 * moved onto the TOEFL blue hue.
 *
 * Only reds are touched. Skin tones are light and desaturated, so they fall
 * under the saturation floor; amber, ink and the neutrals sit outside the hue
 * band. Re-run this whenever an illustration in SOURCES changes.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "illustrations");
const OUT = join(ROOT, "toefl");

/** Files that can appear on a TOEFL screen. IELTS-lettered art is excluded —
 *  it gets an unlettered counterpart instead (see src/lib/illustrations.ts). */
const SOURCES = [
  "students-group-2.svg",
  "student-map.svg",
  "listening-person.svg",
  "reading-person.svg",
  "writing-person.svg",
  "speaking-person.svg",
  // Score-report mascots ("Listening Score Report.dc.html")
  "mascot/k0.svg",
  "mascot/k1.svg",
  "mascot/k2.svg",
  "mascot/k3.svg",
];

/** TOEFL blue (#0057B8) sits at ~212°. */
const TARGET_HUE = 212;
/** Red band, in degrees: 330° → 360° and 0° → 18°. */
const inRedBand = (h) => h >= 330 || h <= 18;
/** Pure reds and pinks (340° → 3°). Skin tones lean orange, at 5°–11°. */
const isPureRed = (h) => h >= 340 || h <= 3;
/** HSV floors. Skin tones (light peach and deep brown alike) sit at ~0.40–0.47
 *  saturation, so anything orange-leaning needs 0.5+ to count as a garment
 *  red. Pure reds cannot be skin, so pale coral clothing shifts from 0.3. The
 *  value floor keeps near-black outlines out. */
const MIN_SAT = 0.5;
const MIN_SAT_PURE = 0.3;
const MIN_VAL = 0.45;

function hexToHsv(hex) {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

function hsvToHex({ h, s, v }) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r, g, b]
    .map((n) => Math.round((n + m) * 255).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function shift(hex) {
  const hsv = hexToHsv(hex);
  const floor = isPureRed(hsv.h) ? MIN_SAT_PURE : MIN_SAT;
  if (!inRedBand(hsv.h) || hsv.s < floor || hsv.v < MIN_VAL) return hex;
  // Blue reads lighter than red at equal value, so pull it down a touch.
  return hsvToHex({ h: TARGET_HUE, s: Math.min(1, hsv.s * 1.05), v: hsv.v * 0.86 });
}

mkdirSync(OUT, { recursive: true });

for (const file of SOURCES) {
  const src = readFileSync(join(ROOT, file), "utf8");
  let changed = 0;
  const out = src.replace(/#([0-9A-Fa-f]{6})\b/g, (m, hex) => {
    const next = shift(hex);
    if (next.toUpperCase() !== hex.toUpperCase()) changed++;
    return "#" + next;
  });
  mkdirSync(dirname(join(OUT, file)), { recursive: true });
  writeFileSync(join(OUT, file), out);
  console.log(`${file}: ${changed} fills shifted`);
}
