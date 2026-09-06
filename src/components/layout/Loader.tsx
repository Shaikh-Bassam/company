"use client";

import { useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { markLoaderDone } from "@/lib/loader-events";

/** Intro loader. Runs on every page load (like the reference site); skipped only under reduced motion. */
export function Loader({ name }: { name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(true);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        setVisible(false);
        markLoaderDone();
        return;
      }
      const value = { n: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          setVisible(false);
          markLoaderDone();
        },
      });
      tl.to(value, {
        n: 100,
        duration: 1.8,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counter.current) counter.current.textContent = String(Math.round(value.n)).padStart(3, "0");
        },
      })
        .from("[data-letter]", { yPercent: 110, duration: 0.9, stagger: 0.05 }, 0.15)
        .to(root.current, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "+=0.25");
    },
    { scope: root },
  );

  if (!visible) return null;

  return (
    <div ref={root} aria-hidden="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-bg px-5">
      <div className="flex overflow-hidden">
        {name.split("").map((ch, i) => (
          <span key={i} data-letter className="display inline-block text-[clamp(3.5rem,18vw,16rem)] text-fg">
            {ch === " " ? " " : ch}
          </span>
        ))}
      </div>
      <span ref={counter} className="eyebrow absolute bottom-6 left-5 text-accent md:left-7">
        000
      </span>
      <span className="eyebrow absolute bottom-6 right-5 text-muted md:right-7">Loading</span>
    </div>
  );
}
