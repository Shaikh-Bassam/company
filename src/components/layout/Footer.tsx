import Link from "next/link";
import { BackToTop } from "@/components/layout/BackToTop";
import { LiveMeta } from "@/components/layout/LiveMeta";
import { TalkBand } from "@/components/layout/TalkBand";
import { site } from "@/config/site";

/** Cream footer: follow / navigation lists, a brown "Let's talk" band, then meta. */
export function Footer() {
  const year = new Date().getFullYear();
  const links = [{ label: "Home", href: "/" }, ...site.nav.map((item) => ({ label: item.label, href: `/${item.href}` }))];
  const linkCls = "font-bold uppercase text-xl transition-opacity hover:opacity-50 md:text-2xl";

  return (
    <footer className="bg-paper text-paper-fg">
      <div className="px-5 pb-10 pt-16 md:px-7 md:pt-24">
        <div className="eyebrow flex justify-between opacity-60">
          <span>(Follow)</span>
          <span>(Navigation)</span>
        </div>
        <div className="mt-3 border-t border-paper-fg/30 pt-6 md:pt-8">
          <div className="flex justify-between gap-8">
            <ul className="space-y-1.5">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className={linkCls}>
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${site.email}`} className={linkCls}>
                  Email
                </a>
              </li>
            </ul>
            <ul className="space-y-1.5 text-right">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex justify-center">
            <BackToTop className="eyebrow py-2 opacity-70 transition-opacity hover:opacity-100" />
          </div>
        </div>
      </div>

      <TalkBand />

      <div className="eyebrow flex flex-wrap items-center justify-between gap-3 px-5 py-5 md:px-7">
        <LiveMeta compact />
        <span className="opacity-70">
          © {year} {site.name}. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
