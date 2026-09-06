import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyPanel } from "@/components/project/BuyPanel";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectGallery } from "@/components/project/ProjectGallery";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
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
    <article className="pb-24 pt-36">
      <Container>
        <Link href="/#work" className="eyebrow transition-colors hover:text-fg">
          ← All projects
        </Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <DisplayHeading as="h1" lines={[project.title]} />
          <Badge>{categoryLabel(project.category)}</Badge>
        </div>
        <p className="mt-4 max-w-2xl text-lg text-muted">{project.tagline}</p>

        <div className="relative mt-12 aspect-video overflow-hidden rounded-card border border-line bg-surface-2">
          <Image
            src={project.cover}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 1220px) 100vw, 1220px"
            className="object-cover"
          />
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-10">
            <div className="space-y-4 text-lg text-muted">
              {project.description.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">What&apos;s included</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {project.features.map((f) => (
                  <li key={f} className="flex gap-3 text-muted">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <BuyPanel project={project} />
        </div>

        <ProjectGallery images={project.gallery} title={project.title} />

        <section className="mt-24">
          <h2 className="display text-4xl">More projects</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
      </Container>
    </article>
  );
}
