"use client";

/**
 * "New to IELTS or TOEFL? Start here" — from "LingoPrep Home.dc.html".
 *
 * Two of the design's six rows were changed, both for brand safety (§14):
 *
 *  - "Who accepts these scores — Universities and visa routes, by country"
 *    implied LingoPrep's own estimates are accepted somewhere. §14 forbids
 *    presenting a practice band as usable for admissions or visas. It now
 *    reads as reference information about the real examinations, and the copy
 *    says so explicitly.
 *
 *  - "Free live masterclasses — Weekly online sessions" advertised a service
 *    that does not exist and echoes an examination board's own offering. It is
 *    now "Model answers and transcripts", which the app actually provides.
 *
 * Restore either from the design file if you build the feature.
 */

import Icon, { type IconName } from "@/components/brand/Icon";

interface Row {
  title: string;
  desc: string;
  icon: IconName;
  href: string;
}

export default function StartHere({
  libraryHref,
  practiceHref,
  resultsHref,
}: {
  libraryHref: string;
  practiceHref: string;
  resultsHref: string;
}) {
  const rows: Row[] = [
    {
      title: "Preparation library",
      desc: "Every article, walkthrough and practice test in one place.",
      icon: "library",
      href: libraryHref,
    },
    {
      title: "Band descriptors explained",
      desc: "What examiners reward at each band, in plain language.",
      icon: "lightbulb",
      href: resultsHref,
    },
    {
      title: "Score requirements by country",
      desc: "What universities and visa routes ask for on the official exams — not on practice estimates.",
      icon: "globe",
      href: libraryHref,
    },
    {
      title: "Computer-delivered sample test",
      desc: "Practise the on-screen format before test day.",
      icon: "monitor",
      href: practiceHref,
    },
    {
      title: "Model answers and transcripts",
      desc: "Worked responses and full audio transcripts after every test.",
      icon: "report",
      href: practiceHref,
    },
    {
      title: "Practise on mobile",
      desc: "Reading, writing and results work on a phone-sized screen.",
      icon: "mobile",
      href: practiceHref,
    },
  ];

  return (
    <section className="bg-n-0">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-7 pt-20 sm:pt-24">
        <h2 className="flex items-center gap-3 text-[26px] sm:text-[32px] mb-6">
          <span className="w-[5px] h-[30px] rounded-full bg-accent" />
          New to IELTS or TOEFL? Start here
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <a
              key={r.title}
              href={r.href}
              className="group flex items-start gap-4 rounded-card border border-n-300 bg-n-0 px-5 py-5
                         transition-[border-color,transform,box-shadow] duration-200
                         hover:border-accent hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgb(18_23_43/0.1)]"
            >
              <span className="w-11 h-11 rounded-xl bg-accent-tint text-accent flex items-center justify-center shrink-0">
                <Icon name={r.icon} size={24} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[15.5px] font-bold text-ink mb-1">
                  {r.title}
                </span>
                <span className="block text-[13.5px] leading-[1.65] text-n-600">
                  {r.desc}
                </span>
              </span>
              <Icon
                name="chevronRight"
                size={20}
                className="text-n-500 shrink-0 mt-3 transition-transform duration-[120ms] group-hover:translate-x-0.5"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
