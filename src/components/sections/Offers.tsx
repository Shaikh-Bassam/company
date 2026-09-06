"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { offers } from "@/config/content";
import { useReveal } from "@/lib/use-reveal";
import { useContact } from "@/store/contact";

export function Offers() {
  const root = useRef<HTMLElement>(null);
  const { openContact } = useContact();
  useReveal(root);

  return (
    <section id="services" ref={root} className="border-y border-line bg-surface/40 py-24 md:py-32">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="self-start lg:sticky lg:top-32">
          <DisplayHeading lines={["Have a project", "in mind?"]} />
          <p className="mt-6 max-w-sm text-lg text-muted">
            Pick the option that fits. Every conversation starts with a free scope and quote.
          </p>
        </div>
        <ol className="space-y-6">
          {offers.map((offer, i) => (
            <li
              key={offer.title}
              data-reveal
              className="flex min-h-[320px] flex-col justify-between rounded-card border border-line bg-surface p-8 md:p-10"
            >
              <div>
                <span className="eyebrow">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display mt-4 text-3xl md:text-4xl">{offer.title}</h3>
                <p className="mt-4 max-w-md text-muted">{offer.body}</p>
              </div>
              <div className="mt-8">
                <Button onClick={() => openContact({ subject: offer.title, source: "service" })}>Let&apos;s talk</Button>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
