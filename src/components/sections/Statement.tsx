"use client";

import { useRef } from "react";
import { statement } from "@/config/content";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * Pinned, scroll-scrubbed statement on a deep brown block: each giant line slides in
 * from the side it names (left, right, left) while the section stays fixed.
 */
export function Statement() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const lines = gsap.utils.toArray<HTMLElement>("[data-slide]");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${lines.length * 60}%`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });
      lines.forEach((line, i) => {
        const dir = line.dataset.slide === "right" ? 1 : -1;
        tl.fromTo(line, { xPercent: dir * 120 }, { xPercent: 0, ease: "power2.out", duration: 1 }, i * 0.8);
      });
      tl.fromTo("[data-label]", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.6 }, 0.4);
    },
    { scope: root },
  );

  return (
    <section
      id="about"
      ref={root}
      aria-label="Statement"
      className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-block px-5 py-24 text-block-fg"
    >
      <h2 className="display w-full text-center text-[clamp(3rem,14vw,15rem)]">
        {statement.map((line, i) => (
          <span
            key={line.text}
            className={cn(
              "flex items-start justify-center gap-4 md:gap-8",
              line.from === "right" && "md:translate-x-[3%]",
              i === statement.length - 1 && "md:-translate-x-[2%]",
            )}
          >
            {line.label && line.from === "left" && <Caption lines={line.label} align="right" />}
            <span data-slide={line.from} className="block whitespace-nowrap">
              {line.text}
            </span>
            {line.label && line.from === "right" && <Caption lines={line.label} align="left" />}
          </span>
        ))}
      </h2>
    </section>
  );
}

function Caption({ lines, align }: { lines: readonly [string, string]; align: "left" | "right" }) {
  return (
    <span
      data-label
      className={cn(
        "eyebrow mt-[0.55em] hidden leading-tight text-block-fg/70 md:block",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      {lines[0]}
      <br />
      {lines[1]}
    </span>
  );
}
