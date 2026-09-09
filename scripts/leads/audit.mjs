// Quick website audit for each lead: reachable? https? mobile viewport? platform? footer year?
import { readFileSync, writeFileSync } from "node:fs";
const leads = JSON.parse(readFileSync(new URL("./leads.json", import.meta.url), "utf8"));

async function audit(url) {
  if (!url) return { status: "none", note: "No website" };
  const out = { status: "", https: url.startsWith("https"), platform: "", mobile: false, year: "", title: "" };
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(12000),
      headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128 Safari/537.36" } });
    out.status = res.status;
    out.https = res.url.startsWith("https");
    const html = (await res.text()).slice(0, 400000);
    out.title = (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim().slice(0, 80);
    out.mobile = /<meta[^>]+name=["']viewport["']/i.test(html);
    const gen = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i)?.[1];
    if (gen) out.platform = gen.split(" ")[0];
    else if (/wp-content|wp-includes/i.test(html)) out.platform = "WordPress";
    else if (/static\.wixstatic|wix\.com/i.test(html)) out.platform = "Wix";
    else if (/squarespace/i.test(html)) out.platform = "Squarespace";
    else if (/godaddy|websitebuilder/i.test(html)) out.platform = "GoDaddy builder";
    else if (/yell\.com|yellbusiness/i.test(html)) out.platform = "Yell-built";
    else if (/business\.site/.test(res.url)) out.platform = "Google Business Site (discontinued)";
    const years = [...html.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(20\d{2})/gi)].map(m => +m[1]);
    if (years.length) out.year = String(Math.max(...years));
  } catch (e) {
    out.status = "error";
    out.err = String(e.cause?.code ?? e.name ?? e.message).slice(0, 40);
  }
  return out;
}

const results = [];
for (const l of leads) {
  const a = await audit(l.website);
  results.push({ ...l, audit: a });
  console.log(l.business.padEnd(42), l.website ? `${a.status} https=${a.https} mobile=${a.mobile} ${a.platform} ${a.year} ${a.err ?? ""}` : "NO WEBSITE");
}
writeFileSync(new URL("./audited.json", import.meta.url), JSON.stringify(results, null, 2));
