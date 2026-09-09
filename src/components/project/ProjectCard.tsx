import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { categoryLabel } from "@/lib/projects";
import type { Project } from "@/lib/types";

type Props = {
  project: Project;
  /** Zero-based position in a list; renders as "01", "02"… */
  index?: number;
  /** Full-width item in the gallery grid: a wider crop. */
  wide?: boolean;
};

export function ProjectCard({ project, index, wide = false }: Props) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className={cn("relative overflow-hidden rounded-sm bg-surface", wide ? "aspect-[16/8]" : "aspect-[16/10]")}>
        <Image
          src={project.cover}
          alt={project.title}
          fill
          sizes={wide ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="eyebrow mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <span className="flex items-baseline gap-3">
          {index !== undefined && <span className="text-muted">{String(index + 1).padStart(2, "0")}</span>}
          <span className="text-base font-semibold normal-case tracking-normal">{project.title}</span>
        </span>
        <span className="flex items-baseline gap-4 text-muted">
          <span>{categoryLabel(project.category)}</span>
          <span className="transition-colors duration-300 group-hover:text-fg">Want to buy? Contact us</span>
        </span>
      </div>
    </Link>
  );
}
