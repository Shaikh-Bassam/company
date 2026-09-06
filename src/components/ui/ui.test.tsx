import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins truthy classes", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
});

describe("Button", () => {
  it("renders a link when href is given", () => {
    render(<Button href="/projects/x">Open</Button>);
    expect(screen.getByRole("link", { name: "Open" }).getAttribute("href")).toBe("/projects/x");
  });
  it("renders a button otherwise", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button", { name: "Send" }).getAttribute("type")).toBe("submit");
  });
});

describe("DisplayHeading", () => {
  it("renders each line wrapped for animation", () => {
    const { container } = render(<DisplayHeading as="h1" lines={["Ready-made.", "Custom-built."]} />);
    expect(container.querySelector("h1")).not.toBeNull();
    expect(container.querySelectorAll("[data-line]")).toHaveLength(2);
    expect(container.textContent).toContain("Custom-built.");
  });
});
