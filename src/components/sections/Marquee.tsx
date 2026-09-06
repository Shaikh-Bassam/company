"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

export function Marquee({ items }: { items: readonly string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      tween.current = gsap.to("[data-track]", { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="overflow-hidden border-y border-line py-5"
      onMouseEnter={() => tween.current?.pause()}
      onMouseLeave={() => tween.current?.play()}
    >
      <div data-track className="flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {items.map((item) => (
              <li key={item} className="display flex items-center gap-8 px-4 text-2xl text-muted md:text-3xl">
                {item}
                <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
