import { projects } from "@/data/projects";
import { PROJECT_CATEGORIES, type Project, type ProjectCategory } from "@/lib/types";

// Phase 2: replace the bodies below with database queries. Keep signatures.

function sorted(): Project[] {
  return [...projects].sort((a, b) => a.order - b.order);
}

export async function getProjects(): Promise<Project[]> {
  return sorted();
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return sorted().filter((p) => p.featured);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return projects.find((p) => p.slug === slug);
}

export async function getRelatedProjects(slug: string, limit = 3): Promise<Project[]> {
  return sorted()
    .filter((p) => p.slug !== slug)
    .slice(0, limit);
}

export function getCategories(): { value: ProjectCategory; label: string }[] {
  return (Object.keys(PROJECT_CATEGORIES) as ProjectCategory[]).map((value) => ({
    value,
    label: PROJECT_CATEGORIES[value],
  }));
}

export function categoryLabel(category: ProjectCategory): string {
  return PROJECT_CATEGORIES[category];
}
