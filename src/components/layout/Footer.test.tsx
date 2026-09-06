import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/config/site";

describe("Footer", () => {
  it("shows the company name, nav links and email", () => {
    render(<Footer />);
    expect(screen.getAllByText(site.name).length).toBeGreaterThan(0);
    for (const item of site.nav) expect(screen.getByRole("link", { name: item.label })).toBeTruthy();
    expect(screen.getByRole("link", { name: site.email }).getAttribute("href")).toBe(`mailto:${site.email}`);
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeTruthy();
  });
});
