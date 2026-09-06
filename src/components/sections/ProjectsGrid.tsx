"use client";

import { useRef } from "react";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { useReveal } from "@/lib/use-reveal";
import type { Project } from "@/lib/types";

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <section id="work" ref={root} className="py-24 md:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <DisplayHeading lines={["Projects", "for sale"]} />
          <p className="max-w-sm text-muted">
            Every project is finished, tested and ready to be rebranded for you. No prices listed: each build is
            quoted for your needs.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}
