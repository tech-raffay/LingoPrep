/**
 * Line drawings for IELTS "diagram label completion" tasks.
 *
 * In the real exam the only visuals in the Reading paper belong to the
 * questions: a plain black-and-white diagram with some labels printed and
 * the others left as numbered gaps. These follow that style. The numbered
 * markers take the exam accent; everything else is neutral ink.
 */

const INK = "#1E293B";
const SOFT = "#64748B";
const FILL = "#F1F5F9";

function Marker({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <rect x={x - 16} y={y - 12} width={32} height={24} rx={5} fill="var(--accent)" />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">
        {n}
      </text>
    </g>
  );
}

function Leader({ d }: { d: string }) {
  return <path d={d} stroke={SOFT} strokeWidth="1" fill="none" />;
}

function Given({ x, y, children, anchor = "middle" }: { x: number; y: number; children: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize="13" fontWeight="500" fill={INK}>
      {children}
    </text>
  );
}

/** A Morse telegraph line: battery and key at the sending station (top);
 *  electromagnet, armature, stylus and paper tape at the receiving station
 *  (bottom). The stations are stacked so the drawing stays legible in a
 *  narrow column and on a phone. `numbers` are the four question numbers,
 *  in order: key, electromagnet, armature, paper tape. */
function MorseTelegraph({ numbers }: { numbers: number[] }) {
  const [nKey, nMagnet, nArmature, nTape] = numbers;
  return (
    <svg viewBox="0 0 340 476" role="img" aria-label="Diagram of a Morse telegraph line with four numbered gaps" className="mx-auto block h-auto w-full max-w-[400px]">
      <text x="170" y="20" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="1.5" fill={SOFT}>SENDING STATION</text>
      <text x="170" y="258" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="1.5" fill={SOFT}>RECEIVING STATION</text>

      {/* ── line wire: key, down the left side, into the coils ── */}
      <path d="M264 156 V200 H214" stroke={INK} strokeWidth="1.5" fill="none" />
      <path d="M214 200 H120" stroke={INK} strokeWidth="1.5" strokeDasharray="6 5" fill="none" />
      <path d="M120 200 H10 V462 H85 V446" stroke={INK} strokeWidth="1.5" fill="none" />
      <Given x={167} y={219}>line wire</Given>

      {/* ══ sending station ══ */}
      <g transform="translate(20 -88)">
        <rect x="24" y="236" width="252" height="8" rx="2" fill={FILL} stroke={INK} strokeWidth="1.5" />

        {/* battery */}
        <rect x="40" y="178" width="56" height="58" rx="4" fill="#fff" stroke={INK} strokeWidth="1.8" />
        <rect x="50" y="170" width="10" height="8" fill={INK} />
        <rect x="76" y="170" width="10" height="8" fill={INK} />
        <text x="55" y="200" textAnchor="middle" fontSize="13" fontWeight="700" fill={INK}>−</text>
        <text x="81" y="200" textAnchor="middle" fontSize="13" fontWeight="700" fill={INK}>+</text>
        <Given x={68} y={266}>battery</Given>

        {/* battery to key */}
        <path d="M81 170 V150 H180 V198" stroke={INK} strokeWidth="1.5" fill="none" />

        {/* key */}
        <rect x="150" y="224" width="104" height="12" rx="2" fill={FILL} stroke={INK} strokeWidth="1.5" />
        <rect x="176" y="198" width="8" height="26" fill={INK} />
        <path d="M158 208 l-4 3 l8 3 l-8 3 l8 3 l-4 3" stroke={INK} strokeWidth="1.3" fill="none" />
        <line x1="150" y1="206" x2="250" y2="194" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <circle cx="244" cy="187" r="8" fill={INK} />
        <rect x="239" y="214" width="10" height="10" fill={INK} />
        <Leader d="M244 177 V152" />
        <Marker x={244} y={140} n={nKey} />
      </g>

      {/* ══ receiving station ══ */}
      <g transform="translate(-366 202)">
        <rect x="400" y="236" width="290" height="8" rx="2" fill={FILL} stroke={INK} strokeWidth="1.5" />

        {/* electromagnet (two coils) */}
        {[436, 472].map((x) => (
          <g key={x}>
            <rect x={x} y="194" width="30" height="42" rx="3" fill="#fff" stroke={INK} strokeWidth="1.8" />
            {[201, 208, 215, 222, 229].map((y) => (
              <line key={y} x1={x + 2} y1={y} x2={x + 28} y2={y} stroke={INK} strokeWidth="1" />
            ))}
          </g>
        ))}
        <Leader d="M436 210 H420" />
        <Marker x={403} y={210} n={nMagnet} />

        {/* armature on its pivot */}
        <rect x="546" y="178" width="8" height="58" fill={INK} />
        <line x1="430" y1="184" x2="632" y2="172" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <circle cx="550" cy="177" r="5" fill="#fff" stroke={INK} strokeWidth="1.8" />
        <Leader d="M486 178 V152" />
        <Marker x={486} y={140} n={nArmature} />

        {/* stylus */}
        <path d="M622 170 L634 169 L628 148 Z" fill={INK} />
        <Leader d="M633 160 L646 180" />
        <Given x={650} y={196} anchor="start">stylus</Given>

        {/* paper tape and its drive */}
        <rect x="520" y="130" width="170" height="12" fill="#fff" stroke={INK} strokeWidth="1.5" />
        {[536, 548, 566].map((x) => <circle key={x} cx={x} cy="136" r="1.8" fill={INK} />)}
        <rect x="553" y="134.5" width="8" height="3" fill={INK} />
        <rect x="574" y="134.5" width="8" height="3" fill={INK} />
        <circle cx="672" cy="121" r="8" fill={FILL} stroke={INK} strokeWidth="1.5" />
        <circle cx="672" cy="151" r="8" fill={FILL} stroke={INK} strokeWidth="1.5" />
        <path d="M696 136 l-8 -4 v8 z" fill={INK} />
        <Leader d="M668 113 L650 92" />
        <Given x={690} y={84} anchor="end">clockwork motor</Given>
        <Leader d="M545 130 V104" />
        <Marker x={545} y={92} n={nTape} />
      </g>
    </svg>
  );
}

/** A lettered marker on a plan, for "write the correct letter, A–H". */
function Letter({ x, y, l }: { x: number; y: number; l: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={12} fill="#fff" stroke={INK} strokeWidth="1.6" />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={INK}>{l}</text>
    </g>
  );
}

function Room({ x, y, w, h, label, letter }: { x: number; y: number; w: number; h: number; label?: string; letter?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#fff" stroke={INK} strokeWidth="1.6" />
      {label && (
        <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill={INK}>{label}</text>
      )}
      {letter && <Letter x={x + w / 2} y={y + h / 2} l={letter} />}
    </g>
  );
}

/** Ground floor of a museum: the entrance at the bottom, a central hall,
 *  rooms down both sides and the stairs at the far end. Eight lettered
 *  rooms; the recording names five of them. */
function MuseumPlan() {
  return (
    <svg viewBox="0 0 440 372" role="img" aria-label="Floor plan of a museum with rooms lettered A to H" className="mx-auto block h-auto w-full max-w-[460px]">
      {/* outer wall */}
      <rect x="20" y="20" width="400" height="320" fill={FILL} stroke={INK} strokeWidth="2" />

      {/* main hall */}
      <rect x="150" y="70" width="140" height="200" fill="#fff" stroke={INK} strokeWidth="1" strokeDasharray="3 4" />
      <text x="220" y="165" textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="1.5" fill={SOFT}>MAIN HALL</text>

      {/* left side, front to back */}
      <Room x={20} y={260} w={130} h={80} letter="A" />
      <Room x={20} y={190} w={130} h={70} letter="B" />
      <Room x={20} y={120} w={130} h={70} letter="D" />
      <Room x={20} y={20} w={130} h={100} letter="C" />

      {/* right side, front to back */}
      <Room x={290} y={270} w={130} h={70} label="Toilets" />
      <Room x={290} y={160} w={130} h={110} letter="F" />
      <Room x={290} y={20} w={130} h={140} letter="G" />

      {/* beside the entrance */}
      <Room x={150} y={270} w={40} h={70} letter="E" />
      <Room x={250} y={270} w={40} h={70} letter="H" />

      {/* stairs and lift at the back of the hall */}
      <rect x="185" y="20" width="60" height="50" fill="#fff" stroke={INK} strokeWidth="1.6" />
      {[30, 38, 46, 54, 62].map((y) => <line key={y} x1="185" y1={y} x2="245" y2={y} stroke={INK} strokeWidth="1" />)}
      <text x="215" y="84" textAnchor="middle" fontSize="11" fontWeight="600" fill={INK}>Stairs</text>
      <rect x="250" y="25" width="30" height="40" fill="#fff" stroke={INK} strokeWidth="1.6" />
      <text x="265" y="49" textAnchor="middle" fontSize="10" fontWeight="600" fill={INK}>Lift</text>

      {/* information desk, just inside the entrance */}
      <rect x="192" y="282" width="56" height="18" rx="2" fill={INK} />
      <text x="220" y="316" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={INK}>Info desk</text>

      {/* entrance */}
      <rect x="195" y="333" width="50" height="14" fill="#fff" />
      <path d="M220 366 V342" stroke={INK} strokeWidth="1.6" fill="none" />
      <path d="M214 348 L220 341 L226 348" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="310" y="362" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="1" fill={SOFT}>MAIN ENTRANCE</text>
    </svg>
  );
}

const DIAGRAMS: Record<string, (props: { numbers: number[] }) => React.ReactElement> = {
  "morse-telegraph": MorseTelegraph,
  "museum-plan": MuseumPlan,
};

export function hasDiagram(key?: string): boolean {
  return !!key && key in DIAGRAMS;
}

export function ReadingDiagram({ diagram, numbers }: { diagram: string; numbers: number[] }) {
  const Drawing = DIAGRAMS[diagram];
  return Drawing ? <Drawing numbers={numbers} /> : null;
}
