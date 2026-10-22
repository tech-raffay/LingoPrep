/**
 * What the candidate sees while a recording plays.
 *
 * The TOEFL iBT (ETS, 2026) shows "a visual representation of the
 * speaker(s)" with every recording; IELTS shows nothing but the questions.
 * Both tests tell the candidate who is talking and where, so the card
 * draws the speakers as plain figures with their roles, over the setting.
 *
 * A recording's `content` column holds the scene as header lines:
 *
 *   Kind: conversation
 *   Setting: A phone call to a community library
 *   Speakers: Hannah, a caller (f); Tom, the volunteer coordinator (m)
 *   Photo: /media/listening/ielts-1-library.jpg | Rows of library bookshelves
 */

export type SceneKind = "conversation" | "monologue" | "lecture" | "response" | "announcement" | "talk";

export interface Speaker {
  role: string;
  gender: "m" | "f";
}

export interface Scene {
  kind: SceneKind;
  setting: string;
  speakers: Speaker[];
  photo?: { src: string; alt: string };
}

export function parseScene(content?: string): Scene {
  const scene: Scene = { kind: "conversation", setting: "", speakers: [] };
  for (const raw of (content || "").split("\n")) {
    const at = raw.indexOf(":");
    if (at < 0) continue;
    const key = raw.slice(0, at).trim().toLowerCase();
    const value = raw.slice(at + 1).trim();
    if (key === "kind") scene.kind = value as SceneKind;
    else if (key === "setting") scene.setting = value;
    else if (key === "speakers") {
      scene.speakers = value.split(";").map((s) => {
        const m = /^(.*?)\s*\((m|f)\)\s*$/.exec(s.trim());
        return { role: m ? m[1] : s.trim(), gender: (m?.[2] as "m" | "f") || "f" };
      }).filter((s) => s.role);
    } else if (key === "photo") {
      const [src, alt = ""] = value.split("|").map((x) => x.trim());
      if (src) scene.photo = { src, alt };
    }
  }
  return scene;
}

/* ── Figures ────────────────────────────────────────────────────────────── */

/** A person from the shoulders up. Two hair shapes, nothing else differs. */
function Figure({ x, hair, talking }: { x: number; hair: "short" | "long"; talking: boolean }) {
  const skin = "#E8C9A8";
  const ink = "#1E293B";
  const top = talking ? "var(--accent)" : "#64748B";
  return (
    <g transform={`translate(${x} 0)`}>
      {/* shoulders */}
      <path d="M-34 110 C-34 84 -18 72 0 72 C18 72 34 84 34 110 Z" fill={top} />
      {/* neck */}
      <rect x="-8" y="52" width="16" height="22" rx="4" fill={skin} />
      {/* hair behind the head */}
      {hair === "long" && <path d="M-24 44 C-26 14 26 14 24 44 L24 70 L-24 70 Z" fill={ink} />}
      {/* head */}
      <ellipse cx="0" cy="38" rx="20" ry="23" fill={skin} />
      {/* hair in front */}
      {hair === "long"
        ? <path d="M-20 34 C-18 12 18 12 20 34 C14 26 -14 26 -20 34 Z" fill={ink} />
        : <path d="M-20 34 C-20 10 20 10 20 34 C14 24 -14 24 -20 34 Z" fill={ink} />}
      {/* face */}
      <circle cx="-7" cy="40" r="1.8" fill={ink} />
      <circle cx="7" cy="40" r="1.8" fill={ink} />
      <path d={talking ? "M-5 50 Q0 54 5 50" : "M-5 50 Q0 52 5 50"} stroke={ink} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* speech marks when talking */}
      {talking && (
        <g stroke="var(--accent)" strokeWidth="1.8" fill="none" strokeLinecap="round">
          <path d="M28 30 q4 8 0 16" />
          <path d="M34 26 q7 12 0 24" />
        </g>
      )}
    </g>
  );
}

/** Lectern for talks; a notice board for announcements; a phone for calls. */
function Prop({ kind }: { kind: SceneKind }) {
  const ink = "#1E293B";
  if (kind === "talk" || kind === "lecture") {
    return (
      <g>
        <rect x="150" y="22" width="150" height="62" rx="4" fill="#fff" stroke={ink} strokeWidth="1.5" />
        {[36, 48, 60, 72].map((y) => <line key={y} x1="162" y1={y} x2={y === 72 ? 230 : 288} y2={y} stroke="#CBD5E1" strokeWidth="2" />)}
      </g>
    );
  }
  if (kind === "announcement") {
    return (
      <g transform="translate(236 30)">
        <path d="M0 14 L16 8 L16 32 L0 26 Z" fill={ink} />
        <path d="M16 10 L34 0 L34 40 L16 30 Z" fill="var(--accent)" />
        <path d="M38 12 q10 8 0 16 M44 6 q16 14 0 28" stroke={ink} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  return null;
}

export default function SpeakerCard({ scene, talking = false }: { scene: Scene; talking?: boolean }) {
  const n = Math.max(1, Math.min(3, scene.speakers.length));
  const xs = n === 1 ? [150] : n === 2 ? [96, 204] : [64, 150, 236];
  const speakers = scene.speakers.length ? scene.speakers : [{ role: "Speaker", gender: "f" as const }];
  return (
    <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="bg-[var(--accent-tint)]">
        <svg viewBox="0 0 300 118" className="block h-auto w-full" role="img" aria-label={speakers.map((s) => s.role).join(" and ")}>
          <Prop kind={scene.kind} />
          {speakers.slice(0, 3).map((s, i) => (
            <Figure key={i} x={xs[i]} hair={s.gender === "f" ? "long" : "short"} talking={talking && (n === 1 || i === 0)} />
          ))}
          <rect x="0" y="110" width="300" height="8" fill="#fff" opacity=".6" />
        </svg>
      </div>
      <figcaption className="px-4 py-3">
        <p className="text-[13.5px] font-bold leading-snug text-slate-900">
          {speakers.map((s) => s.role).join(" · ")}
        </p>
        {scene.setting && <p className="mt-0.5 text-[12.5px] leading-snug text-slate-500">{scene.setting}</p>}
      </figcaption>
    </figure>
  );
}
