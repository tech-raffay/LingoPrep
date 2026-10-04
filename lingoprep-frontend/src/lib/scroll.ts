/**
 * Jump the page (and any scrollable panes) to the top, instantly.
 *
 * "instant" overrides the site-wide `scroll-behavior: smooth`, which a
 * re-render can interrupt half way, especially on iOS. The jump is repeated
 * on the next frame and again shortly after, once the new screen has been
 * laid out and is tall enough to have moved. Returns a cleanup function.
 */
export function jumpToTop(...panes: (HTMLElement | null | undefined)[]): () => void {
  const toTop = () => {
    for (const p of panes) p?.scrollTo({ top: 0, behavior: "instant" });
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  toTop();
  const frame = requestAnimationFrame(toTop);
  const timer = setTimeout(toTop, 150);
  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
  };
}
