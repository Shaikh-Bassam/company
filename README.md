# Company website (phase 1: public site)

Dark-themed marketing site for a web studio that sells ready-made projects and builds custom sites.
Built with Next.js 16 (App Router), Tailwind v4, GSAP + Lenis, Resend.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | start the dev server on http://localhost:3000 |
| `npm run build` | production build (also prerenders every `/projects/[slug]`) |
| `npm test` | unit tests (Vitest + Testing Library) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` |
| `npm run placeholders` | regenerate SVG placeholder images in `public/projects/` from `src/data/projects.ts` |

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key. Leave empty in development to log inquiries to the terminal instead of emailing. |
| `CONTACT_TO_EMAIL` | Where contact-form inquiries are delivered |
| `CONTACT_FROM_EMAIL` | Sender shown on inquiry emails (must be a verified Resend sender) |
| `NEXT_PUBLIC_SITE_URL` | Absolute site URL, used for Open Graph metadata |

## Editing content

- Company name, tagline, nav, stats, socials, marquee: `src/config/site.ts`
- Services, offers ("Want a custom build?" …), process steps: `src/config/content.ts`
- Projects for sale: `src/data/projects.ts` (until the admin panel in phase 2 replaces it). Put real images in
  `public/projects/<slug>/` and update the `cover` / `gallery` paths.

## Structure

- `src/app` routes: `/` (landing), `/projects/[slug]` (detail), `not-found`
- `src/components/sections` landing sections, `src/components/layout` loader/nav/footer/smooth scroll,
  `src/components/project` project card/gallery/buy panel, `src/components/ui` primitives
- `src/actions/inquiry.ts` contact-form Server Action; `src/lib/projects.ts` data accessors (swap for DB in phase 2)

Design spec: `docs/superpowers/specs/2026-09-06-public-site-design.md`.

## Leads sheet (Google Sheets)

Every contact-form inquiry is emailed (Resend) and, when `SHEETS_WEBHOOK_URL` is set, also appended
to a Google Sheet so website leads and cold-calling leads live in one place.

1. Create a Google Sheet, open Extensions → Apps Script, paste `scripts/apps-script/inquiries.gs`.
2. Set `SECRET` in the script to a random string.
3. Deploy → New deployment → Web app → Execute as **Me**, access **Anyone** → copy the URL.
4. In Vercel add `SHEETS_WEBHOOK_URL=<that url>` and `SHEETS_WEBHOOK_SECRET=<the secret>`, redeploy.

Rows land in the `Leads` tab with Status `New`; the tab is created with headers on the first inquiry.
