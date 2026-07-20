"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/reading", label: "Reading", icon: "📖" },
  { href: "/listening", label: "Listening", icon: "🎧" },
  { href: "/writing", label: "Writing", icon: "✍️" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border bg-surface/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-bold gradient-text transition-transform group-hover:scale-105">
              LingoPrep
            </span>
            <span className="hidden sm:inline-block text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              BETA
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "text-text-muted hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Profile / Auth placeholder */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-text-muted hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-text-muted hover:bg-surface-hover transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-border mt-2 pt-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-text-muted hover:bg-surface-hover"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
            <div className="flex gap-2 pt-3 px-4">
              <Link
                href="/auth/login"
                className="flex-1 text-center text-sm font-medium py-2 rounded-xl border border-border hover:bg-surface-hover transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="flex-1 text-center text-sm font-medium bg-primary text-white py-2 rounded-xl hover:bg-primary-dark transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
