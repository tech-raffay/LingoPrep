"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "lingoprep_exam";

const examColors: Record<string, string> = {
  ielts: "#c8102e",
  toefl: "#0057b8",
};

export default function Footer() {
  const searchParams = useSearchParams();
  const [activeExam, setActiveExam] = useState<string | null>(null);

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

  const accentColor = activeExam ? examColors[activeExam] : "#c8102e";

  return (
    <footer className="bg-[#333541] text-white border-t border-[#4e505c] w-full">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Top bar: Logo and Country */}
        <div className="flex items-center justify-between border-b border-[#4e505c] pb-6 mb-8">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="text-[18px] font-extrabold tracking-tight">LingoPrep</span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-[#b0b3c0] hover:text-white cursor-pointer transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            <span className="font-semibold">Pakistan</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-left">
          <div>
            <h4 className="text-[14px] font-bold text-white mb-4 relative pb-2 inline-block">
              Useful links
              <span className="absolute bottom-0 left-0 w-8 h-[2px] transition-all duration-300" style={{ backgroundColor: accentColor }} />
            </h4>
            <ul className="space-y-3 text-[13px] text-[#b0b3c0]">
              <li><span className="hover:text-white cursor-pointer transition-colors block">Who accepts IELTS?</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors block">News and articles</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors block">IELTS Events & Seminars</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors block">IELTS Masterclass</span></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors block">Your IELTS results</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-white mb-4 relative pb-2 inline-block">
              Featured
              <span className="absolute bottom-0 left-0 w-8 h-[2px] transition-all duration-300" style={{ backgroundColor: accentColor }} />
            </h4>
            <ul className="space-y-3 text-[13px] text-[#b0b3c0]">
              <li><Link href="/reading?exam=ielts" className="hover:text-white transition-colors block">IELTS Academic</Link></li>
              <li><Link href="/reading?exam=ielts" className="hover:text-white transition-colors block">IELTS General Training</Link></li>
              <li><Link href="/reading?exam=toefl" className="hover:text-white transition-colors block">TOEFL iBT Prep</Link></li>
              <li><span className="hover:text-white cursor-pointer transition-colors block">IELTS by IDP app</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-white mb-4 relative pb-2 inline-block">
              Need help?
              <span className="absolute bottom-0 left-0 w-8 h-[2px] transition-all duration-300" style={{ backgroundColor: accentColor }} />
            </h4>
            <ul className="space-y-3 text-[13px] text-[#b0b3c0]">
              <li><span className="hover:text-white cursor-pointer transition-colors block">Find a test centre</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors block">Contact us</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors block">FAQs & Support</span></li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-[#4e505c] pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-left">
            <span className="text-[13px] font-bold text-[#b0b3c0]">LingoPrep – Pakistan</span>
            <div className="flex gap-3 mt-3">
              {/* Facebook */}
              <a href="#" className="w-8 h-8 rounded-full bg-[#4e505c] hover:bg-white hover:text-[#333541] flex items-center justify-center text-[#b0b3c0] transition-all" aria-label="Facebook">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-8 h-8 rounded-full bg-[#4e505c] hover:bg-white hover:text-[#333541] flex items-center justify-center text-[#b0b3c0] transition-all" aria-label="Instagram">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              {/* Twitter/X */}
              <a href="#" className="w-8 h-8 rounded-full bg-[#4e505c] hover:bg-white hover:text-[#333541] flex items-center justify-center text-[#b0b3c0] transition-all" aria-label="Twitter">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* WhatsApp */}
              <a href="#" className="w-8 h-8 rounded-full bg-[#4e505c] hover:bg-white hover:text-[#333541] flex items-center justify-center text-[#b0b3c0] transition-all" aria-label="WhatsApp">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.982L2 22l5.13-1.348a9.927 9.927 0 004.88 1.28c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.927-7.07A9.92 9.92 0 0012.012 2zm5.794 13.978c-.247.694-1.229 1.284-1.69 1.342-.455.059-.899.27-2.97-.565-2.493-1.004-4.088-3.535-4.213-3.7a12.87 12.87 0 01-.098-.135c-.092-.128-.767-.992-.767-1.892 0-.899.472-1.342.64-1.52.17-.179.37-.225.494-.225H10.1c.11 0 .256-.041.4.307.155.37.53 1.293.576 1.386.046.092.077.202.015.324-.062.124-.093.202-.186.311-.093.11-.196.246-.28.34-.093.102-.19.213-.081.399.108.187.482.793 1.033 1.283.708.63 1.303.825 1.488.918.186.093.294.078.402-.047.11-.124.464-.54.587-.724.124-.183.247-.152.417-.09.17.062 1.077.508 1.262.599.186.091.309.137.354.214.047.077.047.447-.2.141z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer / Bottom legal text */}
        <div className="border-t border-[#4e505c] mt-8 pt-6 text-left">
          <p className="text-[11px] text-[#787c8f] leading-relaxed mb-4">
            LingoPrep is an independent learning platform. IELTS® is a registered trademark of University of Cambridge ESOL Examinations, the British Council, and IDP Education Australia. TOEFL® and TOEFL iBT® are registered trademarks of Educational Testing Service (ETS). This platform is not endorsed or approved by any trademark owners.
          </p>
          <div className="flex flex-wrap justify-between items-center gap-3 text-[11px] text-[#787c8f]">
            <span>© {new Date().getFullYear()} LingoPrep. All rights reserved.</span>
            <div className="flex gap-4">
              <span className="hover:text-white cursor-pointer transition-colors">Legal Notice</span>
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Use</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
