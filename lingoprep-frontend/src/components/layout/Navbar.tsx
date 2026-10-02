"use client";

/**
 * Navigation bar — brand book §10.
 *
 * "56px bar, white, 1px bottom border, no shadow. One crimson button per bar."
 *
 * §10 also allows an ink strip above the bar for the free-access promise.
 * Removed at the user's request — the promise is still made in the landing
 * hero and in the footer, so nothing is lost but the persistent band.
 *
 * The CTA was "Book your test", which implied a paid booking flow this
 * platform does not have and contradicts §01 "Free without asterisks" and
 * §14 ("never say official/partner"). It now reads "Start free", matching the
 * brand book's own navigation artwork.
 *
 * No colour is hardcoded: the accent comes from var(--accent), so the bar is
 * crimson on IELTS and blue on TOEFL with no per-component logic at all.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useExam } from "@/components/theme/ExamThemeProvider";
import Logo from "@/components/brand/Logo";
import Icon from "@/components/brand/Icon";
import { Badge, ButtonLink } from "@/components/brand/ui";

/** "Muhammad Raffay" → "MR"; falls back to the email's first letter. */
function initialsOf(name?: string, email?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (email?.[0] ?? "?").toUpperCase();
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, unset, withExam } = useExam();

  const onLanding = pathname === "/";
  const resultsHref = withExam("/dashboard");
  const resultsActive = pathname === "/dashboard";

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50">
      {/* ── 56px bar, white, 1px bottom border, no shadow (§10) ──────────── */}
      <nav className="bg-n-0 border-b border-n-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Logo + exam badge */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href={unset ? "/" : withExam("/")}
                className="shrink-0"
                aria-label="LingoPrep home"
              >
                <Logo size={30} />
              </Link>
              {/* The badge names the active exam so the accent is never the
                  only signal of which test you are in (§07 accessibility). */}
              {!unset && !onLanding && (
                <Badge className="hidden sm:inline-flex">{theme.name}</Badge>
              )}
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-5">
              {/* Signed in with an exam chosen: a way back to the tests from
                  anywhere (Results design). */}
              {user && !unset && (
                <Link
                  href={withExam("/")}
                  className="text-[14px] font-bold text-n-700 hover:text-accent transition-colors duration-[120ms] whitespace-nowrap"
                >
                  Practice tests
                </Link>
              )}
              <Link
                href={resultsHref}
                aria-current={resultsActive ? "page" : undefined}
                className={`text-[14px] font-bold transition-colors duration-[120ms] whitespace-nowrap py-1.5 border-b-2 ${
                  resultsActive ? "text-accent border-accent" : "text-ink border-transparent hover:text-accent"
                }`}
              >
                Your results
              </Link>

              {user ? (
                <>
                  <span className="w-px h-[26px] bg-n-200" aria-hidden="true" />
                  {/* Account pill: initials, name, and the exam being practised */}
                  <span className="flex items-center gap-2.5 rounded-full border border-n-200 bg-n-0 py-1 pl-1 pr-3 max-w-[230px]">
                    <span
                      className="w-[34px] h-[34px] shrink-0 rounded-full text-white text-[13px] font-bold flex items-center justify-center"
                      style={{ background: "linear-gradient(145deg, color-mix(in srgb, var(--accent) 88%, white), var(--accent-strong))" }}
                      aria-hidden="true"
                    >
                      {initialsOf(user.user_metadata?.full_name, user.email)}
                    </span>
                    <span className="flex flex-col leading-[1.2] min-w-0">
                      <span className="text-[13.5px] font-bold text-ink truncate">
                        {user.user_metadata?.full_name || user.email}
                      </span>
                      {!unset && (
                        <span className="text-[11.5px] font-bold text-n-500 truncate">
                          {theme.name === "TOEFL" ? "TOEFL iBT" : "IELTS Academic"}
                        </span>
                      )}
                    </span>
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[14px] font-bold text-n-700 hover:bg-n-100 hover:text-ink transition-colors duration-[120ms] cursor-pointer whitespace-nowrap"
                  >
                    <Icon name="signOut" size={16} />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-1.5 text-[14px] font-bold text-ink hover:text-accent transition-colors duration-[120ms]"
                  >
                    <Icon name="account" size={16} />
                    Sign in
                  </Link>
                  {/* §10: exactly one accent button per bar */}
                  <ButtonLink href="/auth/signup" size="compact">
                    Start free
                  </ButtonLink>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 -mr-2 text-ink cursor-pointer"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <Icon name={mobileOpen ? "close" : "menu"} size={24} />
            </button>
          </div>

          {/* Mobile panel */}
          {mobileOpen && (
            <div className="md:hidden border-t border-n-200 py-3 space-y-1">
              {!unset && (
                <div className="px-1 pb-2">
                  <Badge>{theme.name}</Badge>
                </div>
              )}

              <Link
                href={resultsHref}
                onClick={closeMobile}
                className={`flex items-center gap-2.5 rounded-input px-3 py-2.5 text-[14px] font-bold transition-colors duration-[120ms] ${
                  resultsActive
                    ? "bg-accent-tint text-accent-on-tint"
                    : "text-ink hover:bg-n-50"
                }`}
              >
                <Icon name="report" size={20} />
                Your results
              </Link>

              <div className="flex gap-2 pt-2">
                {user ? (
                  <button
                    onClick={() => { signOut(); closeMobile(); }}
                    className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-full border border-n-300 text-[14px] font-bold text-ink hover:bg-n-50 transition-colors duration-[120ms] cursor-pointer"
                  >
                    <Icon name="signOut" size={16} />
                    Sign out
                  </button>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={closeMobile}
                      className="flex-1 h-11 inline-flex items-center justify-center rounded-full border border-n-300 text-[14px] font-bold text-ink hover:bg-n-50 transition-colors duration-[120ms]"
                    >
                      Sign in
                    </Link>
                    <ButtonLink href="/auth/signup" fullWidth className="flex-1">
                      Start free
                    </ButtonLink>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
