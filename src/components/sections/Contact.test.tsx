import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { ContactProvider, useContact } from "@/store/contact";
import { Contact } from "@/components/sections/Contact";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));
vi.mock("@/actions/inquiry", () => ({
  submitInquiry: vi.fn(async () => ({ status: "success" })),
}));

let open: ((p: { subject: string; source: "project" | "service" | "general" }) => void) | null = null;
function Grab() {
  const { openContact } = useContact();
  useEffect(() => {
    open = openContact;
  }, [openContact]);
  return null;
}

describe("Contact", () => {
  it("renders the form fields", () => {
    render(
      <ContactProvider>
        <Contact />
      </ContactProvider>,
    );
    expect(screen.getByLabelText("Name")).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Subject")).toBeTruthy();
    expect(screen.getByLabelText("Message")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Send message" })).toBeTruthy();
  });

  it("prefills subject and source from openContact", () => {
    render(
      <ContactProvider>
        <Grab />
        <Contact />
      </ContactProvider>,
    );
    act(() => open?.({ subject: "Nova SaaS Dashboard", source: "project" }));
    expect((screen.getByLabelText("Subject") as HTMLInputElement).value).toBe("Nova SaaS Dashboard");
    expect((document.querySelector('input[name="source"]') as HTMLInputElement).value).toBe("project");
  });
});
