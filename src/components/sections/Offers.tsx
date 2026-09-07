"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { FitText } from "@/components/ui/FitText";
import { offers } from "@/config/content";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useContact } from "@/store/contact";

/** Extra scroll distance (in vh) each offer gets while the screen stays fixed. */
const SCROLL_PER_OFFER_VH = 55;

/** Opacity by distance from the centred line: centre, neighbour, further away. */
const DIM = ["opacity-100", "opacity-40", "opacity-15"] as const;

/**
 * The four ways to work with us, presented like rolling film credits: the screen stays
 * fixed while the list glides upward so each line passes through the exact centre. The
 * centred line is lit and shows its description; neighbours fade with distance. Clicking a
 * line opens the contact form with the subject prefilled. Under reduced motion the list is
 * static and every line stays lit.
 */
export function Offers() {
  const { openContact } = useContact();
  const track = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = list.current;
      const viewport = screen.current;
      if (!el || !viewport) return;
      const lines = Array.from(el.children) as HTMLElement[];
      const last = lines.length - 1;

      // Offset that puts line `i` at the vertical centre of the fixed screen (transform-free measurements).
      const centreOn = (i: number) => {
        const line = lines[i];
        return viewport.clientHeight / 2 - (el.offsetTop + line.offsetTop + line.offsetHeight / 2);
      };

      setActive(0);
      gsap.fromTo(
        el,
        { y: () => centreOn(0) },
        {
          y: () => centreOn(last),
          ease: "none",
          scrollTrigger: {
            trigger: track.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => setActive(Math.round(self.progress * last)),
          },
        },
      );
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
        <div ref={screen} className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <ol ref={list} className="relative flex flex-col items-center gap-10 will-change-transform md:gap-14">
            {offers.map((offer, i) => {
              const distance = active === null ? 0 : Math.min(2, Math.abs(active - i));
              const isActive = distance === 0;
              return (
                <li
                  key={offer.title}
                  className={cn(
                    "w-full text-center transition-[opacity,transform] duration-500 ease-out",
                    DIM[distance],
                    isActive ? "scale-100" : "scale-[0.92]",
                  )}
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
