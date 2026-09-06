# Public Site (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the dark-themed public marketing site (landing page, project detail pages, contact form emailed via Resend, loader and scroll animations) described in the spec.

**Architecture:** Next.js 16 App Router with `src/`. Landing page is a server component that loads projects from `src/lib/projects.ts` (static data now, DB later) and passes them as props to section components. Client-only concerns (GSAP, Lenis, forms, contact prefill) live in `"use client"` components; a React context (`ContactProvider`) carries prefill data from any CTA to the contact form and handles cross-page navigation. Email sending is a Server Action validated with zod.

**Tech Stack:** Next.js 16.3.4, React 19.2, TypeScript, Tailwind v4, gsap + @gsap/react, lenis, resend, zod 4, lucide-react, vitest + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-09-06-public-site-design.md`

## Global Constraints

- Next.js is **16.3.4** — before using any Next API, read the matching file in `node_modules/next/dist/docs/01-app/`. `params` is a Promise; use global `PageProps<'/route'>` / `LayoutProps<'/'>` helpers (no import). Run `npx next typegen` before `tsc --noEmit`.
- Tailwind **v4**: tokens are declared in `@theme` in `src/app/globals.css`; no `tailwind.config` file. Gradient utilities are `bg-linear-to-*`.
- Colors (exact): bg `#0B0B0C`, surface `#151517`, surface-2 `#1E1E21`, line `rgba(255,255,255,0.08)`, fg `#F4F4F0`, muted `#8B8B93`, accent `#C6FF3F`, accent-fg `#0B0B0C`.
- Fonts: **Anton** (display, uppercase) and **Manrope** (body) via `next/font/google`.
- Company name placeholder is **`STUDIO`**; all copy comes from `src/config/site.ts` and `src/config/content.ts`. Never hardcode the name in components.
- No prices anywhere. Every project CTA reads **"Want to buy? Contact us"**.
- All animations must be skipped when `prefers-reduced-motion: reduce`.
- GSAP/Lenis code only in `"use client"` files; import gsap only through `src/lib/gsap.ts`.
- Files with `"use server"` may export **only async functions** (types are fine, constants are not).
- Commit after every task with the message given. Keep `npm run lint`, `npm test`, and `npm run build` green.
- Working directory: `d:\bassam-work\co\website` (Windows, PowerShell or Git Bash).
- Deviations from the spec, agreed here: the pinned column in Offers uses CSS `position: sticky` instead of a GSAP pin (same visual, fewer failure modes with Lenis); the design token for hairlines is `--color-line` (`border-line`) instead of `--color-border`.

---

## File map

| Path | Responsibility |
|---|---|
| `vitest.config.mts`, `.env.example` | tooling |
| `src/config/site.ts` | company name, nav, stats, socials, marquee items |
| `src/config/content.ts` | services, offers, process steps copy |
| `src/app/globals.css` | Tailwind theme tokens, `display` / `eyebrow` utilities, base styles |
| `src/app/layout.tsx` | fonts, metadata, providers, Loader, Navbar, Footer |
| `src/app/page.tsx` | landing page assembly |
| `src/app/projects/[slug]/page.tsx` | project detail page |
| `src/app/not-found.tsx` | 404 |
| `src/lib/cn.ts` | class joiner |
| `src/lib/types.ts` | `Project`, `ProjectCategory`, `InquirySource`, category labels |
| `src/lib/projects.ts` | async project accessors (swap body for DB in phase 2) |
| `src/lib/inquiry-schema.ts` | zod schema, `InquiryState`, `initialInquiryState` |
| `src/lib/scroll.ts` | `registerScroller`, `scrollToId` |
| `src/lib/gsap.ts` | gsap + ScrollTrigger + useGSAP registration, `prefersReducedMotion()` |
| `src/lib/loader-events.ts` | `LOADER_DONE_EVENT`, `useLoaderDone` |
| `src/lib/use-reveal.ts` | scroll fade-up hook |
| `src/data/projects.ts` | 6 seed projects |
| `src/actions/inquiry.ts` | `submitInquiry` Server Action |
| `src/store/contact.tsx` | `ContactProvider`, `useContact` |
| `src/components/ui/*` | `Container`, `Button`, `Badge`, `Chip`, `DisplayHeading` |
| `src/components/layout/*` | `SmoothScroll`, `Loader`, `Navbar`, `Footer` |
| `src/components/sections/*` | `Hero`, `Marquee`, `Services`, `Offers`, `FeaturedWork`, `ProjectsGrid`, `Process`, `Contact` |
| `src/components/project/*` | `ProjectCard`, `ProjectGallery`, `BuyPanel` |
| `scripts/make-placeholders.mjs` | generates SVG placeholder images into `public/projects/` |

---

### Task 1: Tooling, test runner, site config

**Files:**
- Create: `vitest.config.mts`, `.env.example`, `src/config/site.ts`, `src/config/content.ts`, `src/config/site.test.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: `site` object (`name`, `tagline`, `description`, `location`, `email`, `url`, `socials[]`, `nav[]`, `stats[]`, `marquee[]`), `services[]`, `offers[]`, `processSteps[]`.

- [ ] **Step 1: Install dependencies**

```bash
npm i gsap @gsap/react lenis resend zod@4 lucide-react
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom
```

- [ ] **Step 2: Add vitest config**

`vitest.config.mts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { environment: "jsdom", include: ["src/**/*.test.{ts,tsx}"], setupFiles: ["./vitest.setup.ts"] },
});
```

`vitest.setup.ts` (jsdom has no `matchMedia`; report reduced motion so GSAP code paths are skipped in unit tests):
```ts
import { vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

- [ ] **Step 3: Add scripts to `package.json`**

Replace the `scripts` block with:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "next typegen && tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "placeholders": "node scripts/make-placeholders.mjs"
}
```

- [ ] **Step 4: Add `.env.example`**

```
# Resend (https://resend.com) — leave empty in dev to log inquiries to the console instead
RESEND_API_KEY=
CONTACT_TO_EMAIL=you@example.com
CONTACT_FROM_EMAIL=Website <onboarding@resend.dev>
# Used for absolute OG URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 5: Write failing test `src/config/site.test.ts`**

```ts
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
```

- [ ] **Step 6: Run test, expect failure**

Run: `npm test`
Expected: FAIL — cannot resolve `@/config/site`.

- [ ] **Step 7: Create `src/config/site.ts`**

```ts
export const site = {
  name: "STUDIO",
  tagline: "Ready-made. Custom-built.",
  description:
    "A web studio selling ready-made web projects and building custom sites, apps and redesigns.",
  location: "Karachi, PK",
  email: "hello@example.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "X", href: "https://x.com" },
    { label: "GitHub", href: "https://github.com" },
  ],
  nav: [
    { label: "Work", href: "#work" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
  ],
  stats: [
    { value: "25+", label: "Projects" },
    { value: "40+", label: "Clients" },
    { value: "5+", label: "Years" },
  ],
  marquee: ["Next.js", "React", "Shopify", "WordPress", "Tailwind", "Node.js", "Figma", "Vercel"],
} as const;
```

- [ ] **Step 8: Create `src/config/content.ts`**

```ts
export const services = [
  {
    badge: "Ready-made",
    title: "Ready-made Projects",
    body: "Pick a finished product from our catalogue. We rebrand, configure and deploy it for you.",
  },
  {
    badge: "Custom",
    title: "Custom Builds",
    body: "Web apps, e-commerce and landing pages designed and built from scratch around your goals.",
  },
  {
    badge: "Redesign",
    title: "Redesigns",
    body: "Already have a site? We modernise the design, speed and SEO without losing what works.",
  },
  {
    badge: "Support",
    title: "Maintenance & Support",
    body: "Updates, monitoring and new features on a monthly plan so your site keeps earning.",
  },
] as const;

export const offers = [
  {
    title: "Want a custom build?",
    body: "Tell us the idea. We scope, design and ship a production-ready site or app.",
  },
  {
    title: "Want to redesign your existing site?",
    body: "Keep your content and customers. Get a fresh, faster, conversion-focused front end.",
  },
  {
    title: "Want a ready-made project?",
    body: "Browse the catalogue, pick one, and we tailor it to your brand in days.",
  },
  {
    title: "Need ongoing support?",
    body: "Hosting, updates and improvements handled for you every month.",
  },
] as const;

export const processSteps = [
  { title: "Pick a project", body: "Browse the catalogue or describe what you need." },
  { title: "Contact us", body: "We reply within 24 hours with a price and timeline." },
  { title: "We customise & deliver", body: "Branding, content and deployment done for you." },
] as const;
```

- [ ] **Step 9: Run test, expect pass**

Run: `npm test`
Expected: 3 tests PASS.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json vitest.config.mts vitest.setup.ts .env.example src/config
git commit -m "chore: add test runner, deps and site config"
```

---

### Task 2: Design tokens, fonts, root layout, UI primitives

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `src/lib/cn.ts`, `src/components/ui/Container.tsx`, `Button.tsx`, `Badge.tsx`, `Chip.tsx`, `DisplayHeading.tsx`, `src/components/ui/ui.test.tsx`

**Interfaces:**
- Produces: `cn(...classes)`, `<Container className>`, `<Button variant="accent"|"ghost" href? onClick? type? disabled? className>`, `<Badge>`, `<Chip>`, `<DisplayHeading lines as size="hero"|"section"|"small" align className>` which renders each line as `<span class="block overflow-hidden"><span data-line class="block">…</span></span>`.
- CSS utilities: `.display` (Anton, uppercase, lh 0.9), `.eyebrow` (12px uppercase tracking, muted). Tailwind tokens: `bg-bg`, `bg-surface`, `bg-surface-2`, `border-line`, `text-fg`, `text-muted`, `bg-accent`, `text-accent-fg`, `rounded-card`, `font-display`, `font-sans`.

- [ ] **Step 1: Write failing test `src/components/ui/ui.test.tsx`**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins truthy classes", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
});

describe("Button", () => {
  it("renders a link when href is given", () => {
    render(<Button href="/projects/x">Open</Button>);
    expect(screen.getByRole("link", { name: "Open" }).getAttribute("href")).toBe("/projects/x");
  });
  it("renders a button otherwise", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button", { name: "Send" }).getAttribute("type")).toBe("submit");
  });
});

describe("DisplayHeading", () => {
  it("renders each line wrapped for animation", () => {
    const { container } = render(<DisplayHeading as="h1" lines={["Ready-made.", "Custom-built."]} />);
    expect(container.querySelector("h1")).not.toBeNull();
    expect(container.querySelectorAll("[data-line]")).toHaveLength(2);
    expect(container.textContent).toContain("Custom-built.");
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test`
Expected: FAIL — modules not found.

- [ ] **Step 3: Replace `src/app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-bg: #0b0b0c;
  --color-surface: #151517;
  --color-surface-2: #1e1e21;
  --color-line: rgba(255, 255, 255, 0.08);
  --color-fg: #f4f4f0;
  --color-muted: #8b8b93;
  --color-accent: #c6ff3f;
  --color-accent-fg: #0b0b0c;
  --font-display: var(--font-anton), Impact, "Arial Narrow", sans-serif;
  --font-sans: var(--font-manrope), system-ui, sans-serif;
  --radius-card: 1rem;
}

@utility display {
  font-family: var(--font-display);
  text-transform: uppercase;
  line-height: 0.9;
  letter-spacing: -0.01em;
}

@utility eyebrow {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-muted);
}

html {
  color-scheme: dark;
  scroll-behavior: auto;
}

body {
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: var(--color-accent);
  color: var(--color-accent-fg);
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

- [ ] **Step 4: Create `src/lib/cn.ts`**

```ts
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
```

- [ ] **Step 5: Create UI primitives**

`src/components/ui/Container.tsx`:
```tsx
import { cn } from "@/lib/cn";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1220px] px-6", className)}>{children}</div>;
}
```

`src/components/ui/Button.tsx`:
```tsx
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "accent" | "ghost";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors";
const variants: Record<Variant, string> = {
  accent: "bg-accent text-accent-fg hover:bg-fg",
  ghost: "border border-line text-fg hover:border-fg",
};

type Props = {
  variant?: Variant;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Button({ variant = "accent", href, onClick, type = "button", disabled, className, children }: Props) {
  const cls = cn(base, variants[variant], className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn(cls, "disabled:cursor-not-allowed disabled:opacity-60")}>
      {children}
    </button>
  );
}
```

`src/components/ui/Badge.tsx`:
```tsx
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-fg">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
      {children}
    </span>
  );
}
```

`src/components/ui/Chip.tsx`:
```tsx
export function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-surface-2 px-3 py-1 text-xs text-muted">{children}</span>;
}
```

`src/components/ui/DisplayHeading.tsx`:
```tsx
import { cn } from "@/lib/cn";

type Props = {
  lines: readonly string[];
  as?: "h1" | "h2" | "h3";
  size?: "hero" | "section" | "small";
  align?: "left" | "center";
  className?: string;
};

const sizes: Record<NonNullable<Props["size"]>, string> = {
  hero: "text-[clamp(3.25rem,9vw,8.5rem)]",
  section: "text-[clamp(2.75rem,7vw,6.5rem)]",
  small: "text-[clamp(2rem,4vw,3.5rem)]",
};

export function DisplayHeading({ lines, as: Tag = "h2", size = "section", align = "left", className }: Props) {
  return (
    <Tag className={cn("display", sizes[size], align === "center" && "text-center", className)}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <span data-line className="block">
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
```

- [ ] **Step 6: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Anton, Manrope } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg text-fg">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Replace `src/app/page.tsx` with a temporary token check page**

```tsx
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { site } from "@/config/site";

export default function HomePage() {
  return (
    <Container className="space-y-8 py-32">
      <Badge>Web Studio</Badge>
      <DisplayHeading as="h1" size="hero" lines={site.tagline.split(". ").map((s, i) => (i === 0 ? `${s}.` : s))} />
      <Button>See our work</Button>
    </Container>
  );
}
```

- [ ] **Step 8: Run tests, lint, dev check**

Run: `npm test` → PASS. Run: `npm run lint` → no errors. Run `npm run dev`, open http://localhost:3000: dark background, lime badge dot, Anton uppercase headline, lime pill button. Stop dev server.

- [ ] **Step 9: Commit**

```bash
git add src
git commit -m "feat: design tokens, fonts and ui primitives"
```

---

### Task 3: Project types, seed data and accessors

**Files:**
- Create: `src/lib/types.ts`, `src/data/projects.ts`, `src/lib/projects.ts`, `src/lib/projects.test.ts`

**Interfaces:**
- Produces: `Project`, `ProjectCategory`, `InquirySource`, `PROJECT_CATEGORIES`; async `getProjects()`, `getFeaturedProjects()`, `getProject(slug)`, `getRelatedProjects(slug, limit=3)`; sync `getCategories()` → `{ value, label }[]`, `categoryLabel(category)`.

- [ ] **Step 1: Write failing test `src/lib/projects.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  categoryLabel,
  getCategories,
  getFeaturedProjects,
  getProject,
  getProjects,
  getRelatedProjects,
} from "@/lib/projects";

describe("projects", () => {
  it("returns projects sorted by order with unique slugs", async () => {
    const projects = await getProjects();
    expect(projects.length).toBeGreaterThanOrEqual(6);
    const orders = projects.map((p) => p.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
  });

  it("every project has images under its own folder", async () => {
    for (const p of await getProjects()) {
      expect(p.cover.startsWith(`/projects/${p.slug}/`)).toBe(true);
      expect(p.gallery.length).toBeGreaterThanOrEqual(2);
      for (const g of p.gallery) expect(g.startsWith(`/projects/${p.slug}/`)).toBe(true);
    }
  });

  it("featured projects are all featured", async () => {
    const featured = await getFeaturedProjects();
    expect(featured.length).toBeGreaterThanOrEqual(3);
    expect(featured.every((p) => p.featured)).toBe(true);
  });

  it("finds a project by slug and returns undefined for unknown", async () => {
    const [first] = await getProjects();
    expect((await getProject(first.slug))?.title).toBe(first.title);
    expect(await getProject("nope")).toBeUndefined();
  });

  it("related excludes the current project", async () => {
    const [first] = await getProjects();
    const related = await getRelatedProjects(first.slug);
    expect(related).toHaveLength(3);
    expect(related.some((p) => p.slug === first.slug)).toBe(false);
  });

  it("exposes category labels", () => {
    expect(getCategories().map((c) => c.value)).toEqual(["web-app", "ecommerce", "landing", "dashboard"]);
    expect(categoryLabel("ecommerce")).toBe("E-commerce");
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test` → FAIL, module not found.

- [ ] **Step 3: Create `src/lib/types.ts`**

```ts
export const PROJECT_CATEGORIES = {
  "web-app": "Web App",
  ecommerce: "E-commerce",
  landing: "Landing Page",
  dashboard: "Dashboard",
} as const;

export type ProjectCategory = keyof typeof PROJECT_CATEGORIES;

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  tagline: string;
  description: string;
  features: string[];
  tech: string[];
  cover: string;
  gallery: string[];
  featured: boolean;
  order: number;
}

export type InquirySource = "project" | "service" | "general";
```

- [ ] **Step 4: Create `src/data/projects.ts`**

```ts
import type { Project } from "@/lib/types";

const img = (slug: string, file: string) => `/projects/${slug}/${file}`;

export const projects: Project[] = [
  {
    slug: "nova-saas-dashboard",
    title: "Nova SaaS Dashboard",
    category: "dashboard",
    tagline: "Analytics dashboard with auth, billing and team roles, ready to white-label.",
    description:
      "Nova is a complete SaaS starter: authentication, subscription billing, team workspaces and a charts-heavy analytics dashboard.\n\nEvery screen is responsive and themeable, so we can swap in your brand in a day and deploy to Vercel.",
    features: ["Email + OAuth login", "Stripe subscriptions", "Team roles and invites", "Charts and exports", "Dark and light theme", "Admin panel"],
    tech: ["Next.js", "Postgres", "Prisma", "Stripe", "Tailwind"],
    cover: img("nova-saas-dashboard", "cover.svg"),
    gallery: [img("nova-saas-dashboard", "1.svg"), img("nova-saas-dashboard", "2.svg")],
    featured: true,
    order: 1,
  },
  {
    slug: "lumen-ecommerce",
    title: "Lumen E-commerce",
    category: "ecommerce",
    tagline: "Headless storefront with cart, checkout and a product admin.",
    description:
      "Lumen is a fast, headless storefront built for small catalogues that need to look premium.\n\nIt ships with product pages, variants, cart, Stripe checkout and an order dashboard for the owner.",
    features: ["Product variants", "Cart and Stripe checkout", "Order management", "Discount codes", "SEO-ready pages", "Email receipts"],
    tech: ["Next.js", "Stripe", "Sanity", "Tailwind"],
    cover: img("lumen-ecommerce", "cover.svg"),
    gallery: [img("lumen-ecommerce", "1.svg"), img("lumen-ecommerce", "2.svg")],
    featured: true,
    order: 2,
  },
  {
    slug: "orbit-landing",
    title: "Orbit Landing",
    category: "landing",
    tagline: "High-converting product landing page with animated sections and lead capture.",
    description:
      "Orbit is a single-page marketing site for launching a product or app.\n\nIt includes hero, features, pricing, FAQ and a lead form wired to email, all animated on scroll.",
    features: ["Animated hero", "Pricing table", "FAQ accordion", "Lead form to email", "Lighthouse 95+", "CMS-optional"],
    tech: ["Next.js", "GSAP", "Tailwind", "Resend"],
    cover: img("orbit-landing", "cover.svg"),
    gallery: [img("orbit-landing", "1.svg"), img("orbit-landing", "2.svg")],
    featured: true,
    order: 3,
  },
  {
    slug: "pulse-crm",
    title: "Pulse CRM",
    category: "web-app",
    tagline: "Lightweight CRM for small teams: contacts, pipeline and tasks.",
    description:
      "Pulse keeps leads, deals and follow-ups in one place without the bloat of enterprise CRMs.\n\nKanban pipeline, contact timeline, reminders and CSV import are included.",
    features: ["Kanban pipeline", "Contact timeline", "Task reminders", "CSV import/export", "Role-based access", "Activity log"],
    tech: ["Next.js", "Postgres", "Prisma", "Tailwind"],
    cover: img("pulse-crm", "cover.svg"),
    gallery: [img("pulse-crm", "1.svg"), img("pulse-crm", "2.svg")],
    featured: false,
    order: 4,
  },
  {
    slug: "bloom-store",
    title: "Bloom Store",
    category: "ecommerce",
    tagline: "Shopify theme for fashion and lifestyle brands with editorial layouts.",
    description:
      "Bloom is a custom Shopify theme with magazine-style collection pages and a fast, minimal checkout flow.\n\nWe install it on your store and set up collections and navigation.",
    features: ["Editorial collection grids", "Quick view", "Mega menu", "Size guide", "Instagram feed", "Speed optimised"],
    tech: ["Shopify", "Liquid", "Tailwind"],
    cover: img("bloom-store", "cover.svg"),
    gallery: [img("bloom-store", "1.svg"), img("bloom-store", "2.svg")],
    featured: false,
    order: 5,
  },
  {
    slug: "atlas-booking",
    title: "Atlas Booking",
    category: "web-app",
    tagline: "Appointment booking app with calendar sync and payments.",
    description:
      "Atlas lets clinics, salons and consultants take bookings online with automatic reminders.\n\nIt supports multiple staff calendars, Google Calendar sync and deposits via Stripe.",
    features: ["Multi-staff calendars", "Google Calendar sync", "Deposits via Stripe", "SMS/email reminders", "Customer accounts", "Admin reports"],
    tech: ["Next.js", "Postgres", "Stripe", "Twilio"],
    cover: img("atlas-booking", "cover.svg"),
    gallery: [img("atlas-booking", "1.svg"), img("atlas-booking", "2.svg")],
    featured: false,
    order: 6,
  },
];
```

- [ ] **Step 5: Create `src/lib/projects.ts`**

```ts
import { projects } from "@/data/projects";
import { PROJECT_CATEGORIES, type Project, type ProjectCategory } from "@/lib/types";

// Phase 2: replace the bodies below with database queries. Keep signatures.

function sorted(): Project[] {
  return [...projects].sort((a, b) => a.order - b.order);
}

export async function getProjects(): Promise<Project[]> {
  return sorted();
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return sorted().filter((p) => p.featured);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return projects.find((p) => p.slug === slug);
}

export async function getRelatedProjects(slug: string, limit = 3): Promise<Project[]> {
  return sorted()
    .filter((p) => p.slug !== slug)
    .slice(0, limit);
}

export function getCategories(): { value: ProjectCategory; label: string }[] {
  return (Object.keys(PROJECT_CATEGORIES) as ProjectCategory[]).map((value) => ({
    value,
    label: PROJECT_CATEGORIES[value],
  }));
}

export function categoryLabel(category: ProjectCategory): string {
  return PROJECT_CATEGORIES[category];
}
```

- [ ] **Step 6: Run tests, expect pass**

Run: `npm test` → all PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/types.ts src/data src/lib/projects.ts src/lib/projects.test.ts
git commit -m "feat: project types, seed data and accessors"
```

---

### Task 4: Inquiry schema and Server Action

**Files:**
- Create: `src/lib/inquiry-schema.ts`, `src/actions/inquiry.ts`, `src/actions/inquiry.test.ts`

**Interfaces:**
- Produces: `inquirySchema`, `Inquiry`, `InquiryState = { status: "idle"|"success"|"error"; errors?: Partial<Record<"name"|"email"|"subject"|"message"|"source"|"form", string>>; values?: Partial<Record<"name"|"email"|"subject"|"message"|"source", string>> }`, `initialInquiryState`, `submitInquiry(prev: InquiryState, formData: FormData): Promise<InquiryState>`.
- Form field names: `name`, `email`, `subject`, `message`, `source`, honeypot `company`.

- [ ] **Step 1: Write failing test `src/actions/inquiry.test.ts`**

```ts
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
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test` → FAIL, modules not found.

- [ ] **Step 3: Create `src/lib/inquiry-schema.ts`**

```ts
import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Name is too long"),
  email: z.email("Please enter a valid email"),
  subject: z.string().trim().min(2, "Tell us what this is about").max(120, "Subject is too long"),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(2000, "Message is too long"),
  source: z.enum(["project", "service", "general"]).catch("general"),
});

export type Inquiry = z.infer<typeof inquirySchema>;
export type InquiryField = keyof Inquiry;

export type InquiryState = {
  status: "idle" | "success" | "error";
  errors?: Partial<Record<InquiryField | "form", string>>;
  values?: Partial<Record<InquiryField, string>>;
};

export const initialInquiryState: InquiryState = { status: "idle" };
```

- [ ] **Step 4: Create `src/actions/inquiry.ts`**

```ts
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
```

- [ ] **Step 5: Run tests, expect pass**

Run: `npm test` → all PASS. If `z.email` or `z.flattenError` is missing, confirm `npm ls zod` shows 4.x.

- [ ] **Step 6: Commit**

```bash
git add src/lib/inquiry-schema.ts src/actions
git commit -m "feat: inquiry schema and submitInquiry server action"
```

---

### Task 5: Scroll helper, contact store, Contact section

**Files:**
- Create: `src/lib/scroll.ts`, `src/store/contact.tsx`, `src/components/sections/Contact.tsx`, `src/components/sections/Contact.test.tsx`
- Modify: `src/app/layout.tsx` (wrap with `ContactProvider`)

**Interfaces:**
- Produces: `registerScroller(s | null)`, `scrollToId(id)`; `ContactProvider`, `useContact() → { prefill: { subject, source } | null, openContact({ subject, source }) }`; `<Contact />` section with `id="contact"`.
- Consumes: `submitInquiry`, `initialInquiryState`, `InquirySource`, `Button`, `Container`, `DisplayHeading`, `site.email`.

- [ ] **Step 1: Write failing test `src/components/sections/Contact.test.tsx`**

```tsx
import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { ContactProvider, useContact } from "@/store/contact";
import { Contact } from "@/components/sections/Contact";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));
vi.mock("@/actions/inquiry", () => ({
  submitInquiry: vi.fn(async () => ({ status: "success" })),
}));

let open: ((p: { subject: string; source: "project" | "service" | "general" }) => void) | null = null;
function Grab() {
  open = useContact().openContact;
  return null;
}

describe("Contact", () => {
  it("renders the form fields", () => {
    render(
      <ContactProvider>
        <Contact />
      </ContactProvider>,
    );
    expect(screen.getByLabelText("Name")).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Subject")).toBeTruthy();
    expect(screen.getByLabelText("Message")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Send message" })).toBeTruthy();
  });

  it("prefills subject and source from openContact", () => {
    render(
      <ContactProvider>
        <Grab />
        <Contact />
      </ContactProvider>,
    );
    act(() => open?.({ subject: "Nova SaaS Dashboard", source: "project" }));
    expect((screen.getByLabelText("Subject") as HTMLInputElement).value).toBe("Nova SaaS Dashboard");
    expect((document.querySelector('input[name="source"]') as HTMLInputElement).value).toBe("project");
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test` → FAIL, modules not found.

- [ ] **Step 3: Create `src/lib/scroll.ts`**

```ts
type Scroller = { scrollTo: (target: HTMLElement, options?: { offset?: number }) => void };

let scroller: Scroller | null = null;

export function registerScroller(s: Scroller | null): void {
  scroller = s;
}

export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  if (scroller) scroller.scrollTo(el, { offset: -96 });
  else el.scrollIntoView?.({ behavior: "smooth", block: "start" });
}
```

- [ ] **Step 4: Create `src/store/contact.tsx`**

```tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { InquirySource } from "@/lib/types";
import { scrollToId } from "@/lib/scroll";

export type ContactPrefill = { subject: string; source: InquirySource };

type ContactContextValue = {
  prefill: ContactPrefill | null;
  openContact: (prefill: ContactPrefill) => void;
};

const ContactContext = createContext<ContactContextValue | null>(null);

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [prefill, setPrefill] = useState<ContactPrefill | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const openContact = useCallback(
    (next: ContactPrefill) => {
      setPrefill(next);
      if (pathname === "/") {
        scrollToId("contact");
        return;
      }
      const query = new URLSearchParams({ subject: next.subject, source: next.source });
      router.push(`/?${query.toString()}#contact`);
    },
    [pathname, router],
  );

  const value = useMemo(() => ({ prefill, openContact }), [prefill, openContact]);
  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}

export function useContact(): ContactContextValue {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error("useContact must be used inside <ContactProvider>");
  return ctx;
}
```

- [ ] **Step 5: Create `src/components/sections/Contact.tsx`**

```tsx
"use client";

import { useActionState, useEffect, useId } from "react";
import { submitInquiry } from "@/actions/inquiry";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { initialInquiryState } from "@/lib/inquiry-schema";
import { useContact } from "@/store/contact";

export function Contact() {
  const { prefill, openContact } = useContact();
  const [state, formAction, pending] = useActionState(submitInquiry, initialInquiryState);

  // Hand-off from other pages: /?subject=…&source=…#contact
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subject = params.get("subject");
    if (!subject) return;
    const source = params.get("source");
    openContact({ subject, source: source === "project" || source === "service" ? source : "general" });
    window.history.replaceState(null, "", "/#contact");
  }, [openContact]);

  const subjectDefault = state.values?.subject ?? prefill?.subject ?? "";

  return (
    <section id="contact" className="py-24 md:py-32">
      <Container className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <DisplayHeading lines={["Let's build", "something."]} />
          <p className="max-w-md text-lg text-muted">
            Tell us which project you want or what you need built. We reply within 24 hours with a price and timeline.
          </p>
          <a href={`mailto:${site.email}`} className="inline-block text-accent hover:underline">
            {site.email}
          </a>
        </div>

        {state.status === "success" ? (
          <div role="status" className="flex flex-col justify-center rounded-card border border-line bg-surface p-8">
            <p className="display text-3xl text-accent">Thanks!</p>
            <p className="mt-3 text-muted">We got your message and will reply within 24 hours.</p>
          </div>
        ) : (
          <form action={formAction} noValidate className="space-y-5 rounded-card border border-line bg-surface p-6 md:p-8">
            <input type="hidden" name="source" value={prefill?.source ?? "general"} />
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <Field label="Name" name="name" autoComplete="name" defaultValue={state.values?.name} error={state.errors?.name} />
            <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} error={state.errors?.email} />
            <Field key={subjectDefault} label="Subject" name="subject" defaultValue={subjectDefault} error={state.errors?.subject} />
            <Field label="Message" name="message" textarea defaultValue={state.values?.message} error={state.errors?.message} />
            {state.errors?.form && (
              <p role="alert" className="text-sm text-red-400">
                {state.errors.form}
              </p>
            )}
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? "Sending…" : "Send message"}
            </Button>
          </form>
        )}
      </Container>
    </section>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  textarea?: boolean;
};

function Field({ label, name, type = "text", autoComplete, defaultValue, error, textarea }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const cls = cn(
    "w-full rounded-xl border bg-bg px-4 py-3 text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none",
    error ? "border-red-400" : "border-line",
  );
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="eyebrow block">
        {label}
      </label>
      {textarea ? (
        <textarea id={id} name={name} rows={5} defaultValue={defaultValue} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} className={cls} />
      ) : (
        <input id={id} name={name} type={type} autoComplete={autoComplete} defaultValue={defaultValue} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} className={cls} />
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Wrap layout with `ContactProvider`**

In `src/app/layout.tsx` add `import { ContactProvider } from "@/store/contact";` and change the body to:
```tsx
<body className="flex min-h-full flex-col bg-bg text-fg">
  <ContactProvider>
    <main className="flex-1">{children}</main>
  </ContactProvider>
</body>
```

- [ ] **Step 7: Run tests, expect pass**

Run: `npm test` → all PASS.

- [ ] **Step 8: Manual check**

Temporarily add `<Contact />` at the bottom of `src/app/page.tsx` (import from `@/components/sections/Contact`), run `npm run dev`, submit empty form → inline errors; submit valid form with no `.env.local` → success card and the inquiry printed in the terminal. Leave `<Contact />` in place; Task 11 rewrites the page.

- [ ] **Step 9: Commit**

```bash
git add src
git commit -m "feat: contact store and contact form section"
```

---

### Task 6: GSAP setup, smooth scroll and loader

**Files:**
- Create: `src/lib/gsap.ts`, `src/lib/loader-events.ts`, `src/components/layout/SmoothScroll.tsx`, `src/components/layout/Loader.tsx`, `src/lib/loader-events.test.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `gsap`, `ScrollTrigger`, `useGSAP`, `prefersReducedMotion()` from `@/lib/gsap`; `LOADER_DONE_EVENT`, `markLoaderDone()`, `useLoaderDone(cb)` from `@/lib/loader-events`; `<SmoothScroll />` (renders nothing), `<Loader name />`.

- [ ] **Step 1: Write failing test `src/lib/loader-events.test.tsx`**

```tsx
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { LOADER_DONE_EVENT, markLoaderDone, useLoaderDone } from "@/lib/loader-events";

function Probe({ cb }: { cb: () => void }) {
  useLoaderDone(cb);
  return null;
}

describe("useLoaderDone", () => {
  afterEach(() => {
    delete document.documentElement.dataset.loaded;
  });

  it("fires when the loader event is dispatched", () => {
    const cb = vi.fn();
    render(<Probe cb={cb} />);
    expect(cb).not.toHaveBeenCalled();
    window.dispatchEvent(new Event(LOADER_DONE_EVENT));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("fires immediately if the loader already finished", () => {
    markLoaderDone();
    const cb = vi.fn();
    render(<Probe cb={cb} />);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test` → FAIL, module not found.

- [ ] **Step 3: Create `src/lib/gsap.ts`**

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger, useGSAP };
```

- [ ] **Step 4: Create `src/lib/loader-events.ts`**

```ts
import { useEffect } from "react";

export const LOADER_DONE_EVENT = "loader:done";

export function markLoaderDone(): void {
  document.documentElement.dataset.loaded = "true";
  window.dispatchEvent(new Event(LOADER_DONE_EVENT));
}

/** Runs `onDone` once the intro loader has finished (immediately if it already has). */
export function useLoaderDone(onDone: () => void): void {
  useEffect(() => {
    if (document.documentElement.dataset.loaded === "true") {
      onDone();
      return;
    }
    window.addEventListener(LOADER_DONE_EVENT, onDone, { once: true });
    return () => window.removeEventListener(LOADER_DONE_EVENT, onDone);
  }, [onDone]);
}
```

- [ ] **Step 5: Create `src/components/layout/SmoothScroll.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { registerScroller } from "@/lib/scroll";

export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    registerScroller(lenis);
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      registerScroller(null);
    };
  }, []);
  return null;
}
```

- [ ] **Step 6: Create `src/components/layout/Loader.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { markLoaderDone } from "@/lib/loader-events";

const SESSION_KEY = "loader-done";

function seenThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberSeen(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* private mode: ignore */
  }
}

export function Loader({ name }: { name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(true);

  useGSAP(
    () => {
      if (prefersReducedMotion() || seenThisSession()) {
        setVisible(false);
        markLoaderDone();
        return;
      }
      const value = { n: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          rememberSeen();
          setVisible(false);
          markLoaderDone();
        },
      });
      tl.to(value, {
        n: 100,
        duration: 1.6,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counter.current) counter.current.textContent = String(Math.round(value.n)).padStart(3, "0");
        },
      })
        .from("[data-letter]", { yPercent: 110, duration: 0.8, stagger: 0.04 }, 0.2)
        .to(root.current, { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, "+=0.2");
    },
    { scope: root },
  );

  if (!visible) return null;

  return (
    <div ref={root} aria-hidden="true" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg">
      <span ref={counter} className="display text-[clamp(4rem,12vw,10rem)] text-accent">
        000
      </span>
      <div className="mt-4 flex overflow-hidden">
        {name.split("").map((ch, i) => (
          <span key={i} data-letter className="display inline-block text-[clamp(1.5rem,4vw,3rem)] text-fg">
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Wire into `src/app/layout.tsx`**

Add imports:
```tsx
import { Loader } from "@/components/layout/Loader";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
```
Body becomes:
```tsx
<body className="flex min-h-full flex-col bg-bg text-fg">
  <SmoothScroll />
  <ContactProvider>
    <Loader name={site.name} />
    <main className="flex-1">{children}</main>
  </ContactProvider>
</body>
```

- [ ] **Step 8: Run tests and lint**

Run: `npm test` → PASS. `npm run lint` → clean.

- [ ] **Step 9: Manual check**

`npm run dev`, hard-reload http://localhost:3000 in a new tab: counter runs 000→100, letters of STUDIO rise, overlay slides up. Reload again in the same tab: no loader (session flag). Open DevTools → Rendering → "Emulate prefers-reduced-motion: reduce", new tab: no loader, page scrolls natively.

- [ ] **Step 10: Commit**

```bash
git add src
git commit -m "feat: gsap setup, lenis smooth scroll and intro loader"
```

---

### Task 7: Navbar and Footer

**Files:**
- Create: `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/Footer.test.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `site`, `offers`, `Button`, `Container`, `DisplayHeading`, `useContact`, `scrollToId`, `lucide-react` icons `Menu`, `X`.
- Produces: `<Navbar />` (client), `<Footer />` (server).

- [ ] **Step 1: Write failing test `src/components/layout/Footer.test.tsx`**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/config/site";

describe("Footer", () => {
  it("shows the company name, nav links and email", () => {
    render(<Footer />);
    expect(screen.getAllByText(site.name).length).toBeGreaterThan(0);
    for (const item of site.nav) expect(screen.getByRole("link", { name: item.label })).toBeTruthy();
    expect(screen.getByRole("link", { name: site.email }).getAttribute("href")).toBe(`mailto:${site.email}`);
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test` → FAIL.

- [ ] **Step 3: Create `src/components/layout/Footer.tsx`**

```tsx
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { offers } from "@/config/content";
import { site } from "@/config/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-accent text-accent-fg">
      <Container className="grid gap-12 py-20 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <DisplayHeading lines={["Ready to build", "something bigger?"]} size="small" />
          <a href={`mailto:${site.email}`} className="inline-block text-lg font-semibold underline-offset-4 hover:underline">
            {site.email}
          </a>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <FooterColumn title="Site">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={`/${item.href}`} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>
          <FooterColumn title="Services">
            {offers.map((offer) => (
              <li key={offer.title}>
                <Link href="/#services" className="hover:underline">
                  {offer.title}
                </Link>
              </li>
            ))}
          </FooterColumn>
          <FooterColumn title="Socials">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="hover:underline">
                  {s.label}
                </a>
              </li>
            ))}
          </FooterColumn>
        </div>
      </Container>
      <Container className="flex flex-wrap items-center justify-between gap-4 border-t border-accent-fg/15 py-6 text-sm">
        <p>
          © {year} {site.name}. All rights reserved.
        </p>
        <p className="opacity-70">{site.location}</p>
      </Container>
      <div
        aria-hidden="true"
        className="display pointer-events-none select-none overflow-hidden text-center text-[clamp(6rem,24vw,22rem)] leading-[0.75] translate-y-[0.14em]"
      >
        {site.name}
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-4 font-semibold opacity-70">{title}</p>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/layout/Navbar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { site } from "@/config/site";
import { scrollToId } from "@/lib/scroll";
import { useContact } from "@/store/contact";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { openContact } = useContact();

  const goTo = (hash: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      scrollToId(hash.slice(1));
    }
  };

  const contact = () => {
    setOpen(false);
    openContact({ subject: "General inquiry", source: "general" });
  };

  return (
    <header className="fixed inset-x-0 top-5 z-50 flex justify-center px-4">
      <nav
        aria-label="Main"
        className="flex w-full max-w-[880px] items-center justify-between rounded-full border border-line bg-surface/80 px-5 py-2.5 backdrop-blur-md"
      >
        <Link href="/" className="display text-xl">
          {site.name}
        </Link>
        <ul className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link href={`/${item.href}`} onClick={goTo(item.href)} className="text-sm text-muted transition-colors hover:text-fg">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Button onClick={contact} className="min-h-10 px-5">
            Contact
          </Button>
          <button type="button" aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-full p-2 text-fg md:hidden">
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg p-6 md:hidden">
          <div className="flex items-center justify-between">
            <span className="display text-xl">{site.name}</span>
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="rounded-full p-2">
              <X size={22} />
            </button>
          </div>
          <ul className="mt-16 space-y-6">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={`/${item.href}`} onClick={goTo(item.href)} className="display text-5xl">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button type="button" onClick={contact} className="display text-5xl text-accent">
                Contact
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 5: Add to `src/app/layout.tsx`**

Imports:
```tsx
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
```
Inside `ContactProvider`:
```tsx
<Loader name={site.name} />
<Navbar />
<main className="flex-1">{children}</main>
<Footer />
```

- [ ] **Step 6: Run tests and lint**

Run: `npm test` → PASS. `npm run lint` → clean.

- [ ] **Step 7: Manual check**

`npm run dev`: floating pill nav at top, Contact button scrolls to the form, footer is lime with the giant STUDIO name clipped at the bottom. Resize to <768px: hamburger opens the full-screen menu.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "feat: navbar and footer"
```

---

### Task 8: Hero and Marquee

**Files:**
- Create: `src/components/sections/Hero.tsx`, `src/components/sections/Marquee.tsx`

**Interfaces:**
- Consumes: `Project`, `site`, `Badge`, `Button`, `Container`, `DisplayHeading`, `gsap`/`useGSAP`/`prefersReducedMotion`, `useLoaderDone`, `scrollToId`.
- Produces: `<Hero showcase={Project | null} />`, `<Marquee items={readonly string[]} />`.

- [ ] **Step 1: Create `src/components/sections/Marquee.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

export function Marquee({ items }: { items: readonly string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      tween.current = gsap.to("[data-track]", { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="overflow-hidden border-y border-line py-5"
      onMouseEnter={() => tween.current?.pause()}
      onMouseLeave={() => tween.current?.play()}
    >
      <div data-track className="flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {items.map((item) => (
              <li key={item} className="display flex items-center gap-8 px-4 text-2xl text-muted md:text-3xl">
                {item}
                <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/sections/Hero.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { site } from "@/config/site";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useLoaderDone } from "@/lib/loader-events";
import { scrollToId } from "@/lib/scroll";
import type { Project } from "@/lib/types";

function taglineLines(tagline: string): [string, string] {
  const [a, b = ""] = tagline.split(". ");
  return [`${a}.`, b];
}

export function Hero({ showcase }: { showcase: Project | null }) {
  const root = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" } })
        .from("[data-line]", { yPercent: 110, duration: 1, stagger: 0.1 })
        .from("[data-fade]", { y: 24, opacity: 0, duration: 0.8, stagger: 0.08 }, "-=0.6")
        .from("[data-showcase]", { scale: 1.1, opacity: 0, duration: 1.2 }, "-=0.8");
    },
    { scope: root },
  );

  useLoaderDone(useCallback(() => tl.current?.play(), []));

  const lines = taglineLines(site.tagline);
  const year = new Date().getFullYear();

  return (
    <section ref={root} className="relative overflow-hidden pb-16 pt-36 md:pt-44">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-[5.5%] w-px bg-line" />
        <div className="absolute inset-y-0 right-[5.5%] w-px bg-line" />
      </div>
      <Container className="relative">
        <div data-fade>
          <Badge>Web Studio</Badge>
        </div>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <DisplayHeading as="h1" size="hero" lines={lines} />
          <div className="space-y-6">
            <p data-fade className="max-w-md text-lg text-muted">
              <span className="text-fg">Buy</span> a ready-made project or <span className="text-fg">commission</span> a custom build. Launch in days,
              not months.
            </p>
            <div data-fade>
              <Button onClick={() => scrollToId("work")}>See our work</Button>
            </div>
            <dl data-fade className="flex gap-10">
              {site.stats.map((s) => (
                <div key={s.label}>
                  <dt className="display text-3xl">{s.value}</dt>
                  <dd className="eyebrow mt-1">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-16 md:mt-24">
          <div className="eyebrow mx-auto flex max-w-[560px] justify-between">
            <span>{site.name}</span>
            <span>{year}</span>
          </div>
          <div className="mt-3 grid items-center gap-6 md:grid-cols-[1fr_minmax(0,560px)_1fr]">
            <span className="display hidden text-right text-[clamp(3rem,6vw,5.5rem)] md:block">Design</span>
            <div data-showcase className="relative aspect-video overflow-hidden rounded-card border border-line bg-surface-2">
              {showcase && (
                <Image src={showcase.cover} alt={showcase.title} fill priority sizes="(max-width: 768px) 100vw, 560px" className="object-cover" />
              )}
            </div>
            <span className="display hidden text-[clamp(3rem,6vw,5.5rem)] md:block">Develop</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 3: Temporary wiring for a visual check**

Replace `src/app/page.tsx` with:
```tsx
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { site } from "@/config/site";
import { getFeaturedProjects } from "@/lib/projects";

export default async function HomePage() {
  const featured = await getFeaturedProjects();
  return (
    <>
      <Hero showcase={featured[0] ?? null} />
      <Marquee items={site.marquee} />
      <Contact />
    </>
  );
}
```

- [ ] **Step 4: Run lint and dev check**

`npm run lint` → clean. `npm run dev`, new tab: after the loader, headline lines rise in, badge/paragraph/CTA fade up, showcase box scales in (image is a broken placeholder until Task 11, box still shows). Marquee scrolls left continuously and pauses on hover.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat: hero and marquee sections"
```

---

### Task 9: Services bento, pinned Offers, Process

**Files:**
- Create: `src/lib/use-reveal.ts`, `src/components/sections/Services.tsx`, `src/components/sections/Offers.tsx`, `src/components/sections/Process.tsx`, `src/components/sections/Offers.test.tsx`

**Interfaces:**
- Produces: `useReveal(scopeRef, selector = "[data-reveal]")`; `<Services />` (`id="about"`), `<Offers />` (`id="services"`), `<Process />`.
- Consumes: `services`, `offers`, `processSteps`, `useContact`, ui primitives.

- [ ] **Step 1: Write failing test `src/components/sections/Offers.test.tsx`**

```tsx
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Offers } from "@/components/sections/Offers";
import { offers } from "@/config/content";

const openContact = vi.fn();
vi.mock("@/store/contact", () => ({ useContact: () => ({ prefill: null, openContact }) }));

describe("Offers", () => {
  it("renders all offers and prefills contact on click", () => {
    render(<Offers />);
    for (const offer of offers) expect(screen.getByText(offer.title)).toBeTruthy();
    const buttons = screen.getAllByRole("button", { name: "Let's talk" });
    expect(buttons).toHaveLength(offers.length);
    fireEvent.click(buttons[1]);
    expect(openContact).toHaveBeenCalledWith({ subject: offers[1].title, source: "service" });
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test` → FAIL.

- [ ] **Step 3: Create `src/lib/use-reveal.ts`**

```ts
import type { RefObject } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/** Fades `selector` elements up as they enter the viewport. Skipped under reduced motion. */
export function useReveal(scope: RefObject<HTMLElement | null>, selector = "[data-reveal]"): void {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    },
    { scope },
  );
}
```

- [ ] **Step 4: Create `src/components/sections/Services.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { services } from "@/config/content";
import { useReveal } from "@/lib/use-reveal";

export function Services() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <section id="about" ref={root} className="py-24 md:py-32">
      <Container>
        <DisplayHeading lines={["It just works.", "For you."]} align="center" />
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {services.map((s, i) => (
            <article
              key={s.title}
              data-reveal
              className={i % 3 === 0 ? "rounded-card border border-line bg-surface p-8 md:row-span-2" : "rounded-card border border-line bg-surface p-8"}
            >
              <Badge>{s.badge}</Badge>
              <h3 className="mt-6 text-2xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-muted">{s.body}</p>
              <div aria-hidden="true" className="mt-8 h-32 rounded-xl bg-linear-to-br from-accent/20 via-surface-2 to-transparent" />
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 5: Create `src/components/sections/Offers.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { offers } from "@/config/content";
import { useReveal } from "@/lib/use-reveal";
import { useContact } from "@/store/contact";

export function Offers() {
  const root = useRef<HTMLElement>(null);
  const { openContact } = useContact();
  useReveal(root);

  return (
    <section id="services" ref={root} className="border-y border-line bg-surface/40 py-24 md:py-32">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="self-start lg:sticky lg:top-32">
          <DisplayHeading lines={["Have a project", "in mind?"]} />
          <p className="mt-6 max-w-sm text-lg text-muted">Pick the option that fits. Every conversation starts with a free scope and quote.</p>
        </div>
        <ol className="space-y-6">
          {offers.map((offer, i) => (
            <li
              key={offer.title}
              data-reveal
              className="flex min-h-[320px] flex-col justify-between rounded-card border border-line bg-surface p-8 md:p-10"
            >
              <div>
                <span className="eyebrow">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display mt-4 text-3xl md:text-4xl">{offer.title}</h3>
                <p className="mt-4 max-w-md text-muted">{offer.body}</p>
              </div>
              <div className="mt-8">
                <Button onClick={() => openContact({ subject: offer.title, source: "service" })}>Let&apos;s talk</Button>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
```

- [ ] **Step 6: Create `src/components/sections/Process.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { processSteps } from "@/config/content";
import { useReveal } from "@/lib/use-reveal";

export function Process() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <section ref={root} className="py-24 md:py-32">
      <Container>
        <DisplayHeading lines={["How it", "works"]} align="center" size="small" />
        <ol className="mt-16 grid gap-6 md:grid-cols-3">
          {processSteps.map((step, i) => (
            <li key={step.title} data-reveal className="rounded-card border border-line bg-surface p-8">
              <span className="display inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-xl text-accent-fg">
                {i + 1}
              </span>
              <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
```

- [ ] **Step 7: Run tests and lint**

Run: `npm test` → PASS. `npm run lint` → clean.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "feat: services, offers and process sections"
```

---

### Task 10: ProjectCard, ProjectsGrid, FeaturedWork

**Files:**
- Create: `src/components/project/ProjectCard.tsx`, `src/components/sections/ProjectsGrid.tsx`, `src/components/sections/FeaturedWork.tsx`, `src/components/sections/FeaturedWork.test.tsx`

**Interfaces:**
- Produces: `<ProjectCard project />` (server-safe), `<ProjectsGrid projects />` (`id="work"`), `<FeaturedWork projects />`.
- Consumes: `Project`, `getCategories`, `categoryLabel`, `Badge`, `Chip`, `Container`, `DisplayHeading`, `useReveal`, `gsap`.

- [ ] **Step 1: Write failing test `src/components/sections/FeaturedWork.test.tsx`**

```tsx
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { projects } from "@/data/projects";

describe("FeaturedWork", () => {
  const featured = projects.filter((p) => p.featured);

  it("shows the first featured project and filters by category tab", () => {
    render(<FeaturedWork projects={featured} />);
    expect(screen.getByRole("heading", { level: 3, name: featured[0].title })).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "E-commerce" }));
    const ecommerce = featured.find((p) => p.category === "ecommerce")!;
    expect(screen.getByRole("heading", { level: 3, name: ecommerce.title })).toBeTruthy();
    expect(screen.getByRole("link", { name: /view project/i }).getAttribute("href")).toBe(`/projects/${ecommerce.slug}`);
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test` → FAIL.

- [ ] **Step 3: Create `src/components/project/ProjectCard.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { categoryLabel } from "@/lib/projects";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      data-reveal
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-fg/30"
    >
      <div className="relative aspect-video overflow-hidden bg-surface-2">
        <Image
          src={project.cover}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold">{project.title}</h3>
          <Badge>{categoryLabel(project.category)}</Badge>
        </div>
        <p className="text-sm text-muted">{project.tagline}</p>
        <ul className="flex flex-wrap gap-2">
          {project.tech.slice(0, 3).map((t) => (
            <li key={t}>
              <Chip>{t}</Chip>
            </li>
          ))}
        </ul>
        <p className="mt-auto pt-4 text-sm font-semibold text-accent">Want to buy? Contact us →</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Create `src/components/sections/ProjectsGrid.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { useReveal } from "@/lib/use-reveal";
import type { Project } from "@/lib/types";

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <section id="work" ref={root} className="py-24 md:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <DisplayHeading lines={["Projects", "for sale"]} />
          <p className="max-w-sm text-muted">Every project is finished, tested and ready to be rebranded for you. No prices listed: each build is quoted for your needs.</p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 5: Create `src/components/sections/FeaturedWork.tsx`**

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { categoryLabel, getCategories } from "@/lib/projects";
import type { Project, ProjectCategory } from "@/lib/types";

type Tab = ProjectCategory | "all";

export function FeaturedWork({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<Tab>("all");
  const tabs: { value: Tab; label: string }[] = [
    { value: "all", label: "All" },
    ...getCategories().filter((c) => projects.some((p) => p.category === c.value)),
  ];
  const visible = active === "all" ? projects : projects.filter((p) => p.category === active);
  const current = visible[0];

  useGSAP(
    () => {
      if (prefersReducedMotion() || !current) return;
      gsap.fromTo("[data-preview]", { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" });
    },
    { scope: root, dependencies: [current?.slug] },
  );

  return (
    <section ref={root} className="py-24 md:py-32">
      <Container>
        <DisplayHeading lines={["See everything.", "Pick anything."]} align="center" />
        <div role="tablist" aria-label="Project categories" className="mt-10 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              type="button"
              aria-selected={active === tab.value}
              onClick={() => setActive(tab.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                active === tab.value ? "border-accent bg-accent text-accent-fg" : "border-line text-muted hover:text-fg",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {current && (
          <div data-preview className="relative mt-12 aspect-video overflow-hidden rounded-card border border-line bg-surface-2">
            <Image src={current.cover} alt={current.title} fill sizes="(max-width: 1220px) 100vw, 1220px" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 bg-linear-to-t from-bg/90 to-transparent p-6 md:p-10">
              <div>
                <Badge>{categoryLabel(current.category)}</Badge>
                <h3 className="display mt-3 text-3xl md:text-5xl">{current.title}</h3>
              </div>
              <Link href={`/projects/${current.slug}`} className="rounded-full bg-fg px-6 py-3 text-sm font-semibold text-bg hover:bg-accent">
                View project →
              </Link>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
```

- [ ] **Step 6: Run tests and lint**

Run: `npm test` → PASS. `npm run lint` → clean.

- [ ] **Step 7: Commit**

```bash
git add src
git commit -m "feat: project card, projects grid and featured work"
```

---

### Task 11: Placeholder images and landing page assembly

**Files:**
- Create: `scripts/make-placeholders.mjs`, `public/projects/**` (generated)
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create `scripts/make-placeholders.mjs`**

```js
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const source = readFileSync(new URL("../src/data/projects.ts", import.meta.url), "utf8");
const slugs = [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const titles = [...source.matchAll(/title:\s*"([^"]+)"/g)].map((m) => m[1]);

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const svg = (label, tone) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">` +
  `<rect width="1600" height="900" fill="${tone}"/>` +
  `<rect x="60" y="60" width="1480" height="780" rx="24" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>` +
  `<text x="800" y="480" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-size="96" fill="#C6FF3F">${escape(label)}</text>` +
  `</svg>\n`;

slugs.forEach((slug, i) => {
  const dir = new URL(`../public/projects/${slug}/`, import.meta.url);
  mkdirSync(dir, { recursive: true });
  const title = titles[i].toUpperCase();
  writeFileSync(new URL("cover.svg", dir), svg(title, "#1E1E21"));
  writeFileSync(new URL("1.svg", dir), svg(`${title} / 01`, "#232327"));
  writeFileSync(new URL("2.svg", dir), svg(`${title} / 02`, "#1A1A1D"));
  console.log("wrote", slug);
});
```

- [ ] **Step 2: Generate images**

Run: `npm run placeholders`
Expected: 6 lines `wrote <slug>`; `public/projects/<slug>/{cover,1,2}.svg` exist for all 6 slugs.

- [ ] **Step 3: Replace `src/app/page.tsx`**

```tsx
import { Contact } from "@/components/sections/Contact";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Offers } from "@/components/sections/Offers";
import { Process } from "@/components/sections/Process";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { Services } from "@/components/sections/Services";
import { site } from "@/config/site";
import { getFeaturedProjects, getProjects } from "@/lib/projects";

export default async function HomePage() {
  const [projects, featured] = await Promise.all([getProjects(), getFeaturedProjects()]);
  return (
    <>
      <Hero showcase={featured[0] ?? null} />
      <Marquee items={site.marquee} />
      <Services />
      <Offers />
      <FeaturedWork projects={featured} />
      <ProjectsGrid projects={projects} />
      <Process />
      <Contact />
    </>
  );
}
```

- [ ] **Step 4: Lint, build, dev check**

`npm run lint` → clean. `npm run build` → succeeds. `npm run dev`: scroll the whole page; order is Hero → Marquee → What we do → Have a project in mind (left column stays pinned on ≥1024px) → Featured work tabs → Projects grid (6 cards with placeholder covers) → How it works → Contact → Footer. Click "Let's talk" on an offer: page scrolls to the form with Subject prefilled.

- [ ] **Step 5: Commit**

```bash
git add scripts public/projects src/app/page.tsx
git commit -m "feat: assemble landing page with placeholder project images"
```

---

### Task 12: Project detail page and 404

**Files:**
- Create: `src/components/project/BuyPanel.tsx`, `src/components/project/ProjectGallery.tsx`, `src/components/project/BuyPanel.test.tsx`, `src/app/projects/[slug]/page.tsx`, `src/app/not-found.tsx`

**Interfaces:**
- Consumes: `getProjects`, `getProject`, `getRelatedProjects`, `categoryLabel`, `ProjectCard`, `useContact`, ui primitives.
- Produces: `/projects/[slug]` static pages, `BuyPanel`, `ProjectGallery`.

- [ ] **Step 1: Write failing test `src/components/project/BuyPanel.test.tsx`**

```tsx
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BuyPanel } from "@/components/project/BuyPanel";
import { projects } from "@/data/projects";

const openContact = vi.fn();
vi.mock("@/store/contact", () => ({ useContact: () => ({ prefill: null, openContact }) }));

describe("BuyPanel", () => {
  it("lists tech and opens contact prefilled with the project title", () => {
    const project = projects[0];
    render(<BuyPanel project={project} />);
    for (const t of project.tech) expect(screen.getByText(t)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Want to buy? Contact us" }));
    expect(openContact).toHaveBeenCalledWith({ subject: project.title, source: "project" });
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test` → FAIL.

- [ ] **Step 3: Create `src/components/project/BuyPanel.tsx`**

```tsx
"use client";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import type { Project } from "@/lib/types";
import { useContact } from "@/store/contact";

export function BuyPanel({ project }: { project: Project }) {
  const { openContact } = useContact();
  return (
    <aside className="self-start rounded-card border border-line bg-surface p-8 lg:sticky lg:top-32">
      <p className="eyebrow">Tech stack</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <li key={t}>
            <Chip>{t}</Chip>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-muted">
        Pricing depends on the customisation you need. Tell us about your brand and we&apos;ll send a quote within 24 hours.
      </p>
      <Button className="mt-6 w-full" onClick={() => openContact({ subject: project.title, source: "project" })}>
        Want to buy? Contact us
      </Button>
    </aside>
  );
}
```

- [ ] **Step 4: Create `src/components/project/ProjectGallery.tsx`**

```tsx
import Image from "next/image";

export function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  if (images.length === 0) return null;
  return (
    <section aria-label="Gallery" className="mt-16 grid gap-6 sm:grid-cols-2">
      {images.map((src, i) => (
        <div key={src} className="relative aspect-video overflow-hidden rounded-card border border-line bg-surface-2">
          <Image src={src} alt={`${title} screenshot ${i + 1}`} fill sizes="(max-width: 640px) 100vw, 600px" className="object-cover" />
        </div>
      ))}
    </section>
  );
}
```

- [ ] **Step 5: Create `src/app/projects/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyPanel } from "@/components/project/BuyPanel";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectGallery } from "@/components/project/ProjectGallery";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { categoryLabel, getProject, getProjects, getRelatedProjects } from "@/lib/projects";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
    openGraph: { title: project.title, description: project.tagline, images: [project.cover] },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const related = await getRelatedProjects(slug);

  return (
    <article className="pb-24 pt-36">
      <Container>
        <Link href="/#work" className="eyebrow transition-colors hover:text-fg">
          ← All projects
        </Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <DisplayHeading as="h1" lines={[project.title]} />
          <Badge>{categoryLabel(project.category)}</Badge>
        </div>
        <p className="mt-4 max-w-2xl text-lg text-muted">{project.tagline}</p>

        <div className="relative mt-12 aspect-video overflow-hidden rounded-card border border-line bg-surface-2">
          <Image src={project.cover} alt={project.title} fill priority sizes="(max-width: 1220px) 100vw, 1220px" className="object-cover" />
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-10">
            <div className="space-y-4 text-lg text-muted">
              {project.description.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">What&apos;s included</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {project.features.map((f) => (
                  <li key={f} className="flex gap-3 text-muted">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <BuyPanel project={project} />
        </div>

        <ProjectGallery images={project.gallery} title={project.title} />

        <section className="mt-24">
          <h2 className="display text-4xl">More projects</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
      </Container>
    </article>
  );
}
```

- [ ] **Step 6: Create `src/app/not-found.tsx`**

```tsx
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-start justify-center gap-8 pt-32">
      <DisplayHeading as="h1" size="hero" lines={["404", "Not found"]} />
      <p className="text-lg text-muted">That page doesn&apos;t exist. Let&apos;s get you back to the work.</p>
      <Button href="/">Back home</Button>
    </Container>
  );
}
```

- [ ] **Step 7: Run tests, typecheck, build**

`npm test` → PASS. `npm run typecheck` → clean (generates `PageProps`). `npm run build` → output lists `/projects/[slug]` with 6 static paths.

- [ ] **Step 8: Manual check**

`npm run dev`: open `/projects/nova-saas-dashboard` → title, badge, cover, description, features, sticky panel. Click "Want to buy? Contact us" → navigates to `/#contact`, form has Subject "Nova SaaS Dashboard", URL is cleaned to `/#contact`. Open `/projects/nope` → 404 page.

- [ ] **Step 9: Commit**

```bash
git add src
git commit -m "feat: project detail page and 404"
```

---

### Task 13: Final verification

**Files:** none new (fixes only, if needed)

- [ ] **Step 1: Automated checks**

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
All must pass. Fix and commit anything that fails.

- [ ] **Step 2: Manual checklist (record results in the final report)**

Run `npm run dev` and check in a browser:
1. New tab: loader counter 000→100, name letters rise, overlay slides up, hero animates in. Reload same tab: no loader.
2. Section order matches spec §7; pinned left column in "Have a project in mind?" holds at 1440px width and stacks at 375px.
3. Featured tabs filter and crossfade the preview.
4. Each CTA prefills Subject correctly: Navbar "Contact" → "General inquiry"; offer card → offer title; detail page button → project title (cross-page).
5. Contact form: empty submit → inline errors; valid submit without `.env.local` → success card and console log; with `.env.local` filled → email arrives with reply-to set.
6. DevTools → Rendering → emulate `prefers-reduced-motion: reduce`, new tab: no loader, no entrance animations, marquee static, native scroll.
7. Lighthouse (Chrome DevTools, mobile) on `/`: Accessibility ≥ 90.
8. Keyboard: Tab reaches nav links, tabs, cards and form; focus ring is lime.

- [ ] **Step 3: Update README**

Replace `README.md` content with a short project description, the env vars from `.env.example`, and the scripts (`dev`, `build`, `test`, `placeholders`). Mention that projects are edited in `src/data/projects.ts` until the admin panel (phase 2) exists.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: project readme for phase 1"
```
