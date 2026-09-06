import type { RefObject } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/** Fades `selector` elements up as they enter the viewport. Skipped under reduced motion. */
export function useReveal(scope: RefObject<HTMLElement | null>, selector = "[data-reveal]"): void {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    },
    { scope },
  );
}
