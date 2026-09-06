import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { offers, processSteps, services } from "@/config/content";

describe("site config", () => {
  it("has a name and tagline with two sentences", () => {
    expect(site.name.length).toBeGreaterThan(0);
    expect(site.tagline.split(". ").length).toBe(2);
  });
  it("nav links are in-page anchors", () => {
    for (const item of site.nav) expect(item.href.startsWith("#")).toBe(true);
  });
  it("content lists are populated", () => {
    expect(services).toHaveLength(4);
    expect(offers).toHaveLength(4);
    expect(processSteps).toHaveLength(3);
  });
});
