import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Offers } from "@/components/sections/Offers";
import { offers } from "@/config/content";

const openContact = vi.fn();
vi.mock("@/store/contact", () => ({ useContact: () => ({ prefill: null, openContact }) }));

describe("Offers", () => {
  it("renders every offer as a button that prefills the contact form", () => {
    render(<Offers />);
    for (const offer of offers) expect(screen.getByText(offer.title)).toBeTruthy();
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(offers.length);
    fireEvent.click(buttons[1]);
    expect(openContact).toHaveBeenCalledWith({ subject: offers[1].title, source: "service" });
  });
});
