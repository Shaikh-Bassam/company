"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { categoryLabel, getCategories } from "@/lib/projects";
import type { Project, ProjectCategory } from "@/lib/types";

type Tab = ProjectCategory | "all";

export function FeaturedWork({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<Tab>("all");
  const tabs: { value: Tab; label: string }[] = [
    { value: "all", label: "All" },
    ...getCategories().filter((c) => projects.some((p) => p.category === c.value)),
  ];
  const visible = active === "all" ? projects : projects.filter((p) => p.category === active);
  const current = visible[0];

  useGSAP(
    () => {
      if (prefersReducedMotion() || !current) return;
      gsap.fromTo("[data-preview]", { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" });
    },
    { scope: root, dependencies: [current?.slug] },
  );

  return (
    <section ref={root} className="py-24 md:py-32">
      <Container>
        <DisplayHeading lines={["See everything.", "Pick anything."]} align="center" />
        <div role="tablist" aria-label="Project categories" className="mt-10 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              type="button"
              aria-selected={active === tab.value}
              onClick={() => setActive(tab.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                active === tab.value ? "border-accent bg-accent text-accent-fg" : "border-line text-muted hover:text-fg",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {current && (
          <div data-preview className="relative mt-12 aspect-video overflow-hidden rounded-card border border-line bg-surface-2">
            <Image src={current.cover} alt={current.title} fill sizes="(max-width: 1220px) 100vw, 1220px" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 bg-linear-to-t from-bg/90 to-transparent p-6 md:p-10">
              <div>
                <Badge>{categoryLabel(current.category)}</Badge>
                <h3 className="display mt-3 text-3xl md:text-5xl">{current.title}</h3>
              </div>
              <Link
                href={`/projects/${current.slug}`}
                className="rounded-full bg-fg px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-accent"
              >
                View project →
              </Link>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
