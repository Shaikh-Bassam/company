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
