"use client";

import { Button } from "@/components/ui/Button";
import type { Project } from "@/lib/types";
import { useContact } from "@/store/contact";

export function BuyPanel({ project }: { project: Project }) {
  const { openContact } = useContact();
  return (
    <aside className="self-start border-t border-line pt-6 lg:sticky lg:top-24">
      <p className="eyebrow text-muted">Built with</p>
      <p className="mt-3 text-base font-semibold">{project.tech.join(", ")}</p>
      <p className="mt-8 leading-relaxed text-muted">
        Pricing depends on the customisation you need. Tell us about your brand and we&apos;ll send a quote within 24
        hours.
      </p>
      <Button className="mt-8 w-full" onClick={() => openContact({ subject: project.title, source: "project" })}>
        Want to buy? Contact us
      </Button>
    </aside>
  );
}
