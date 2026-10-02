/**
 * An illustration from the registry in src/lib/illustrations.ts.
 *
 * `float` adds the design's slow 6–7s bob (motion.js `floatIt`). It is
 * marketing-page decoration only and is stilled by prefers-reduced-motion.
 */

import Image from "next/image";
import type { Illustration } from "@/lib/illustrations";

export default function Art({
  art,
  className,
  float,
  priority,
  sizes = "(min-width: 1024px) 560px, 100vw",
}: {
  art: Illustration;
  className?: string;
  float?: boolean;
  /** Above-the-fold art: load eagerly. */
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={art.src}
      alt={art.alt}
      width={art.width}
      height={art.height}
      priority={priority}
      sizes={sizes}
      draggable={false}
      className={`block h-auto select-none ${float ? "lp-float" : ""} ${className ?? ""}`}
    />
  );
}
