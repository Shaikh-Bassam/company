// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

import { submitInquiry } from "@/actions/inquiry";
import { initialInquiryState } from "@/lib/inquiry-schema";

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Nova SaaS Dashboard",
  message: "I would like to buy this project for my startup.",
  source: "project",
};

describe("submitInquiry", () => {
  beforeEach(() => {
    send.mockReset();
    send.mockResolvedValue({ data: { id: "1" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("CONTACT_TO_EMAIL", "owner@example.com");
    vi.stubEnv("CONTACT_FROM_EMAIL", "Site <site@example.com>");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("returns field errors for invalid input and keeps values", async () => {
    const state = await submitInquiry(initialInquiryState, form({ ...valid, email: "nope", message: "short" }));
    expect(state.status).toBe("error");
    expect(state.errors?.email).toBeTruthy();
    expect(state.errors?.message).toBeTruthy();
    expect(state.values?.name).toBe("Ada Lovelace");
    expect(send).not.toHaveBeenCalled();
  });

  it("silently succeeds when the honeypot is filled", async () => {
    const state = await submitInquiry(initialInquiryState, form({ ...valid, company: "bot" }));
    expect(state.status).toBe("success");
    expect(send).not.toHaveBeenCalled();
  });

  it("sends an email with reply-to set to the sender", async () => {
    const state = await submitInquiry(initialInquiryState, form(valid));
    expect(state.status).toBe("success");
    expect(send).toHaveBeenCalledTimes(1);
    const arg = send.mock.calls[0][0];
    expect(arg.to).toBe("owner@example.com");
    expect(arg.replyTo).toBe("ada@example.com");
    expect(arg.subject).toBe("[Site] Nova SaaS Dashboard");
    expect(arg.text).toContain("I would like to buy");
  });

  it("falls back to an unknown source as general", async () => {
    await submitInquiry(initialInquiryState, form({ ...valid, source: "weird" }));
    expect(send.mock.calls[0][0].text).toContain("Source: general");
  });

  it("returns a form error when sending fails", async () => {
    send.mockResolvedValue({ data: null, error: { message: "boom", name: "api_error" } });
    const state = await submitInquiry(initialInquiryState, form(valid));
    expect(state.status).toBe("error");
    expect(state.errors?.form).toContain("Could not send");
    expect(state.values?.email).toBe("ada@example.com");
  });

  it("logs instead of sending when email is not configured outside production", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const state = await submitInquiry(initialInquiryState, form(valid));
    expect(state.status).toBe("success");
    expect(send).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalled();
    info.mockRestore();
  });
});
