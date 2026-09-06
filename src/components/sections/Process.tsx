"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { processSteps } from "@/config/content";
import { useReveal } from "@/lib/use-reveal";

export function Process() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <section ref={root} className="py-24 md:py-32">
      <Container>
        <DisplayHeading lines={["How it", "works"]} align="center" size="small" />
        <ol className="mt-16 grid gap-6 md:grid-cols-3">
          {processSteps.map((step, i) => (
            <li key={step.title} data-reveal className="rounded-card border border-line bg-surface p-8">
              <span className="display inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-xl text-accent-fg">
                {i + 1}
              </span>
              <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
