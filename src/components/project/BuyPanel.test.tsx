import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BuyPanel } from "@/components/project/BuyPanel";
import { projects } from "@/data/projects";

const openContact = vi.fn();
vi.mock("@/store/contact", () => ({ useContact: () => ({ prefill: null, openContact }) }));

describe("BuyPanel", () => {
  it("lists tech and opens contact prefilled with the project title", () => {
    const project = projects[0];
    render(<BuyPanel project={project} />);
    for (const t of project.tech) expect(screen.getByText(t)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Want to buy? Contact us" }));
    expect(openContact).toHaveBeenCalledWith({ subject: project.title, source: "project" });
  });
});
