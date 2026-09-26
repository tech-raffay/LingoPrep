"use client";

import React from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   PassageVisuals: Authentic Scientific & Demographic Figures for IELTS Reading
   Includes real SVG technical diagrams, line graphs, and comparative charts.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Figure 1 for Passage 1: Cooke & Wheatstone 5-Needle Telegraph & Transmission Speed Chart */
export function TelegraphFigure() {
  return (
    <figure className="my-6 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-4">
        <div>
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
            Figure 1
          </span>
          <h4 className="text-[13.5px] font-bold text-slate-800 mt-1">
            Cooke &amp; Wheatstone Galvanometer Dial &amp; Transatlantic Transmission Speeds (1858–1870)
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Diamond 5-Needle Galvanometer Dial SVG */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 flex flex-col items-center">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Five-Needle Telegraph Indicator (1837)
          </p>
          <svg viewBox="0 0 280 220" className="w-full max-w-[240px] h-auto text-slate-700 select-none">
            {/* Diamond Frame */}
            <polygon
              points="140,10 270,110 140,210 10,110"
              fill="#ffffff"
              stroke="#475569"
              strokeWidth="2.5"
            />
            <polygon
              points="140,20 255,110 140,200 25,110"
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* Letter Grid Hatch lines */}
            <line x1="70" y1="60" x2="210" y2="160" stroke="#94a3b8" strokeWidth="1" />
            <line x1="210" y1="60" x2="70" y2="160" stroke="#94a3b8" strokeWidth="1" />
            <line x1="105" y1="35" x2="175" y2="185" stroke="#94a3b8" strokeWidth="1" />
            <line x1="175" y1="35" x2="105" y2="185" stroke="#94a3b8" strokeWidth="1" />

            {/* Five Needles (Pivots at y=110) */}
            {/* Needle 1 */}
            <line x1="50" y1="110" x2="65" y2="70" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="110" r="4" fill="#0f172a" />
            {/* Needle 2 */}
            <line x1="95" y1="110" x2="95" y2="55" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            <circle cx="95" cy="110" r="4" fill="#0f172a" />
            {/* Needle 3 (Central - Deflected) */}
            <line x1="140" y1="110" x2="160" y2="55" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="140" cy="110" r="4.5" fill="#047857" />
            {/* Needle 4 */}
            <line x1="185" y1="110" x2="175" y2="60" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            <circle cx="185" cy="110" r="4" fill="#0f172a" />
            {/* Needle 5 */}
            <line x1="230" y1="110" x2="215" y2="75" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            <circle cx="230" cy="110" r="4" fill="#0f172a" />

            {/* Letter annotations */}
            <text x="140" y="32" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">E</text>
            <text x="100" y="48" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">A</text>
            <text x="180" y="48" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">H</text>
            <text x="65" y="75" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">B</text>
            <text x="215" y="75" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">K</text>
            <text x="140" y="190" textAnchor="middle" fontSize="9" fontWeight="600" fill="#64748b">Convergence = Selected Letter</text>
          </svg>
        </div>

        {/* Transmission Speed Bar Graph */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 flex flex-col justify-between">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Transmission Rate (Words / Minute)
          </p>

          <div className="space-y-3 my-auto py-1">
            {/* 1858 Cable */}
            <div>
              <div className="flex justify-between text-[11.5px] font-semibold text-slate-700 mb-1">
                <span>1858 Cable (Failed after 3 weeks)</span>
                <span className="font-extrabold text-amber-700">0.1 wpm</span>
              </div>
              <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "4%" }} />
              </div>
            </div>

            {/* 1866 Great Eastern Cable */}
            <div>
              <div className="flex justify-between text-[11.5px] font-semibold text-slate-700 mb-1">
                <span>1866 Cable (Great Eastern expedition)</span>
                <span className="font-extrabold text-teal-700">8.0 wpm</span>
              </div>
              <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: "44%" }} />
              </div>
            </div>

            {/* 1870 Duplex Telegraphy */}
            <div>
              <div className="flex justify-between text-[11.5px] font-semibold text-slate-700 mb-1">
                <span>1870 Standard (Duplex circuitry)</span>
                <span className="font-extrabold text-emerald-800">18.0 wpm</span>
              </div>
              <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-2 italic text-right">
            Historical telegraphy performance metrics
          </p>
        </div>
      </div>

      <figcaption className="mt-3 text-[11.5px] text-slate-500 leading-normal border-t border-slate-100 pt-2 text-center sm:text-left">
        <strong>Figure 1:</strong> Visual principles of Cooke and Wheatstone&rsquo;s 1837 multi-needle dial telegraph (left) alongside transatlantic operational transmission speeds in words per minute (right).
      </figcaption>
    </figure>
  );
}

/** Figure 1 for Passage 2: Ocean Depth Zonation and Sunlight Attenuation Graph */
export function BioluminescenceFigure() {
  return (
    <figure className="my-6 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
        <div>
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200/60">
            Figure 1
          </span>
          <h4 className="text-[13.5px] font-bold text-slate-800 mt-1">
            Ocean Depth Zonation &amp; Sunlight Attenuation vs. Bioluminescence Prevalence
          </h4>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox="0 0 540 230" className="w-full min-w-[460px] h-auto select-none rounded-xl">
          {/* Depth gradient background */}
          <defs>
            <linearGradient id="oceanDepthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
              <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#082f49" />
            </linearGradient>
            <linearGradient id="sunlightBeam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Ocean Water Body */}
          <rect x="70" y="10" width="460" height="195" rx="8" fill="url(#oceanDepthGrad)" />

          {/* Sunlight cone */}
          <polygon points="120,10 240,10 180,65" fill="url(#sunlightBeam)" />

          {/* Depth Zone Divider lines */}
          <line x1="70" y1="65" x2="530" y2="65" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.6" />
          <line x1="70" y1="145" x2="530" y2="145" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.4" />

          {/* Depth Axis on Left */}
          <line x1="68" y1="10" x2="68" y2="205" stroke="#64748b" strokeWidth="2" />
          <text x="60" y="15" textAnchor="end" fontSize="10" fontWeight="bold" fill="#334155">0 m (Surface)</text>
          <text x="60" y="68" textAnchor="end" fontSize="10" fontWeight="bold" fill="#0284c7">200 m</text>
          <text x="60" y="148" textAnchor="end" fontSize="10" fontWeight="bold" fill="#0369a1">1,000 m</text>
          <text x="60" y="200" textAnchor="end" fontSize="10" fontWeight="bold" fill="#0f172a">&gt; 1,000 m</text>

          {/* Zone Labels */}
          {/* Epipelagic */}
          <text x="85" y="32" fontSize="11" fontWeight="extrabold" fill="#0369a1">EPIPELAGIC ZONE (Sunlight Zone)</text>
          <text x="85" y="48" fontSize="9.5" fill="#0c4a6e">Photosynthesis active &bull; Red/Yellow light rapidly absorbed in top 20m</text>

          {/* Mesopelagic */}
          <text x="85" y="85" fontSize="11" fontWeight="extrabold" fill="#ffffff">MESOPELAGIC ZONE (Twilight Zone: 200m – 1,000m)</text>
          <text x="85" y="102" fontSize="9.5" fill="#e0f2fe">Faint blue-green downwelling light &bull; Counterillumination active (Hatchetfish)</text>
          
          {/* 76% Callout pill */}
          <rect x="85" y="112" width="280" height="22" rx="11" fill="#0284c7" opacity="0.85" />
          <text x="95" y="127" fontSize="10" fontWeight="bold" fill="#ffffff">
            &#9733; 76% of all deep-sea organisms emit bioluminescence
          </text>

          {/* Bathypelagic */}
          <text x="85" y="165" fontSize="11" fontWeight="extrabold" fill="#93c5fd">BATHYPELAGIC ZONE (Midnight Zone: &gt; 1,000m)</text>
          <text x="85" y="182" fontSize="9.5" fill="#cbd5e1">Perpetual darkness &bull; Anglerfish lure &bull; Deep-sea dragonfish red illumination</text>

          {/* Wavelength attenuation curve on right */}
          <path
            d="M 450,10 Q 480,40 515,65"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
          />
          <text x="520" y="40" fontSize="8.5" fontWeight="bold" fill="#ef4444">Red Light (absorbed &lt; 20m)</text>

          <path
            d="M 470,10 Q 500,80 500,140"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2.5"
          />
          <text x="495" y="105" fontSize="8.5" fontWeight="bold" fill="#22c55e">Blue-Green (470nm)</text>
        </svg>
      </div>

      <figcaption className="mt-3 text-[11.5px] text-slate-500 leading-normal border-t border-slate-100 pt-2 text-center sm:text-left">
        <strong>Figure 1:</strong> Depth stratification of ocean layers, showing rapid solar wavelength absorption and the zone of maximum bioluminescent creature concentration (76% in the twilight zone).
      </figcaption>
    </figure>
  );
}

/** Figure 1 for Passage 3: World Urban vs Rural Population Projection Line Chart (1950–2050) */
export function UrbanPlanningFigure() {
  return (
    <figure className="my-6 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
        <div>
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
            Figure 1
          </span>
          <h4 className="text-[13.5px] font-bold text-slate-800 mt-1">
            Global Urban vs. Rural Population Share &amp; 2050 Projection (%)
          </h4>
        </div>
        <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">
          UN World Urbanization Prospects
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox="0 0 540 220" className="w-full min-w-[460px] h-auto select-none rounded-xl bg-slate-50/70 p-2">
          {/* Chart Grid Lines */}
          <line x1="50" y1="20" x2="510" y2="20" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="50" y1="55" x2="510" y2="55" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="50" y1="90" x2="510" y2="90" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="50" y1="125" x2="510" y2="125" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="50" y1="160" x2="510" y2="160" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="50" y1="180" x2="510" y2="180" stroke="#64748b" strokeWidth="1.5" />

          {/* Y Axis percentage markers */}
          <text x="42" y="24" textAnchor="end" fontSize="9.5" fontWeight="600" fill="#64748b">100%</text>
          <text x="42" y="59" textAnchor="end" fontSize="9.5" fontWeight="600" fill="#64748b">75%</text>
          <text x="42" y="94" textAnchor="end" fontSize="9.5" fontWeight="bold" fill="#0f172a">50%</text>
          <text x="42" y="129" textAnchor="end" fontSize="9.5" fontWeight="600" fill="#64748b">25%</text>
          <text x="42" y="164" textAnchor="end" fontSize="9.5" fontWeight="600" fill="#64748b">10%</text>
          <text x="42" y="184" textAnchor="end" fontSize="9.5" fontWeight="600" fill="#64748b">0%</text>

          {/* X Axis years: 1950, 1975, 2000, 2008, 2026, 2050 */}
          {/* Coordinates:
              1950: x=70
              1975: x=160
              2000: x=250
              2008: x=290 (50% crossover)
              2026: x=390
              2050: x=480
          */}
          <text x="70" y="196" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#475569">1950</text>
          <text x="160" y="196" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#475569">1975</text>
          <text x="250" y="196" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#475569">2000</text>
          <text x="290" y="196" textAnchor="middle" fontSize="9.5" fontWeight="extrabold" fill="#047857">2008</text>
          <text x="390" y="196" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#475569">2026</text>
          <text x="480" y="196" textAnchor="middle" fontSize="9.5" fontWeight="extrabold" fill="#4338ca">2050 (Proj.)</text>

          {/* 50% Crossover Vertical Guide */}
          <line x1="290" y1="20" x2="290" y2="180" stroke="#047857" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
          <circle cx="290" cy="90" r="5" fill="#047857" />
          <text x="295" y="82" fontSize="9" fontWeight="bold" fill="#047857">2008 Crossover (50/50)</text>

          {/* Rural Curve: 70% in 1950 -> 63% in 1975 -> 53% in 2000 -> 50% in 2008 -> 43% in 2026 -> 32% in 2050 */}
          {/* Y positions:
              70%: y = 180 - (0.70 * 160) = 68
              63%: y = 180 - (0.63 * 160) = 79
              53%: y = 180 - (0.53 * 160) = 95
              50%: y = 90
              43%: y = 180 - (0.43 * 160) = 111
              32%: y = 180 - (0.32 * 160) = 129
          */}
          <path
            d="M 70,68 L 160,79 L 250,95 L 290,90 L 390,111 L 480,129"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Urban Curve: 30% in 1950 -> 37% in 1975 -> 47% in 2000 -> 50% in 2008 -> 57% in 2026 -> 68% in 2050 */}
          {/* Y positions:
              30%: y = 180 - (0.30 * 160) = 132
              37%: y = 180 - (0.37 * 160) = 121
              47%: y = 180 - (0.47 * 160) = 105
              50%: y = 90
              57%: y = 180 - (0.57 * 160) = 89
              68%: y = 180 - (0.68 * 160) = 71
          */}
          <path
            d="M 70,132 L 160,121 L 250,105 L 290,90 L 390,89 L 480,71"
            fill="none"
            stroke="#4338ca"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Points on Urban Curve */}
          <circle cx="70" cy="132" r="3.5" fill="#4338ca" />
          <circle cx="160" cy="121" r="3.5" fill="#4338ca" />
          <circle cx="250" cy="105" r="3.5" fill="#4338ca" />
          <circle cx="390" cy="89" r="3.5" fill="#4338ca" />
          <circle cx="480" cy="71" r="5" fill="#4338ca" />

          {/* 68% Badge */}
          <rect x="420" y="44" width="95" height="22" rx="6" fill="#4338ca" />
          <text x="467" y="59" textAnchor="middle" fontSize="10.5" fontWeight="extrabold" fill="#ffffff">
            68% by 2050
          </text>

          {/* Legend */}
          <g transform="translate(180, 205)">
            <rect x="0" y="0" width="12" height="3" fill="#4338ca" rx="1.5" />
            <text x="18" y="4" fontSize="9.5" fontWeight="bold" fill="#4338ca">Urban Population %</text>
            <rect x="140" y="0" width="12" height="3" fill="#94a3b8" rx="1.5" />
            <text x="158" y="4" fontSize="9.5" fontWeight="bold" fill="#64748b">Rural Population %</text>
          </g>
        </svg>
      </div>

      <figcaption className="mt-3 text-[11.5px] text-slate-500 leading-normal border-t border-slate-100 pt-2 text-center sm:text-left">
        <strong>Figure 1:</strong> Historic and projected balance between global urban and rural populations, highlighting the 2008 majority inflection point and the projected 68% urban share cited in the text.
      </figcaption>
    </figure>
  );
}
