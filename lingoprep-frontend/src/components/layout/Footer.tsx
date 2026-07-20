export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold gradient-text">LingoPrep</span>
            <span className="text-sm text-text-muted">
              © {new Date().getFullYear()}
            </span>
          </div>
          <p className="text-sm text-text-muted">
            AI-Powered IELTS & TOEFL Preparation — FYP Project
          </p>
        </div>
      </div>
    </footer>
  );
}
