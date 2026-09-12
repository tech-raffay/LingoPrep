/**
 * Static first-paint shell.
 *
 * The exam theme must follow the `?exam=` parameter, and reading search params
 * opts a route out of prerendering — so the app's real chrome is client
 * rendered and the static HTML would otherwise be an empty white page.
 *
 * This is the Suspense fallback that ships in that static HTML. It is a server
 * component with no hooks, so it renders on the server, and it deliberately
 * uses only exam-neutral parts of the brand: the 56px white bar and the
 * neutral page ground. It contains no accent surface at all, so it cannot show
 * the wrong exam's colour while the real chrome loads.
 */

export default function ChromeSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 56px bar, white, 1px bottom border, no shadow (§10) */}
      <div className="bg-n-0 border-b border-n-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center gap-3">
            {/* Neutral placeholder for the mark — no accent, so no wrong colour */}
            <div className="w-[30px] h-[30px] rounded-lg bg-n-200" />
            <div className="w-[104px] h-4 rounded bg-n-200" />
            <div className="ml-auto hidden md:flex items-center gap-5">
              <div className="w-20 h-3.5 rounded bg-n-200" />
              <div className="w-16 h-3.5 rounded bg-n-200" />
              <div className="w-[104px] h-10 rounded-full bg-n-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Page ground */}
      <div className="flex-1 tx-dots" />
    </div>
  );
}
