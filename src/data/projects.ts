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
