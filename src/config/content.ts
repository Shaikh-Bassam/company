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

/** Giant scroll-driven statement under the hero. Each line slides in from `from`; `label` is the small caption beside it. */
export type StatementLine = {
  text: string;
  from: "left" | "right";
  label?: [string, string];
  /** Horizontal stretch of the line (1 = natural width). Height never changes. */
  stretch?: number;
};

export const statement: StatementLine[] = [
  { text: "Creating", from: "left", label: ["Purposeful", "design"], stretch: 1.12 },
  { text: "Websites", from: "right", label: ["Built to", "convert"], stretch: 0.92 },
  { text: "That sell", from: "left", stretch: 1.34 },
];

export const processSteps = [
  { title: "Pick a project", body: "Browse the catalogue or describe what you need." },
  { title: "Contact us", body: "We reply within 24 hours with a price and timeline." },
  { title: "We customise & deliver", body: "Branding, content and deployment done for you." },
] as const;
