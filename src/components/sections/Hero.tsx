"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { FitText } from "@/components/ui/FitText";
import { site } from "@/config/site";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useLoaderDone } from "@/lib/loader-events";
import { scrollToId } from "@/lib/scroll";
import type { Project } from "@/lib/types";

/** "Ready-made. Custom-built." → ["Ready-made", "Custom-built"] */
function taglineWords(tagline: string): [string, string] {
  const [a = "", b = ""] = tagline.replace(/\.$/, "").split(". ");
  return [a, b];
}

/** How much the showcase grows by the end of the scroll (1.6 = 40% → 64% of the row). */
const SHOWCASE_SCALE = 1.6;
/** Gap, in px, between a word and the grown showcase edge at the end of the scroll. */
const WORD_GAP = 24;

/** "**Buy** a project" → the starred words rendered in the foreground colour, the rest muted. */
function renderIntro(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith("**") ? (
      <span key={i} className="font-semibold text-fg">
        {part.slice(2, -2)}
      </span>
    ) : (
      part
    ),
  );
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

      // Scroll-driven: the showcase grows while the two words move toward the centre.
      // Growth is a transform (scale), never `width`: animating width changed the hero's height
      // on every frame, which shifted the whole page under the scroll and read as a glitch.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const el = row.current;
        const media = el?.querySelector<HTMLElement>("[data-showcase]");
        const leftWord = el?.querySelector<HTMLElement>('[data-word="left"]');
        const rightWord = el?.querySelector<HTMLElement>('[data-word="right"]');
        if (!el || !media || !leftWord || !rightWord) return;

        // Each word travels exactly far enough to hug the grown media's edge, so the two
        // never cross each other in the middle. Layout offsets ignore transforms, so these
        // stay correct on refresh.
        const grownHalf = () => (media.offsetWidth * SHOWCASE_SCALE) / 2;
        const leftTravel = () => el.offsetWidth / 2 - grownHalf() - WORD_GAP - (leftWord.offsetLeft + leftWord.offsetWidth);
        const rightTravel = () => el.offsetWidth / 2 + grownHalf() + WORD_GAP - rightWord.offsetLeft;

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: el, start: "top 70%", end: "top 5%", scrub: true, invalidateOnRefresh: true },
          })
          .fromTo("[data-showcase]", { scale: 1 }, { scale: SHOWCASE_SCALE, transformOrigin: "50% 50%" }, 0)
          .fromTo(leftWord, { x: 0 }, { x: leftTravel }, 0)
          .fromTo(rightWord, { x: 0 }, { x: rightTravel }, 0)
          .to("[data-scrollhint]", { opacity: 0, duration: 0.4 }, 0);
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
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
        <div className="md:w-[58%]">
          <FitText as="h1" lines={[site.name]} max={420} maxVw={19} renderLine={renderRollingChars} onMouseEnter={rollTitle} />
        </div>

        {/* Intro, CTA and stats beside the title, like the Figma hero's right column. */}
        <div className="md:w-[36%] md:max-w-md md:pb-[0.35em]">
          <p data-fade className="max-w-sm text-lg leading-snug text-muted md:text-xl">
            {renderIntro(site.hero.intro)}
          </p>
          <div data-fade className="mt-6">
            <Button variant="solid" onClick={() => scrollToId("work")}>
              {site.hero.cta}
            </Button>
          </div>
          <dl data-fade className="mt-8 flex gap-10">
            {site.stats.map((s) => (
              <div key={s.label}>
                <dt className="display text-4xl md:text-5xl">{s.value}</dt>
                <dd className="eyebrow mt-1 text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="my-8 md:my-10">
        <div data-fade className="eyebrow mx-auto flex w-full justify-between text-muted md:w-[40%]">
          <span>{site.kicker}</span>
          <span>{year}</span>
        </div>

        <div ref={row} className="relative z-10 mt-2 flex justify-center">
          <span data-word="left" aria-hidden="true" className={`${word} left-0`}>
            {left}
          </span>
          <div data-showcase className="relative aspect-video w-full overflow-hidden rounded-sm bg-surface will-change-transform md:w-[40%]">
            {site.hero.video ? (
              <video
                src={site.hero.video}
                poster={showcase?.cover}
                autoPlay
                muted
                loop
                playsInline
                aria-label={`${site.name} showreel`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              showcase && (
                <Image
                  src={showcase.cover}
                  alt={showcase.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 1600px"
                  className="object-cover"
                />
              )
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

      <div data-fade data-scrollhint className="relative h-px bg-line">
        <span className="eyebrow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg px-3 text-muted">
          Scroll down
        </span>
      </div>
    </section>
  );
}
