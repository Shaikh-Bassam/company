"use client";

import { Marquee } from "@/components/sections/Marquee";
import { site } from "@/config/site";
import { useContact } from "@/store/contact";

/** Brown "Let's talk" ticker above the footer meta. Clicking opens the contact form. */
export function TalkBand() {
  const { openContact } = useContact();
  const open = () => openContact({ subject: "General inquiry", source: "general" });

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Let's talk. Open the contact form"
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className="cursor-pointer bg-block text-block-fg transition-colors hover:text-fg"
    >
      <Marquee items={site.marquee} speed={18} className="py-2" itemClassName="display px-5 text-[clamp(4rem,12vw,13rem)]" />
    </div>
  );
}
