"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";
import { FitText } from "@/components/ui/FitText";
import { site } from "@/config/site";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useLoaderDone } from "@/lib/loader-events";
import type { Project } from "@/lib/types";

/** "Ready-made. Custom-built." → ["Ready-made", "Custom-built"] */
function taglineWords(tagline: string): [string, string] {
  const [a = "", b = ""] = tagline.replace(/\.$/, "").split(". ");
  return [a, b];
}

/** Each letter carries a copy below it; hovering the title rolls every letter up once, staggered. */
function renderRollingChars(line: string) {
  return line.split("").map((ch, i) => {
    const glyph = ch === " " ? " " : ch;
    return (
      <span key={i} className="relative inline-block overflow-hidden align-top">
        <span data-roll className="relative block">
          {glyph}
          <span aria-hidden="true" className="absolute left-0 top-full block">
            {glyph}
          </span>
        </span>
      </span>
    );
  });
}

export function Hero({ showcase }: { showcase: Project | null }) {
  const root = useRef<HTMLElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const rolling = useRef(false);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Entrance, played once the loader finishes.
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" } })
        .from("[data-line]", { yPercent: 110, duration: 1.1, stagger: 0.08 })
        .from("[data-fade]", { opacity: 0, y: 16, duration: 0.8, stagger: 0.06 }, "-=0.7")
        .from("[data-showcase]", { opacity: 0, duration: 1 }, "-=0.7");

      // Scroll-driven: the showcase grows to full width while the two words move toward the centre.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const el = row.current;
        if (!el) return;
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: el, start: "top 70%", end: "top 5%", scrub: true },
          })
          .fromTo("[data-showcase]", { width: "40%" }, { width: "100%" }, 0)
          .fromTo('[data-word="left"]', { x: 0 }, { x: () => el.offsetWidth * 0.3 }, 0)
          .fromTo('[data-word="right"]', { x: 0 }, { x: () => -el.offsetWidth * 0.3 }, 0);
      });
    },
    { scope: root },
  );

  useLoaderDone(useCallback(() => tl.current?.play(), []));

  const rollTitle = useCallback(() => {
    const el = root.current;
    if (!el || rolling.current || prefersReducedMotion()) return;
    const letters = el.querySelectorAll("[data-roll]");
    rolling.current = true;
    gsap.to(letters, {
      yPercent: -100,
      duration: 0.7,
      ease: "power3.inOut",
      stagger: 0.03,
      onComplete: () => {
        gsap.set(letters, { yPercent: 0 });
        rolling.current = false;
      },
    });
  }, []);

  const [left, right] = taglineWords(site.tagline);
  const year = new Date().getFullYear();
  const word =
    "display pointer-events-none absolute inset-y-0 z-10 hidden items-center text-[clamp(2.5rem,5.5vw,6rem)] md:flex";

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-5 pb-10 pt-20 md:px-7 md:pt-24"
    >
      <FitText as="h1" lines={[site.name]} max={420} maxVw={19} renderLine={renderRollingChars} onMouseEnter={rollTitle} />

      <div className="my-8 md:my-10">
        <div data-fade className="eyebrow mx-auto flex w-full justify-between text-muted md:w-[40%]">
          <span>{site.kicker}</span>
          <span>{year}</span>
        </div>

        <div ref={row} className="relative mt-2 flex justify-center">
          <span data-word="left" aria-hidden="true" className={`${word} left-0`}>
            {left}
          </span>
          <div data-showcase className="relative aspect-video w-full overflow-hidden rounded-sm bg-surface md:w-[40%]">
            {showcase && (
              <Image
                src={showcase.cover}
                alt={showcase.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1600px"
                className="object-cover"
              />
            )}
          </div>
          <span data-word="right" aria-hidden="true" className={`${word} right-0`}>
            {right}
          </span>
        </div>

        <p data-fade className="display mt-8 text-center text-[13vw] md:hidden">
          {left}
          <br />
          {right}
        </p>
      </div>

      <div data-fade className="relative h-px bg-line">
        <span className="eyebrow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg px-3 text-muted">
          Scroll down
        </span>
      </div>
    </section>
  );
}
