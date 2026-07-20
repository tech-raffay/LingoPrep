import Link from "next/link";

const modules = [
  {
    title: "Reading",
    description:
      "Practice with IELTS & TOEFL reading passages. Answer MCQs and get instant scoring with detailed explanations.",
    icon: "📖",
    href: "/reading",
    gradient: "from-indigo-500 to-purple-600",
    shadowColor: "shadow-indigo-500/20",
  },
  {
    title: "Listening",
    description:
      "Listen to academic audio clips and answer comprehension questions. Simulates the real exam experience.",
    icon: "🎧",
    href: "/listening",
    gradient: "from-cyan-500 to-blue-600",
    shadowColor: "shadow-cyan-500/20",
  },
  {
    title: "Writing",
    description:
      "Submit essays and receive AI-powered evaluation. Get band scores, feedback, and improvement suggestions.",
    icon: "✍️",
    href: "/writing",
    gradient: "from-amber-500 to-orange-600",
    shadowColor: "shadow-amber-500/20",
  },
];

const stats = [
  { value: "3", label: "Practice Modules" },
  { value: "AI", label: "Powered by Llama 3" },
  { value: "24/7", label: "Available Anytime" },
  { value: "Free", label: "Open Source" },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-subtle-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-subtle-pulse [animation-delay:1.5s]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">
                AI-Powered English Proficiency Evaluator
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              Master Your
              <span className="block gradient-text">IELTS & TOEFL</span>
              With AI Precision
            </h1>

            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-text-muted leading-relaxed mb-10">
              Practice reading, listening, and writing with our intelligent evaluation engine.
              Get instant band scores, detailed feedback, and personalized improvement strategies
              — all powered by Llama 3 AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all duration-200 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                Start Practicing Free →
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 border border-border font-semibold rounded-2xl hover:bg-surface-hover transition-all duration-200"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Practice Every Module
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Comprehensive preparation covering all major sections of IELTS and TOEFL exams.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {modules.map((mod) => (
              <Link
                key={mod.title}
                href={mod.href}
                className={`group relative overflow-hidden rounded-3xl border border-border bg-surface p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${mod.shadowColor}`}
              >
                {/* Gradient accent bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${mod.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                />

                <div className="text-5xl mb-6 transform transition-transform group-hover:scale-110">
                  {mod.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{mod.title}</h3>
                <p className="text-text-muted leading-relaxed">{mod.description}</p>

                <div className="mt-6 flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                  Start Practice
                  <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-12 sm:p-16 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Ace Your Exam?
              </h2>
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
                Join LingoPrep today and start your journey to English proficiency.
                No credit card required.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-8 py-3.5 bg-white text-primary font-semibold rounded-2xl hover:bg-white/90 transition-all shadow-xl hover:-translate-y-0.5"
              >
                Get Started — It&apos;s Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
