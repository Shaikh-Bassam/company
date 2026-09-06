import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { categoryLabel } from "@/lib/projects";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      data-reveal
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-fg/30"
    >
      <div className="relative aspect-video overflow-hidden bg-surface-2">
        <Image
          src={project.cover}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold">{project.title}</h3>
          <Badge>{categoryLabel(project.category)}</Badge>
        </div>
        <p className="text-sm text-muted">{project.tagline}</p>
        <ul className="flex flex-wrap gap-2">
          {project.tech.slice(0, 3).map((t) => (
            <li key={t}>
              <Chip>{t}</Chip>
            </li>
          ))}
        </ul>
        <p className="mt-auto pt-4 text-sm font-semibold text-accent">Want to buy? Contact us →</p>
      </div>
    </Link>
  );
}
