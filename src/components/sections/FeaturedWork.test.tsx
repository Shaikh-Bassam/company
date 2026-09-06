import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { projects } from "@/data/projects";

describe("FeaturedWork", () => {
  const featured = projects.filter((p) => p.featured);

  it("shows the first featured project and filters by category tab", () => {
    render(<FeaturedWork projects={featured} />);
    expect(screen.getByRole("heading", { level: 3, name: featured[0].title })).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "E-commerce" }));
    const ecommerce = featured.find((p) => p.category === "ecommerce")!;
    expect(screen.getByRole("heading", { level: 3, name: ecommerce.title })).toBeTruthy();
    expect(screen.getByRole("link", { name: /view project/i }).getAttribute("href")).toBe(`/projects/${ecommerce.slug}`);
  });
});
