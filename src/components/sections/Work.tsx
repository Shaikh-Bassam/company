"use client";

import { useRef, useState } from "react";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Badge } from "@/components/ui/Badge";
import { FitText } from "@/components/ui/FitText";
import { getCategories } from "@/lib/projects";
import { useReveal } from "@/lib/use-reveal";
import type { Project, ProjectCategory } from "@/lib/types";

type Filter = ProjectCategory | "all";

/**
 * All projects for sale: edge-to-edge title, hairline with filters, then a gallery
 * that alternates one full-width image with a pair of half-width ones.
 */
export function Work({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  useReveal(root);

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    ...getCategories().filter((c) => projects.some((p) => p.category === c.value)),
  ];
  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="work" ref={root} className="px-5 py-24 md:px-7 md:py-32">
      <FitText lines={["Projects for sale"]} max={300} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <p className="eyebrow text-muted">Finished builds, rebranded and deployed for you</p>
        <div role="tablist" aria-label="Filter projects" className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              role="tab"
              type="button"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className="rounded-full"
            >
              <Badge active={filter === f.value}>{f.label}</Badge>
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-10 grid gap-x-6 gap-y-12 md:mt-14 md:grid-cols-2">
        {visible.map((project, i) => {
          const wide = i % 3 === 0;
          return (
            <li key={project.slug} data-reveal className={wide ? "md:col-span-2" : undefined}>
              <ProjectCard project={project} index={i} wide={wide} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
