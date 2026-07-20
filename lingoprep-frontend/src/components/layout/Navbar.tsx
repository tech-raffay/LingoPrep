"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/listening", label: "Listening" },
  { href: "/reading", label: "Reading" },
  { href: "/writing", label: "Writing" },
  { href: "/speaking", label: "Speaking" },
  { href: "/dashboard", label: "Results" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#e0e0e0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8102e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span className="text-lg font-bold text-[#c8102e] tracking-tight">LingoPrep</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-[14px] font-semibold transition-colors ${
                    isActive
                      ? "text-[#c8102e] border-b-2 border-[#c8102e]"
                      : "text-[#333] hover:text-[#c8102e]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-[13px] font-semibold text-[#333] hover:text-[#c8102e] flex items-center gap-1.5 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="text-[13px] font-semibold bg-[#c8102e] text-white px-4 py-2 rounded-full hover:bg-[#a50d24] transition-colors"
            >
              Book your test
            </Link>
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
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 text-[14px] font-semibold transition-colors ${
                    isActive
                      ? "text-[#c8102e] bg-[#fef2f2]"
                      : "text-[#333] hover:bg-[#fafafa]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex gap-2 pt-3 px-4">
              <Link href="/auth/login" className="flex-1 text-center text-[13px] font-semibold py-2 border border-[#ddd] hover:bg-[#fafafa] transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="flex-1 text-center text-[13px] font-semibold bg-[#c8102e] text-white py-2 rounded-full hover:bg-[#a50d24] transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
