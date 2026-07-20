import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "LingoPrep — IELTS & TOEFL Practice Tests",
  description:
    "Practice IELTS and TOEFL with computer-based test simulations. Get AI-powered scoring for Reading, Listening, Writing, and Speaking modules.",
  keywords: ["IELTS", "TOEFL", "English test preparation", "practice tests", "band score"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#f5f5f5] text-[#1a1a1a] antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
