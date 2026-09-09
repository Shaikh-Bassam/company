// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { postInquiryToSheet } from "@/lib/inquiry-sheet";

const inquiry = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Nova SaaS Dashboard",
  message: "I would like to buy this project for my startup.",
  source: "project" as const,
};

describe("postInquiryToSheet", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("does nothing when the webhook URL is not configured", async () => {
    vi.stubEnv("SHEETS_WEBHOOK_URL", "");
    const fetchMock = vi.fn();
    expect(await postInquiryToSheet(inquiry, fetchMock)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts the inquiry as JSON with the shared secret", async () => {
    vi.stubEnv("SHEETS_WEBHOOK_URL", "https://script.google.com/macros/s/abc/exec");
    vi.stubEnv("SHEETS_WEBHOOK_SECRET", "s3cret");
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    expect(await postInquiryToSheet(inquiry, fetchMock)).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("script.google.com");
    expect(init.method).toBe("POST");
    const body = JSON.parse(String(init.body));
    expect(body.secret).toBe("s3cret");
    expect(body.name).toBe("Ada Lovelace");
    expect(body.source).toBe("project");
    expect(typeof body.receivedAt).toBe("string");
  });

  it("swallows network errors and non-2xx responses", async () => {
    vi.stubEnv("SHEETS_WEBHOOK_URL", "https://script.google.com/macros/s/abc/exec");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await postInquiryToSheet(inquiry, vi.fn(async () => new Response("nope", { status: 500 })))).toBe(false);
    expect(
      await postInquiryToSheet(
        inquiry,
        vi.fn(async () => {
          throw new Error("offline");
        }),
      ),
    ).toBe(false);
    expect(errorSpy).toHaveBeenCalledTimes(2);
    errorSpy.mockRestore();
  });
});
