import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Work } from "@/components/sections/Work";
import { projects } from "@/data/projects";

describe("Work", () => {
  it("lists every project and filters by category", () => {
    render(<Work projects={projects} />);
    for (const p of projects) expect(screen.getByText(p.title)).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "E-commerce" }));
    const ecommerce = projects.filter((p) => p.category === "ecommerce");
    const others = projects.filter((p) => p.category !== "ecommerce");
    for (const p of ecommerce) {
      expect(screen.getByRole("link", { name: new RegExp(p.title) }).getAttribute("href")).toBe(`/projects/${p.slug}`);
    }
    for (const p of others) expect(screen.queryByText(p.title)).toBeNull();
  });
});
