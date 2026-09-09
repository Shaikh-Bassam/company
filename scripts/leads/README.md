# Lead batches → Google Sheet

1. Put researched leads in `scripts/leads/leads.json` (gitignored):
   `[{ "business", "phone", "website", "area", "src" }]`
2. `node scripts/leads/audit.mjs` — checks each website (status, HTTPS, mobile viewport, platform, footer year) → `audited.json`.
3. Optional `overrides.json` (gitignored) to hand-write `{ "Business": { "pitch", "note" } }` for special cases (see `overrides.example.json`).
4. `node scripts/leads/post.mjs [0,3,7]` — posts every (or the listed) lead to `SHEETS_WEBHOOK_URL` from `.env.local` as Source "Cold call", Status "New".

Batch 1 (2026-09-10): 39 plumbers / heating engineers, Greater Manchester, UK.
