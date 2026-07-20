import Link from "next/link";

const modules = [
  {
    title: "IELTS Reading",
    subtitle: "Computer-based practice",
    description: "Academic reading passages with timed comprehension questions.",
    href: "/reading",
    tag: "Computer",
  },
  {
    title: "IELTS Writing",
    subtitle: "Task 1 & Task 2",
    description: "Essay prompts with AI-powered band score evaluation.",
    href: "/writing",
    tag: "Computer",
  },
  {
    title: "IELTS Listening",
    subtitle: "Audio comprehension",
    description: "Listen to recordings and answer section-based questions.",
    href: "/listening",
    tag: "Computer",
  },
  {
    title: "IELTS Speaking",
    subtitle: "Parts 1, 2 & 3",
    description: "Record responses and receive pronunciation feedback.",
    href: "/speaking",
    tag: "Computer",
  },
];

/* Simple SVG icons matching the IDP test card style */
function MonitorIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c8102e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-white border-b border-[#e0e0e0]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h1 className="text-[32px] sm:text-[40px] font-bold text-[#1a1a1a] leading-tight mb-4">
            IELTS Practice tests
          </h1>
          <p className="text-[16px] text-[#666] max-w-xl mx-auto leading-relaxed mb-8">
            Prepare for your IELTS test with free practice tests and AI-powered scoring. Familiarise yourself with the test format.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/reading"
              className="px-6 py-2.5 bg-[#c8102e] text-white font-semibold rounded-full hover:bg-[#a50d24] transition-colors text-[14px]"
            >
              Access now
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 border border-[#ddd] text-[#333] font-semibold rounded-full hover:bg-[#fafafa] transition-colors text-[14px]"
            >
              View results
            </Link>
          </div>
        </div>
      </section>

      {/* Filter bar — decorative, matches IDP UI */}
      <div className="bg-white border-b border-[#e0e0e0]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-3">
          {["Material types", "Topic", "Test type", "Test skill", "Band score"].map((f) => (
            <span key={f} className="px-3 py-1.5 border border-[#ddd] rounded-full text-[13px] text-[#555] font-medium cursor-default">
              {f}
              <svg className="inline-block ml-1 w-3 h-3 text-[#999]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          ))}
        </div>
      </div>

      {/* Practice test cards — matches IDP layout exactly */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[22px] font-bold text-[#1a1a1a] flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c8102e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              IELTS Practice tests
            </h2>
            <Link href="/dashboard" className="text-[13px] font-semibold text-[#333] border border-[#ddd] px-4 py-1.5 rounded-full hover:bg-[#fafafa] transition-colors">
              View more
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {modules.map((mod) => (
              <div
                key={mod.title}
                className="bg-white border border-[#e0e0e0] rounded-lg p-5 flex flex-col"
              >
                {/* Icon + Tag */}
                <div className="flex items-start justify-between mb-4">
                  <MonitorIcon />
                  <span className="text-[11px] font-bold bg-[#1a1a1a] text-white px-2 py-0.5 rounded">
                    {mod.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-bold text-[#1a1a1a] leading-snug mb-1">
                  {mod.title}
                </h3>
                <p className="text-[13px] text-[#999] mb-auto">{mod.subtitle}</p>

                {/* Actions */}
                <div className="mt-5 space-y-2">
                  <Link
                    href={mod.href}
                    className="block text-center py-2 bg-[#c8102e] text-white font-semibold text-[13px] rounded-full hover:bg-[#a50d24] transition-colors"
                  >
                    Access now
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block text-center py-2 border border-[#ddd] text-[#333] font-semibold text-[13px] rounded-full hover:bg-[#fafafa] transition-colors"
                  >
                    View answers
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="bg-white border-t border-[#e0e0e0] py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <CheckCircleIcon />
              <h3 className="font-bold text-[15px] text-[#1a1a1a] mt-3 mb-1">AI-Powered Scoring</h3>
              <p className="text-[13px] text-[#666] leading-relaxed">Get instant band scores and detailed feedback on your writing and speaking responses.</p>
            </div>
            <div>
              <CheckCircleIcon />
              <h3 className="font-bold text-[15px] text-[#1a1a1a] mt-3 mb-1">Computer-Based Format</h3>
              <p className="text-[13px] text-[#666] leading-relaxed">Practice in the same format used in the actual IELTS computer-delivered test.</p>
            </div>
            <div>
              <CheckCircleIcon />
              <h3 className="font-bold text-[15px] text-[#1a1a1a] mt-3 mb-1">Track Your Progress</h3>
              <p className="text-[13px] text-[#666] leading-relaxed">Review past scores and monitor improvement across all four test modules.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
