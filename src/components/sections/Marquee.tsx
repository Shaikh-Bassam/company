"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

type Props = {
  items: readonly string[];
  /** Seconds for one full loop. */
  speed?: number;
  className?: string;
  itemClassName?: string;
};

/** Infinite horizontal ticker. Pauses on hover; static under reduced motion. */
export function Marquee({ items, speed = 30, className, itemClassName }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      tween.current = gsap.to("[data-track]", { xPercent: -50, duration: speed, ease: "none", repeat: -1 });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className={cn("overflow-hidden", className)}
      onMouseEnter={() => tween.current?.pause()}
      onMouseLeave={() => tween.current?.play()}
    >
      <div data-track className="flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {items.map((item, i) => (
              <li key={`${item}-${i}`} className={cn("whitespace-nowrap", itemClassName)}>
                {item}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
