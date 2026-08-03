"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

const STORAGE_KEY = "lingoprep_exam";

const moduleLinks: Array<{ path: string; label: string }> = [];

const examColors: Record<string, { color: string; bg: string }> = {
  ielts: { color: "#c8102e", bg: "#fef2f2" },
  toefl: { color: "#0057b8", bg: "#eff6ff" },
};

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [activeExam, setActiveExam] = useState<string | null>(null);

  // Determine active exam from URL param or localStorage
  useEffect(() => {
    const urlExam = searchParams.get("exam");
    if (urlExam === "ielts" || urlExam === "toefl") {
      setActiveExam(urlExam);
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "ielts" || stored === "toefl") {
        setActiveExam(stored);
      } else {
        setActiveExam(null);
      }
    }
  }, [searchParams]);

  // Build nav links with exam param preserved
  const navLinks = moduleLinks.map((link) => {
    const href =
      link.path === "/dashboard"
        ? (activeExam ? `${link.path}?exam=${activeExam}` : link.path)
        : activeExam
        ? `${link.path}?exam=${activeExam}`
        : link.path;
    return { href, label: link.label, path: link.path };
  });

  const accentColor = activeExam ? examColors[activeExam]?.color : "#c8102e";

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#e0e0e0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo + Exam Badge */}
          <div className="flex items-center gap-3">
            <Link href={activeExam ? `/?exam=${activeExam}` : "/"} className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="text-lg font-bold tracking-tight" style={{ color: accentColor }}>LingoPrep</span>
            </Link>
            {activeExam && pathname !== "/" && (
              <span
                className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{
                  color: examColors[activeExam].color,
                  backgroundColor: examColors[activeExam].bg,
                }}
              >
                {activeExam}
              </span>
            )}
          </div>

          {/* Desktop Nav (empty center) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.href}
                  className={`px-3 py-1.5 text-[14px] font-semibold transition-colors ${
                    isActive
                      ? `border-b-2`
                      : "text-[#333] hover:opacity-70"
                  }`}
                  style={
                    isActive
                      ? { color: accentColor, borderBottomColor: accentColor }
                      : undefined
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              href={activeExam ? `/dashboard?exam=${activeExam}` : "/dashboard"}
              className={`text-[13px] font-semibold transition-colors ${
                pathname === "/dashboard"
                  ? ""
                  : "text-[#333] hover:opacity-70"
              }`}
              style={pathname === "/dashboard" ? { color: accentColor } : undefined}
            >
              View your results
            </Link>

            {user ? (
              <>
                <span className="text-[13px] text-[#666] font-medium max-w-[150px] truncate">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-[13px] font-semibold text-[#333] hover:opacity-70 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-[13px] font-semibold text-[#333] hover:opacity-70 flex items-center gap-1.5 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-[13px] font-semibold text-white px-4 py-2 rounded-full transition-colors"
                  style={{ backgroundColor: accentColor }}
                >
                  Book your test
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#333]"
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-[#eee] mt-1 pt-3 space-y-1">
            {activeExam && (
              <div className="px-4 pb-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{
                    color: examColors[activeExam].color,
                    backgroundColor: examColors[activeExam].bg,
                  }}
                >
                  {activeExam}
                </span>
              </div>
            )}
            <Link
              href={activeExam ? `/dashboard?exam=${activeExam}` : "/dashboard"}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 text-[14px] font-semibold transition-colors ${
                pathname === "/dashboard"
                  ? "bg-opacity-10"
                  : "text-[#333] hover:bg-[#fafafa]"
              }`}
              style={
                pathname === "/dashboard"
                  ? {
                      color: accentColor,
                      backgroundColor: `${accentColor}10`,
                    }
                  : undefined
              }
            >
              View your results
            </Link>
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 text-[14px] font-semibold transition-colors ${
                    isActive
                      ? "bg-opacity-10"
                      : "text-[#333] hover:bg-[#fafafa]"
                  }`}
                  style={
                    isActive
                      ? {
                          color: accentColor,
                          backgroundColor: `${accentColor}10`,
                        }
                      : undefined
                  }
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex gap-2 pt-3 px-4">
              {user ? (
                <button
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                  className="flex-1 text-center text-[13px] font-semibold py-2 border border-[#ddd] hover:bg-[#fafafa] transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center text-[13px] font-semibold py-2 border border-[#ddd] hover:bg-[#fafafa] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center text-[13px] font-semibold text-white py-2 rounded-full transition-colors"
                    style={{ backgroundColor: accentColor }}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
