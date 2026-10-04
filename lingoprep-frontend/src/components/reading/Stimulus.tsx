/**
 * What the candidate reads: an academic passage, or (TOEFL "Read in Daily
 * Life") a short everyday text shown as the thing it is: a notice, an email,
 * a message thread or a social post.
 *
 * Everyday texts are stored as plain text with a tag line, optional
 * "Key: value" header lines, a blank line, then the body:
 *
 *   [EMAIL]
 *   From: Dr. Elena Marsh
 *   Subject: Thursday's lab session moved
 *
 *   Dear students, …
 */

export type StimulusKind = "passage" | "notice" | "email" | "messages" | "post";

export interface ParsedStimulus {
  kind: StimulusKind;
  headers: Record<string, string>;
  body: string;
}

const TAGS: Record<string, StimulusKind> = {
  "[NOTICE]": "notice",
  "[EMAIL]": "email",
  "[MESSAGES]": "messages",
  "[POST]": "post",
};

export function parseStimulus(content: string): ParsedStimulus {
  const lines = content.split("\n");
  const kind = TAGS[lines[0]?.trim()];
  if (!kind) return { kind: "passage", headers: {}, body: content };

  const headers: Record<string, string> = {};
  let i = 1;
  for (; i < lines.length && lines[i].trim() !== ""; i++) {
    const at = lines[i].indexOf(":");
    if (at > 0) headers[lines[i].slice(0, at).trim().toLowerCase()] = lines[i].slice(at + 1).trim();
  }
  return { kind, headers, body: lines.slice(i + 1).join("\n").trim() };
}

/** Plain text of a stimulus, for the review screen. */
export function stimulusText(content: string): string {
  const s = parseStimulus(content);
  if (s.kind === "passage") return content;
  const head = Object.entries(s.headers).map(([k, v]) => `${k.charAt(0).toUpperCase()}${k.slice(1)}: ${v}`);
  return [...head, "", s.body].join("\n").trim();
}

const paragraphs = (text: string) => text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

/* ── Academic passage ───────────────────────────────────────────────────── */

function Passage({ body }: { body: string }) {
  return (
    <div className="space-y-5 text-[15.5px] leading-[1.85] text-slate-800">
      {paragraphs(body).map((p, i) => {
        // IELTS letters its paragraphs (A, B, C …) so that matching tasks
        // can refer to them.
        const m = /^([A-Z])\.\s+([\s\S]*)$/.exec(p);
        return m ? (
          <p key={i} className="flex gap-3">
            <span className="w-4 shrink-0 font-bold text-slate-900">{m[1]}</span>
            <span>{m[2]}</span>
          </p>
        ) : (
          <p key={i}>{p}</p>
        );
      })}
    </div>
  );
}

/* ── Everyday texts ─────────────────────────────────────────────────────── */

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto max-w-[560px] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-[0_1px_2px_rgb(18_23_43/0.05)]">
    {children}
  </div>
);

const Body = ({ text }: { text: string }) => (
  <div className="space-y-3.5 text-[15px] leading-[1.75] text-slate-800">
    {paragraphs(text).map((p, i) => (
      <p key={i} className="whitespace-pre-line">{p}</p>
    ))}
  </div>
);

function Notice({ headers, body }: ParsedStimulus) {
  return (
    <Shell>
      <div className="border-b border-slate-300 bg-slate-100 px-5 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-500">Notice</p>
        {headers.title && <p className="mt-0.5 text-[16.5px] font-bold leading-snug text-slate-900">{headers.title}</p>}
      </div>
      <div className="px-5 py-4"><Body text={body} /></div>
    </Shell>
  );
}

function Email({ headers, body }: ParsedStimulus) {
  const rows: [string, string | undefined][] = [["From", headers.from], ["To", headers.to], ["Subject", headers.subject]];
  return (
    <Shell>
      <dl className="border-b border-slate-300 bg-slate-50 px-5 py-3 text-[13.5px]">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="flex gap-3 py-0.5">
            <dt className="w-[62px] shrink-0 font-bold text-slate-500">{k}</dt>
            <dd className={k === "Subject" ? "font-bold text-slate-900" : "text-slate-800"}>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="px-5 py-4"><Body text={body} /></div>
    </Shell>
  );
}

function Messages({ headers, body }: ParsedStimulus) {
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const at = l.indexOf(":");
    return at > 0 ? { who: l.slice(0, at).trim(), text: l.slice(at + 1).trim() } : { who: "", text: l };
  });
  const first = lines[0]?.who;
  return (
    <Shell>
      {headers.title && (
        <p className="border-b border-slate-300 bg-slate-50 px-5 py-2.5 text-center text-[13.5px] font-bold text-slate-900">{headers.title}</p>
      )}
      <ul className="flex flex-col gap-2.5 px-4 py-4">
        {lines.map((l, i) => {
          const mine = l.who !== first;
          const showName = l.who && lines[i - 1]?.who !== l.who;
          return (
            <li key={i} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              {showName && <span className="mb-0.5 px-1 text-[11.5px] font-bold text-slate-500">{l.who}</span>}
              <span
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[14.5px] leading-snug ${
                  mine ? "rounded-br-md bg-[var(--accent-tint)] text-slate-900" : "rounded-bl-md bg-slate-100 text-slate-900"
                }`}
              >
                {l.text}
              </span>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}

function Post({ headers, body }: ParsedStimulus) {
  const from = headers.from || "";
  const initials = from.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <Shell>
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[13px] font-bold text-white" aria-hidden="true">
          {initials}
        </span>
        <span className="text-[14.5px] font-bold leading-tight text-slate-900">{from}</span>
      </div>
      <div className="px-5 py-4"><Body text={body} /></div>
    </Shell>
  );
}

export default function Stimulus({ content }: { content: string }) {
  const s = parseStimulus(content);
  switch (s.kind) {
    case "notice": return <Notice {...s} />;
    case "email": return <Email {...s} />;
    case "messages": return <Messages {...s} />;
    case "post": return <Post {...s} />;
    default: return <Passage body={s.body} />;
  }
}
