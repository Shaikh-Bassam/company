"use client";

import { useRef } from "react";
import { statement } from "@/config/content";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * Giant statement on a deep brown block. The block sticks briefly while a short,
 * time-based reveal plays once: each line wipes in from its own edge (never from off
 * screen), one after another with a small delay, and the captions ride up beside
 * their word. Nothing depends on how far the user keeps scrolling.
 */
export function Statement() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: root.current, start: "top 35%", toggleActions: "play none none none" },
      });

      gsap.utils.toArray<HTMLElement>("[data-slide]").forEach((line, i) => {
        const fromRight = line.dataset.slide === "right";
        // The word stays where it belongs and is unmasked from its own starting edge
        // (left edge for left lines, right edge for right lines), with only a tiny nudge.
        tl.fromTo(
          line,
          { clipPath: fromRight ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)", xPercent: fromRight ? 6 : -6 },
          { clipPath: "inset(0 0 0 0)", xPercent: 0, duration: 1.1 },
          i * 0.22,
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-caption]").forEach((caption) => {
        const track = caption.parentElement;
        if (!track) return;
        tl.fromTo(
          caption,
          { y: 0, opacity: 0 },
          { y: () => -(track.offsetHeight - caption.offsetHeight), opacity: 1, duration: 1.2, ease: "power2.out" },
          0.35,
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
      className="relative h-[130vh] bg-block text-block-fg"
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-5 py-[12vh]">
        {/* Size is capped by viewport height too, so the three lines always sit inside the screen with air above and below. */}
        <h2 className="display flex w-fit flex-col items-center gap-[1.1vw] text-[clamp(2.75rem,min(10.5vw,20vh),12rem)] leading-[0.9]">
          {statement.map((line) => {
            const stretch = line.stretch ?? 1;
            return (
              <span key={line.text} className="relative block w-fit whitespace-nowrap">
                {/* Stretch lives on the clip wrapper so the wipe never cuts off the widened glyphs. */}
                <span className="block origin-center overflow-hidden" style={{ transform: `scaleX(${stretch})` }}>
                  <span data-slide={line.from} className="block">
                    {line.text}
                  </span>
                </span>
                {line.label && <Caption lines={line.label} side={line.from} stretch={stretch} />}
              </span>
            );
          })}
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
