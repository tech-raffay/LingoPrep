"use client";

/**
 * Closing "Didn't find what you were looking for?" band — from
 * "LingoPrep Home.dc.html".
 *
 * The mark is the design's own composed illustration (envelope, card, dots)
 * rather than stock art, per §11. It is the only multi-colour graphic on the
 * page; the accent element follows the exam theme so it cannot clash.
 */

import Icon from "@/components/brand/Icon";

export default function ExploreAll({ href }: { href: string }) {
  return (
    <section className="bg-n-0">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-7 pt-20 sm:pt-24 pb-24 sm:pb-28">
        <div className="flex flex-col items-center text-center gap-4">
          <svg width="76" height="76" viewBox="0 0 76 76" fill="none" aria-hidden="true">
            <circle cx="38" cy="30" r="22" fill="var(--amber-100)" />
            <rect x="20" y="40" width="36" height="22" rx="4" fill="var(--ink)" />
            <path d="M20 40l18 10 18-10" stroke="#fff" strokeWidth="2.4" fill="none" />
            <rect
              x="30" y="18" width="13" height="16" rx="2.5"
              fill="#fff" stroke="var(--ink)" strokeWidth="2.2"
              transform="rotate(-9 30 18)"
            />
            <circle cx="52" cy="22" r="4.5" fill="var(--accent)" />
            <circle cx="24" cy="24" r="3" fill="var(--amber-500)" />
          </svg>

          <h2 className="text-[26px] sm:text-[30px]">
            Didn&rsquo;t find what you were looking for?
          </h2>
          <p className="text-[15.5px] leading-[1.72] text-n-600 max-w-[34rem]">
            Browse the whole library — practice tests, band descriptors,
            walkthrough videos and worked model answers for every task type.
          </p>
          <a
            href={href}
            className="mt-1.5 inline-flex h-[50px] items-center gap-2 rounded-full border border-n-400 px-7 text-[15px] font-bold text-ink transition-[border-color,transform] duration-[120ms] hover:border-ink hover:-translate-y-0.5"
          >
            Explore all preparation
            <Icon name="next" size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
