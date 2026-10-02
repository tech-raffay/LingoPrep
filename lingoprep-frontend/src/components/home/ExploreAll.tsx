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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/dashboard-illustration.svg"
            alt=""
            aria-hidden="true"
            className="w-[160px] h-auto object-contain"
          />

          <h2 className="text-[26px] sm:text-[30px]">
            Didn&rsquo;t find what you were looking for?
          </h2>
          <p className="text-[15.5px] leading-[1.72] text-n-600 max-w-[34rem]">
            Browse the whole library: practice tests, band descriptors,
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
