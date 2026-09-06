"use client";

import { useRef } from "react";
import { statement } from "@/config/content";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * Pinned, scroll-scrubbed statement on a deep brown block. Each giant line slides in
 * from the side it names while the section stays fixed; the small captions start at
 * the bottom of their word and ride up to its top as the user scrolls.
 */
export function Statement() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const lines = gsap.utils.toArray<HTMLElement>("[data-slide]");
      // Lines overlap heavily so one viewport of scrolling brings all of them in.
      const stagger = 0.18;
      const total = (lines.length - 1) * stagger + 1;
      const tl = gsap.timeline({
        // No GSAP pin: the inner block is CSS `sticky`, so nothing jumps when the section reaches the top.
        // The timeline simply scrubs across the section's extra height.
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });
      lines.forEach((line, i) => {
        const dir = line.dataset.slide === "right" ? 1 : -1;
        tl.fromTo(
          line,
          { xPercent: dir * 120 },
          { xPercent: 0, ease: "power2.out", duration: 1 },
          i * stagger,
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-caption]").forEach((caption) => {
        const track = caption.parentElement;
        if (!track) return;
        tl.fromTo(
          caption,
          { y: 0 },
          {
            y: () => -(track.offsetHeight - caption.offsetHeight),
            ease: "none",
            duration: total - 0.2,
          },
          0.2,
        );
      });
    },
    { scope: root },
  );

  return (
    <section
      id="about"
      ref={root}
      aria-label="Statement"
      className="relative h-[170vh] bg-block text-block-fg"
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-5 py-20">
        <h2 className="display flex w-fit flex-col items-center gap-[2.2vw] text-[clamp(3rem,14vw,15rem)] leading-[0.95]">
          {statement.map((line, i) => (
            <span
              key={line.text}
              className={cn(
                "relative block w-fit whitespace-nowrap",
                line.from === "right" && "md:translate-x-[6%]",
                i === statement.length - 1 && "md:-translate-x-[3%]",
              )}
            >
              <span data-slide={line.from} className="block">
                {line.text}
              </span>
              {line.label && <Caption lines={line.label} side={line.from} />}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}

/** Caption track beside a word: full word height, caption pinned to its bottom (GSAP moves it up). */
function Caption({
  lines,
  side,
}: {
  lines: readonly [string, string];
  side: "left" | "right";
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute top-0 hidden h-full w-36 md:block",
        side === "left"
          ? "right-full mr-4 text-right"
          : "left-full ml-4 text-left",
      )}
    >
      <span
        data-caption
        className={cn(
          "eyebrow absolute bottom-0 block leading-tight text-block-fg/70",
          side === "left" ? "right-0" : "left-0",
        )}
      >
        {lines[0]}
        <br />
        {lines[1]}
      </span>
    </span>
  );
}
