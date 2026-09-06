"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { site } from "@/config/site";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useLoaderDone } from "@/lib/loader-events";
import { scrollToId } from "@/lib/scroll";
import type { Project } from "@/lib/types";

function taglineLines(tagline: string): [string, string] {
  const [a, b = ""] = tagline.split(". ");
  return [`${a}.`, b];
}

export function Hero({ showcase }: { showcase: Project | null }) {
  const root = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" } })
        .from("[data-line]", { yPercent: 110, duration: 1, stagger: 0.1 })
        .from("[data-fade]", { y: 24, opacity: 0, duration: 0.8, stagger: 0.08 }, "-=0.6")
        .from("[data-showcase]", { scale: 1.1, opacity: 0, duration: 1.2 }, "-=0.8");
    },
    { scope: root },
  );

  useLoaderDone(useCallback(() => tl.current?.play(), []));

  const lines = taglineLines(site.tagline);
  const year = new Date().getFullYear();

  return (
    <section ref={root} className="relative overflow-hidden pb-16 pt-36 md:pt-44">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-[5.5%] w-px bg-line" />
        <div className="absolute inset-y-0 right-[5.5%] w-px bg-line" />
      </div>
      <Container className="relative">
        <div data-fade>
          <Badge>Web Studio</Badge>
        </div>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <DisplayHeading as="h1" size="hero" lines={lines} />
          <div className="space-y-6">
            <p data-fade className="max-w-md text-lg text-muted">
              <span className="text-fg">Buy</span> a ready-made project or <span className="text-fg">commission</span> a
              custom build. Launch in days, not months.
            </p>
            <div data-fade>
              <Button onClick={() => scrollToId("work")}>See our work</Button>
            </div>
            <dl data-fade className="flex gap-10">
              {site.stats.map((s) => (
                <div key={s.label}>
                  <dt className="display text-3xl">{s.value}</dt>
                  <dd className="eyebrow mt-1">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-16 md:mt-24">
          <div className="eyebrow mx-auto flex max-w-[560px] justify-between">
            <span>{site.name}</span>
            <span>{year}</span>
          </div>
          <div className="mt-3 grid items-center gap-6 md:grid-cols-[1fr_minmax(0,560px)_1fr]">
            <span className="display hidden text-right text-[clamp(3rem,6vw,5.5rem)] md:block">Design</span>
            <div data-showcase className="relative aspect-video overflow-hidden rounded-card border border-line bg-surface-2">
              {showcase && (
                <Image
                  src={showcase.cover}
                  alt={showcase.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 560px"
                  className="object-cover"
                />
              )}
            </div>
            <span className="display hidden text-[clamp(3rem,6vw,5.5rem)] md:block">Develop</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
