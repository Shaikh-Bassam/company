"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { FitText } from "@/components/ui/FitText";
import { offers } from "@/config/content";
import { cn } from "@/lib/cn";
import { ScrollTrigger, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useContact } from "@/store/contact";

/** Extra scroll distance (in vh) each offer gets while the list stays fixed on screen. */
const SCROLL_PER_OFFER_VH = 60;

/**
 * The four ways to work with us. The list is pinned (CSS sticky) while the user scrolls
 * through a tall track; scroll progress picks the active line, which is fully lit and shows
 * its description while the others dim. Clicking opens the contact form with the subject
 * prefilled. Under reduced motion every line stays lit and nothing depends on scroll.
 */
export function Offers() {
  const { openContact } = useContact();
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const count = offers.length;
      setActive(0);
      ScrollTrigger.create({
        trigger: track.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setActive(Math.min(count - 1, Math.floor(self.progress * count))),
      });
    },
    { scope: track },
  );

  return (
    <section id="services" className="bg-panel px-5 pt-24 md:px-7 md:pt-32">
      <FitText lines={["Have a project", "in mind?"]} max={210} align="center" />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <p className="eyebrow text-muted">Four ways to work with us</p>
        <Badge>Free scope and quote</Badge>
      </div>

      <div ref={track} className="relative" style={{ height: `${100 + offers.length * SCROLL_PER_OFFER_VH}vh` }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center">
          <ol className="flex flex-col items-center gap-5 md:gap-7">
            {offers.map((offer, i) => {
              const isActive = active === null || active === i;
              return (
                <li
                  key={offer.title}
                  className={cn("w-full text-center transition-opacity duration-500", isActive ? "opacity-100" : "opacity-25")}
                >
                  <button
                    type="button"
                    onClick={() => openContact({ subject: offer.title, source: "service" })}
                    className="mx-auto block max-w-5xl rounded-sm"
                    aria-current={active === i ? "true" : undefined}
                  >
                    <span className="display flex items-start justify-center gap-2 text-[clamp(2rem,min(6.5vw,11vh),6.75rem)] md:gap-4">
                      <span className="eyebrow mt-[0.4em] text-muted">{String(i + 1).padStart(2, "0")}</span>
                      <span>{offer.title}</span>
                    </span>
                    {/* Fixed-height slot so revealing a description never shifts the other lines. */}
                    <span
                      className={cn(
                        "mx-auto mt-2 block h-12 max-w-md text-sm leading-relaxed text-muted transition-opacity duration-500 md:h-14",
                        isActive ? "opacity-100" : "opacity-0",
                      )}
                    >
                      {offer.body}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
