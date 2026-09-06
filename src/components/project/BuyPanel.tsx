"use client";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import type { Project } from "@/lib/types";
import { useContact } from "@/store/contact";

export function BuyPanel({ project }: { project: Project }) {
  const { openContact } = useContact();
  return (
    <aside className="self-start rounded-card border border-line bg-surface p-8 lg:sticky lg:top-32">
      <p className="eyebrow">Tech stack</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <li key={t}>
            <Chip>{t}</Chip>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-muted">
        Pricing depends on the customisation you need. Tell us about your brand and we&apos;ll send a quote within 24
        hours.
      </p>
      <Button className="mt-6 w-full" onClick={() => openContact({ subject: project.title, source: "project" })}>
        Want to buy? Contact us
      </Button>
    </aside>
  );
}
