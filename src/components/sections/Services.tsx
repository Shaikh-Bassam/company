"use client";

import { useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { services } from "@/config/content";
import { useReveal } from "@/lib/use-reveal";

export function Services() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <section id="about" ref={root} className="py-24 md:py-32">
      <Container>
        <DisplayHeading lines={["It just works.", "For you."]} align="center" />
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {services.map((s) => (
            <article key={s.title} data-reveal className="rounded-card border border-line bg-surface p-8">
              <Badge>{s.badge}</Badge>
              <h3 className="mt-6 text-2xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-muted">{s.body}</p>
              <div
                aria-hidden="true"
                className="mt-8 h-32 rounded-xl bg-linear-to-br from-accent/20 via-surface-2 to-transparent"
              />
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
