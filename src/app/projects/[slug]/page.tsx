import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyPanel } from "@/components/project/BuyPanel";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectGallery } from "@/components/project/ProjectGallery";
import { Badge } from "@/components/ui/Badge";
import { FitText } from "@/components/ui/FitText";
import { categoryLabel, getProject, getProjects, getRelatedProjects } from "@/lib/projects";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
    openGraph: { title: project.title, description: project.tagline, images: [project.cover] },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const related = await getRelatedProjects(slug);

  return (
    <article className="px-5 pb-24 pt-20 md:px-7 md:pt-24">
      <Link href="/#work" className="eyebrow text-muted transition-colors hover:text-fg">
        ← All projects
      </Link>
      <FitText as="h1" lines={[project.title]} max={280} className="mt-6" />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <p className="max-w-xl text-muted">{project.tagline}</p>
        <Badge>{categoryLabel(project.category)}</Badge>
      </div>

      <div className="relative mt-10 aspect-video overflow-hidden rounded-sm bg-surface">
        <Image src={project.cover} alt={project.title} fill priority sizes="100vw" className="object-cover" />
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
        <div className="space-y-12">
          <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-muted">
            {project.description.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <div className="border-t border-line pt-6">
            <p className="eyebrow text-muted">What&apos;s included</p>
            <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {project.features.map((f) => (
                <li key={f} className="border-b border-line pb-3 text-base">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <BuyPanel project={project} />
      </div>

      <ProjectGallery images={project.gallery} title={project.title} />

      <section className="mt-24 border-t border-line pt-6">
        <p className="eyebrow text-muted">More projects</p>
        <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </section>
    </article>
  );
}
