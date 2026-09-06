"use client";

import { Badge } from "@/components/ui/Badge";
import { FitText } from "@/components/ui/FitText";
import { offers } from "@/config/content";
import { useContact } from "@/store/contact";

/**
 * The four ways to work with us, as a centred list of giant titles (like the
 * reference site's "Break" list). Hovering one dims the rest and reveals its
 * description; clicking opens the contact form with the subject prefilled.
 */
export function Offers() {
  const { openContact } = useContact();

  return (
    <section id="services" className="bg-panel px-5 py-24 md:px-7 md:py-32">
      <FitText lines={["Have a project", "in mind?"]} max={210} align="center" />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <p className="eyebrow text-muted">Four ways to work with us</p>
        <Badge>Free scope and quote</Badge>
      </div>

      <ol className="group/list mt-16 flex flex-col items-center gap-8 md:mt-24 md:gap-10">
        {offers.map((offer, i) => (
          <li
            key={offer.title}
            className="w-full text-center transition-opacity duration-300 group-hover/list:opacity-30 hover:opacity-100!"
          >
            <button
              type="button"
              onClick={() => openContact({ subject: offer.title, source: "service" })}
              className="group/item mx-auto block max-w-5xl rounded-sm"
            >
              <span className="display flex items-start justify-center gap-2 text-[clamp(2rem,6.5vw,6.75rem)] md:gap-4">
                <span className="eyebrow mt-[0.4em] text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span>{offer.title}</span>
              </span>
              <span className="mx-auto mt-3 block max-w-md text-sm leading-relaxed text-muted md:mt-0 md:max-h-0 md:overflow-hidden md:opacity-0 md:transition-all md:duration-300 md:group-hover/item:mt-4 md:group-hover/item:max-h-24 md:group-hover/item:opacity-100">
                {offer.body}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
