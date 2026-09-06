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
