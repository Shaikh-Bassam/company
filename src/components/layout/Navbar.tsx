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
              <Link
                href={`/${item.href}`}
                onClick={goTo(item.href)}
                className="text-sm text-muted transition-colors hover:text-fg"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Button onClick={contact} className="min-h-10 px-5">
            Contact
          </Button>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="rounded-full p-2 text-fg md:hidden"
          >
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
