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
