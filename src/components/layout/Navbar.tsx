"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LiveMeta } from "@/components/layout/LiveMeta";
import { site } from "@/config/site";
import { scrollToId, scrollToTop } from "@/lib/scroll";

/**
 * Thin top bar, no pill and no background. `mix-blend-difference` keeps the white
 * text readable over dark, brown and cream sections alike.
 */
export function Navbar() {
  const pathname = usePathname();

  const goTo = (hash: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    e.preventDefault();
    scrollToId(hash.slice(1));
  };

  const goHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    e.preventDefault();
    scrollToTop();
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 text-white mix-blend-difference">
      <nav aria-label="Main" className="pointer-events-auto flex items-center justify-between px-5 py-5 md:px-7">
        <LiveMeta compact />
        <ul className="eyebrow flex items-center gap-4 md:gap-7">
          <li>
            <Link href="/" onClick={goHome} className="transition-opacity hover:opacity-60">
              Home
            </Link>
          </li>
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link href={`/${item.href}`} onClick={goTo(item.href)} className="transition-opacity hover:opacity-60">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
