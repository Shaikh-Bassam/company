# Company Website — Phase 1: Public Site (Design Spec)

Date: 2026-09-06
Status: Approved in chat, pending spec review

## 1. Goal

A dark-themed marketing site for the owner's web studio (company name not yet decided).
The site showcases sellable, ready-made projects and invites visitors to buy or
commission work through a contact form. Layout follows the Figma "Zaap — Landing Page 2"
frame; the preloader and motion feel follow jasminegunarto.com.

Phases (each gets its own spec/plan):

| Phase | Scope | Status |
|---|---|---|
| 1 | Public site: landing page, project detail pages, contact form (email), loader, animations | **this spec** |
| 2 | Backend: Postgres (Neon) + Prisma, admin login, projects CRUD with image upload, inquiries saved to DB | later |
| 3 | Split landing into separate pages (Home, Projects, Services, About, Contact) | later |

Phase 1 must be built so that phases 2 and 3 replace only the data source and routing,
never the section components.

## 2. Tech stack

- Next.js 16.3 (App Router, `src/` dir, TypeScript, Tailwind v4) — already scaffolded.
  Read `node_modules/next/dist/docs/` before implementing any Next API.
- Animation: `gsap` (+ ScrollTrigger, free) and `lenis` for smooth scroll.
- Fonts via `next/font/google`: **Anton** (display headings, uppercase, condensed heavy)
  and **Manrope** (body/UI).
- Email: `resend` SDK, called from a Server Action.
- Validation: `zod` for the contact form.
- Icons: `lucide-react`.
- Tests: `vitest` + `@testing-library/react`.
- Deploy target: Vercel.

Install command (one shot):
`npm i gsap @gsap/react lenis resend zod lucide-react` and
`npm i -D vitest @vitejs/plugin-react @testing-library/react jsdom`

## 3. Design system

Tokens live in `src/app/globals.css` under Tailwind v4 `@theme`.

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#0B0B0C` | page background |
| `--color-surface` | `#151517` | cards, nav pill |
| `--color-surface-2` | `#1E1E21` | hover / nested surfaces |
| `--color-border` | `rgba(255,255,255,0.08)` | hairlines, grid lines |
| `--color-fg` | `#F4F4F0` | primary text |
| `--color-muted` | `#8B8B93` | secondary text, labels |
| `--color-accent` | `#C6FF3F` | primary buttons, hover, loader counter, badges |
| `--color-accent-fg` | `#0B0B0C` | text on accent |

Type scale: display headings use Anton, `text-transform: uppercase`,
`line-height: 0.9`, `letter-spacing: -0.01em`, clamp from 3rem (mobile) to 9rem (hero).
Body uses Manrope 16px / 1.6. Small labels (badges, "Zaap / 2026"-style meta) are
Manrope 12px uppercase tracking 0.08em, muted.

Radius: 16px cards, 999px pills. Buttons: pill, accent bg, 44px min height.

Motion rules: every entrance animation respects `prefers-reduced-motion` (skip loader
counter, show content instantly). GSAP contexts are created inside `useGSAP` and
reverted on unmount.

## 4. Site configuration

`src/config/site.ts` exports a single object so the company name and copy change in one place:

```ts
export const site = {
  name: "STUDIO",              // placeholder until decided
  tagline: "Ready-made. Custom-built.",
  location: "Karachi, PK",     // shown top-left like the reference site (owner can edit)
  email: "hello@example.com",
  socials: { instagram: "", linkedin: "", x: "", github: "" },
  nav: [ { label: "Work", href: "#work" }, { label: "Services", href: "#services" }, { label: "About", href: "#about" } ],
  stats: [ { value: "25+", label: "Projects" }, { value: "40+", label: "Clients" }, { value: "5+", label: "Years" } ],
};
```

## 5. Data model

### Project (`src/data/projects.ts` in phase 1; becomes DB table in phase 2)

```ts
type ProjectCategory = "web-app" | "ecommerce" | "landing" | "dashboard";

interface Project {
  slug: string;            // URL id
  title: string;
  category: ProjectCategory;
  tagline: string;         // one line under title
  description: string;     // paragraphs, plain text with \n\n
  features: string[];      // bullet list on detail page
  tech: string[];          // e.g. ["Next.js", "Stripe"]
  cover: string;           // /projects/<slug>/cover.jpg
  gallery: string[];       // 2–4 images
  featured: boolean;       // appears in Featured Work section
  order: number;           // sort in grid
}
```

`src/lib/projects.ts` exposes `getProjects()`, `getFeaturedProjects()`, `getProject(slug)`,
`getCategories()`. All are `async` from day one so phase 2 can swap the body for DB
queries without touching callers. Components only import from `src/lib/projects.ts`.

Seed: 6 placeholder projects (covering all 4 categories, 3 featured) with placeholder
images in `public/projects/`. Owner replaces later.

### Inquiry (contact form payload)

```ts
interface Inquiry {
  name: string;        // 2–80 chars
  email: string;       // valid email
  subject: string;     // pre-filled: project title or service name, editable
  message: string;     // 10–2000 chars
  source: "project" | "service" | "general";
}
```

## 6. Routes

| Route | Type | Notes |
|---|---|---|
| `/` | static | landing page, all sections |
| `/projects/[slug]` | static, `generateStaticParams` from `getProjects()` | detail page; `notFound()` for unknown slug |
| `not-found.tsx` | | dark 404 with link home |
| Server Action `submitInquiry` | `src/actions/inquiry.ts` | validates with zod, sends email via Resend |

Metadata: `generateMetadata` on both routes (title, description, OG image from cover).
Root layout sets `<html lang="en">`, fonts, `SmoothScroll` provider, `ContactProvider`, `Loader`.

## 7. Landing page sections (top to bottom)

Each section is its own component in `src/components/sections/`. Each receives data via
props only (no data fetching inside), so phase 3 can drop them into separate pages.

1. **Loader** (`Loader.tsx`, client) — fixed full-screen `bg` overlay. Center: counter
   `000 → 100` in Anton accent colour; below it the company name split into letters that
   rise in with stagger. When counter hits 100 the overlay slides up (`yPercent: -100`)
   and hero animates in. Runs once per session (`sessionStorage` flag); skipped under
   reduced motion. Duration ~2.2s total.
2. **Navbar** (`Navbar.tsx`, client) — floating pill, `surface` bg + border, blur. Left:
   logo (company name, Anton). Center: nav links. Right: "Contact" accent button that
   scrolls to `#contact`. Collapses to logo + Contact + hamburger under 768px; hamburger
   opens full-screen menu.
3. **Hero** (`Hero.tsx`) — top-left small badge "Web Studio". Left: two-line display
   headline `READY-MADE. / CUSTOM-BUILT.` (from `site.tagline` split on `. `). Right:
   paragraph, accent CTA "See our work" (→ `#work`), 3 stats from `site.stats`. Below:
   meta row (`site.name` left, year right), centre showcase image (first featured
   project cover) flanked by display words `DESIGN` and `DEVELOP`. Subtle hairline grid
   lines behind, like Figma. Entrance: headline lines clip-reveal, image scales from 1.1.
4. **Marquee** (`Marquee.tsx`) — hairline top/bottom borders, infinite horizontal GSAP
   marquee of tech/platform names with dot separators (Next.js, React, Shopify,
   WordPress, Tailwind, Node.js, Figma, Vercel). Pauses on hover.
5. **What We Do** (`Services.tsx`, `id="about"`) — centred display heading
   `IT JUST WORKS. / FOR YOU.` then 2×2 bento (stacks to 1 col on mobile): Ready-made
   Projects, Custom Builds, Redesigns, Maintenance & Support. Each card: small badge,
   title, 1–2 line body, decorative accent shape. Cards fade-up on scroll.
6. **Have a Project in Mind?** (`Offers.tsx`, `id="services"`) — the requested
   scrollable section. Desktop: left column pinned (GSAP `pin`) with display heading
   `HAVE A PROJECT / IN MIND?`; right column scrolls 4 tall cards: "Want a custom
   build?", "Want to redesign your existing site?", "Want a ready-made project?",
   "Need ongoing support?". Each card: number, heading, 2-line body, "Let's talk" button
   → opens contact with `subject` prefilled and `source: "service"`. Mobile: no pin,
   cards stack.
7. **Featured Work** (`FeaturedWork.tsx`) — display heading `SEE EVERYTHING. / PICK
   ANYTHING.`, pill tabs (All + categories). Tab click swaps the large preview image
   below with a crossfade; preview shows title, category, and "View project" link.
   Tabs filter the featured projects passed in; state is client-side.
8. **Projects Grid** (`ProjectsGrid.tsx`, `id="work"`) — left-aligned display heading
   `PROJECTS / FOR SALE`. 3-col grid (2 on tablet, 1 on mobile) of all projects.
   Card: cover (hover scale 1.05), title, category badge, tech chips, footer text
   "Want to buy? Contact us →". Whole card links to `/projects/[slug]`.
9. **How It Works** (`Process.tsx`) — 3 numbered steps in a row: Pick a project →
   Contact us → We customise & deliver. Replaces Figma's monetization section.
10. **Contact** (`Contact.tsx`, `id="contact"`, client form) — display heading
    `LET'S BUILD / SOMETHING.` Form: name, email, subject (prefilled when opened from a
    CTA), message, submit. Uses `useActionState` with `submitInquiry`. States: idle,
    pending (button disabled, spinner), success (inline "Thanks, we'll reply within
    24h"), error (inline message, form values kept). Honeypot hidden field.
11. **Footer** (`Footer.tsx`) — accent-coloured block like Figma's purple footer but in
    `accent` with `accent-fg` text: display heading `READY TO BUILD / SOMETHING BIGGER?`,
    link columns (Site, Services, Socials), copyright, then the giant company name
    clipped at the bottom edge.

Prefill mechanism: `src/store/contact.tsx` is a React context holding
`{ subject, source }` with `openContact({ subject, source })`. On the landing page,
CTAs call `openContact` which sets the store and smooth-scrolls to `#contact`. On the
detail page, the buy button links to `/?subject=<title>&source=project#contact`; the
Contact form reads those search params on mount (client-side, `useSearchParams`) and
scrolls itself into view.

## 8. Project detail page

Route `src/app/projects/[slug]/page.tsx` (server). Layout:

- Back link "← All projects".
- Display title, category badge, tagline.
- Cover image full-width, 16:9, rounded.
- Two columns: left description paragraphs and features list; right sticky panel with
  tech chips and a large accent button "Want to buy? Contact us" → `/?subject=…&source=project#contact`.
- Gallery: 2-col grid of remaining images.
- "More projects": 3 other project cards (reuses `ProjectCard`).

## 9. Contact form backend (phase 1)

`src/actions/inquiry.ts` (`"use server"`):

1. Parse `FormData` with zod schema from §5. On failure return `{ ok: false, errors }`.
2. If honeypot field is non-empty return `{ ok: true }` silently.
3. Send email with Resend: `from: CONTACT_FROM_EMAIL`, `to: CONTACT_TO_EMAIL`,
   `replyTo: inquiry.email`, subject `[Site] ${subject}`, plain-text body with all fields.
4. Return `{ ok: true }` or `{ ok: false, errors: { form: "Could not send. Email us at …" } }`
   on Resend failure (log the error server-side).

Env vars (`.env.example` committed, `.env.local` ignored):
`RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`.
If `RESEND_API_KEY` is missing in development, log the inquiry to the console and return
success so the UI can be tested without a key.

## 10. Folder structure

```
src/
  app/
    layout.tsx  page.tsx  not-found.tsx  globals.css
    projects/[slug]/page.tsx
  actions/inquiry.ts
  components/
    ui/        Button.tsx  Badge.tsx  Chip.tsx  Container.tsx  DisplayHeading.tsx
    layout/    Navbar.tsx  Footer.tsx  Loader.tsx  SmoothScroll.tsx
    sections/  Hero.tsx  Marquee.tsx  Services.tsx  Offers.tsx  FeaturedWork.tsx
               ProjectsGrid.tsx  Process.tsx  Contact.tsx
    project/   ProjectCard.tsx  ProjectGallery.tsx  BuyPanel.tsx
  config/site.ts
  data/projects.ts
  lib/projects.ts  lib/inquiry-schema.ts  lib/gsap.ts (plugin registration)
  store/contact.tsx
public/projects/<slug>/cover.jpg ...
```

## 11. Responsiveness & accessibility

- Breakpoints: mobile-first; `md` 768, `lg` 1024, `xl` 1280. Container max 1220px
  (Figma content width) with 24px side padding on mobile.
- All images through `next/image` with explicit sizes; covers 16:9.
- Focus-visible rings in accent; form fields labelled; nav is keyboard operable.
- `prefers-reduced-motion`: loader skipped, GSAP animations replaced by instant state,
  marquee static, Lenis disabled.

## 12. Error handling

- Unknown slug → `notFound()`.
- Server Action errors surface inline; never throw to the client.
- Missing images fall back to a `surface-2` placeholder block with the project title.
- GSAP/Lenis only run on the client; components guard against SSR.

## 13. Verification

- `npm run lint` and `npm run build` pass (build also proves every slug prerenders).
- Unit tests (Vitest): zod schema (valid/invalid cases), `lib/projects` helpers,
  `submitInquiry` with Resend mocked (success, failure, honeypot, missing key).
- Manual checklist recorded in the plan: loader runs once, sections match Figma order,
  pinned section behaves at 1440 and 375 widths, contact prefill from each CTA, form
  states, reduced-motion path, Lighthouse accessibility ≥ 90.

## 14. Out of scope (phase 1)

Admin panel, database, image upload, auth, newsletter, testimonials, app-store section,
blog, analytics, i18n, real project content and real company name.
