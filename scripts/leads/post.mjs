// Push audited leads into the Google Sheet through the Apps Script webhook.
import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(new URL("../../.env.local", import.meta.url), "utf8")
  .split(/\r?\n/).filter(l => l.includes("=") && !l.startsWith("#")).map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
const url = env.SHEETS_WEBHOOK_URL, secret = env.SHEETS_WEBHOOK_SECRET;
if (!url) throw new Error("SHEETS_WEBHOOK_URL missing");

const leads = JSON.parse(readFileSync(new URL("./audited.json", import.meta.url), "utf8"));
const overrides = JSON.parse(readFileSync(new URL("./overrides.json", import.meta.url), "utf8"));
const only = process.argv[2] ? new Set(process.argv[2].split(",").map(Number)) : null; // optional index filter

function describe(l) {
  const a = l.audit, o = overrides[l.business] ?? {};
  if (o.note) return o;
  if (!l.website) return { pitch: "New website", note: "No website found. Pitch: 5-page site + Google Business setup." };
  if (a.status === 404 || a.err) return { pitch: "New website", note: `Website down/broken (${a.status}${a.err ? " " + a.err : ""}). Pitch: replace with a fast site.` };
  const bits = [];
  if (!a.mobile) bits.push("not mobile-friendly");
  if (!a.https) bits.push("no HTTPS");
  if (a.platform && /yell|business site|wix|godaddy/i.test(a.platform)) bits.push(`built on ${a.platform}`);
  if (a.year && +a.year <= 2023) bits.push(`copyright ${a.year}`);
  const pitch = bits.length ? "Redesign" : "Redesign / support";
  const note = bits.length ? `Site issues: ${bits.join(", ")}. Pitch: redesign.` : `Site OK (${a.platform || "custom"}). Pitch: speed/SEO + monthly support.`;
  return { pitch, note };
}

let ok = 0, fail = 0;
for (const [i, l] of leads.entries()) {
  if (only && !only.has(i)) continue;
  const { pitch, note } = describe(l);
  const payload = {
    secret, receivedAt: new Date().toISOString(),
    business: l.business, name: "", phone: l.phone, email: "", website: l.website,
    niche: "Trades", location: `${l.area}, UK`, origin: "Cold call", status: "New",
    subject: pitch, nextAction: "Cold call (UK 10:00-16:00 = PK 14:00-20:00)",
    message: `${note} Found via ${l.src}.`,
  };
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), redirect: "follow", signal: AbortSignal.timeout(20000) });
    const text = await res.text();
    const good = res.ok && text.includes('"ok":true');
    good ? ok++ : fail++;
    console.log(good ? "OK  " : "FAIL", i, l.business, good ? "" : text.slice(0, 120));
  } catch (e) { fail++; console.log("FAIL", i, l.business, e.message); }
}
console.log(`\n${ok} posted, ${fail} failed`);
