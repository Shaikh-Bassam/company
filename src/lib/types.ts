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
