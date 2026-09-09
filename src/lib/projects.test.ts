import { describe, expect, it } from "vitest";
import {
  categoryLabel,
  getCategories,
  getFeaturedProjects,
  getProject,
  getProjects,
  getRelatedProjects,
} from "@/lib/projects";

describe("projects", () => {
  it("returns projects sorted by order with unique slugs", async () => {
    const projects = await getProjects();
    expect(projects.length).toBeGreaterThanOrEqual(6);
    const orders = projects.map((p) => p.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
  });

  it("every project has images under its own folder", async () => {
    for (const p of await getProjects()) {
      expect(p.cover.startsWith(`/projects/${p.slug}/`)).toBe(true);
      expect(p.gallery.length).toBeGreaterThanOrEqual(2);
      for (const g of p.gallery) expect(g.startsWith(`/projects/${p.slug}/`)).toBe(true);
    }
  });

  it("featured projects are all featured", async () => {
    const featured = await getFeaturedProjects();
    expect(featured.length).toBeGreaterThanOrEqual(3);
    expect(featured.every((p) => p.featured)).toBe(true);
  });

  it("finds a project by slug and returns undefined for unknown", async () => {
    const [first] = await getProjects();
    expect((await getProject(first.slug))?.title).toBe(first.title);
    expect(await getProject("nope")).toBeUndefined();
  });

  it("related excludes the current project", async () => {
    const [first] = await getProjects();
    const related = await getRelatedProjects(first.slug);
    expect(related).toHaveLength(3);
    expect(related.some((p) => p.slug === first.slug)).toBe(false);
  });

  it("exposes category labels", () => {
    expect(getCategories().map((c) => c.value)).toEqual(["web-app", "ecommerce", "landing", "dashboard"]);
    expect(categoryLabel("ecommerce")).toBe("E-commerce");
  });
});
