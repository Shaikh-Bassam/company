export const site = {
  name: "STUDIO",
  kicker: "Web studio",
  tagline: "Ready-made. Custom-built.",
  description:
    "A web studio selling ready-made web projects and building custom sites, apps and redesigns.",
  location: "Karachi, PK",
  timeZone: "Asia/Karachi",
  coordinates: "24.8607° N, 67.0011° E",
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
    { label: "Contact", href: "#contact" },
  ],
  hero: {
    /** `**word**` marks the emphasised words. */
    intro: "**Buy** a ready-made project or **commission** a custom build. Launch in days, not months.",
    cta: "See our work",
    /** Optional showreel for the hero box, e.g. "/hero-reel.mp4" in `public/`. Empty → featured project cover. */
    video: "",
  },
  stats: [
    { value: "25+", label: "Projects" },
    { value: "40+", label: "Clients" },
    { value: "5+", label: "Years" },
  ],
  marquee: ["Let's talk", "Let's talk", "Let's talk", "Let's talk"],
} as const;
