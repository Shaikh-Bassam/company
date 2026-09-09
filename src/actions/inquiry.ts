"use server";

import { Resend } from "resend";
import { z } from "zod";
import { site } from "@/config/site";
import { inquirySchema, type Inquiry, type InquiryField, type InquiryState } from "@/lib/inquiry-schema";

const FIELDS: InquiryField[] = ["name", "email", "subject", "message", "source"];

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  // Honeypot: real users never see or fill this field.
  if (String(formData.get("company") ?? "").length > 0) return { status: "success" };

  const raw = Object.fromEntries(FIELDS.map((f) => [f, String(formData.get(f) ?? "")])) as Record<InquiryField, string>;

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;
    const errors: InquiryState["errors"] = {};
    for (const field of FIELDS) {
      const first = fieldErrors[field]?.[0];
      if (first) errors[field] = first;
    }
    return { status: "error", errors, values: raw };
  }

  try {
    await sendInquiryEmail(parsed.data);
    return { status: "success" };
  } catch (err) {
    console.error("[inquiry] send failed", err);
    return {
      status: "error",
      errors: { form: `Could not send your message. Please email us at ${site.email}.` },
      values: raw,
    };
  }
}

async function sendInquiryEmail(inquiry: Inquiry): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  const text = [
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Source: ${inquiry.source}`,
    `Subject: ${inquiry.subject}`,
    "",
    inquiry.message,
  ].join("\n");

  if (!apiKey || !to || !from) {
    if (process.env.NODE_ENV === "production") throw new Error("Email is not configured");
    console.info("[inquiry] email not configured, logging instead:\n" + text);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: inquiry.email,
    subject: `[Site] ${inquiry.subject}`,
    text,
  });
  if (error) throw new Error(error.message);
}
