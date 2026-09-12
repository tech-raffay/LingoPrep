import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ExamThemeProvider, examThemeScript } from "@/components/theme/ExamThemeProvider";
import ChromeSkeleton from "@/components/layout/ChromeSkeleton";
import { DEFAULT_EXAM } from "@/lib/exam";

export const metadata: Metadata = {
  title: "LingoPrep | Free IELTS & TOEFL practice tests",
  description:
    "Practice IELTS and TOEFL with computer-based test simulations. AI-generated practice estimates for Reading, Listening, Writing and Speaking. Free, with no account needed.",
  keywords: ["IELTS", "TOEFL", "English test preparation", "practice tests", "band score"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-exam is the single switch every accent token hangs off. Seeded to
    // the crimson default (§13 scheme 01) and corrected pre-paint by
    // examThemeScript below, so a TOEFL candidate never sees a crimson frame.
    <html lang="en" className="h-full" data-exam={DEFAULT_EXAM} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: examThemeScript }} />
      </head>
      {/* suppressHydrationWarning: browser extensions (password managers, ad
          blockers) stamp attributes like __processed_<guid>__ onto <body>
          before React hydrates, which React reports as an attribute mismatch.
          It is not from our markup and cannot be prevented from here. */}
      <body
        className="min-h-full flex flex-col bg-n-0 text-n-700 antialiased"
        suppressHydrationWarning
      >
        {/* The exam theme follows ?exam=, and reading search params opts
            this tree out of prerendering — so ChromeSkeleton is what ships in
            the static HTML. It carries no accent, so the first paint can never
            be the wrong exam's colour. */}
        <Suspense fallback={<ChromeSkeleton />}>
          <ExamThemeProvider>
            <AuthProvider>
              <Navbar />
              <main className="flex-1">
                <Suspense>{children}</Suspense>
              </main>
              <Footer />
            </AuthProvider>
          </ExamThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
