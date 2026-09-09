import type { Inquiry } from "@/lib/inquiry-schema";

/**
 * Mirrors a contact-form inquiry into the leads Google Sheet through an Apps Script
 * web-app URL (`SHEETS_WEBHOOK_URL`). Best effort: never throws, never blocks the
 * user, silently skipped when the URL is not configured.
 *
 * The receiving script lives in `scripts/apps-script/inquiries.gs`.
 */
export async function postInquiryToSheet(inquiry: Inquiry, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return false;

  const payload = {
    secret: process.env.SHEETS_WEBHOOK_SECRET ?? "",
    receivedAt: new Date().toISOString(),
    ...inquiry,
  };

  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow", // Apps Script answers POSTs with a 302 to the result
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      console.error("[inquiry] sheet webhook responded", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[inquiry] sheet webhook failed", err);
    return false;
  }
}
