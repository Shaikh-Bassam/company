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
        // Starts while the section is still entering the viewport, so the words are already
        // moving when the sticky block locks in place. Lenis already smooths the scroll, so the
        // scrub is direct (no second easing layer, which felt like a hitch).
        scrollTrigger: {
          trigger: root.current,
          start: "top 85%",
          end: "bottom bottom",
          scrub: true,
        },
      });
      lines.forEach((line, i) => {
        const dir = line.dataset.slide === "right" ? 1 : -1;
        // GSAP owns `transform`, so the per-line horizontal stretch rides along with the slide.
        const scaleX = Number(line.dataset.stretch ?? 1);
        tl.fromTo(
          line,
          { xPercent: dir * 120, scaleX },
          { xPercent: 0, scaleX, ease: "power2.out", duration: 1 },
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
      className="relative h-[160vh] bg-block text-block-fg"
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-5 py-[12vh]">
        {/* Size is capped by viewport height too, so the three lines always sit inside the screen with air above and below. */}
        <h2 className="display flex w-fit flex-col items-center gap-[1.1vw] text-[clamp(2.75rem,min(10.5vw,20vh),12rem)] leading-[0.9]">
          {statement.map((line) => (
            <span key={line.text} className="relative block w-fit whitespace-nowrap">
              <span
                data-slide={line.from}
                data-stretch={line.stretch ?? 1}
                className="block origin-center"
                style={{ transform: `scaleX(${line.stretch ?? 1})` }}
              >
                {line.text}
              </span>
              {line.label && <Caption lines={line.label} side={line.from} stretch={line.stretch ?? 1} />}
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
  stretch,
}: {
  lines: readonly [string, string];
  side: "left" | "right";
  stretch: number;
}) {
  // The word is scaled visually but keeps its natural layout width, so push the caption
  // out by the overhang the stretch adds on that side.
  const overhang = `${100 + (stretch - 1) * 50}%`;
  return (
    <span
      aria-hidden="true"
      className={cn("absolute top-0 hidden h-full w-36 md:block", side === "left" ? "mr-3 text-right" : "ml-3 text-left")}
      style={side === "left" ? { right: overhang } : { left: overhang }}
    >
      <span
        data-caption
        className={cn(
          "eyebrow absolute bottom-0 block leading-tight text-block-fg/90",
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
