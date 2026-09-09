import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/config/site";
import { ContactProvider } from "@/store/contact";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

describe("Footer", () => {
  it("shows nav links, socials, email and the copyright line", () => {
    render(
      <ContactProvider>
        <Footer />
      </ContactProvider>,
    );
    for (const item of site.nav) expect(screen.getByRole("link", { name: item.label })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
    for (const s of site.socials) expect(screen.getByRole("link", { name: s.label }).getAttribute("href")).toBe(s.href);
    expect(screen.getByRole("link", { name: "Email" }).getAttribute("href")).toBe(`mailto:${site.email}`);
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} ${site.name}`))).toBeTruthy();
    expect(screen.getByRole("button", { name: /let's talk/i })).toBeTruthy();
  });
});
