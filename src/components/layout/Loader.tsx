"use client";

import { useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { markLoaderDone } from "@/lib/loader-events";

const SESSION_KEY = "loader-done";

function seenThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberSeen(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* private mode: ignore */
  }
}

export function Loader({ name }: { name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(true);

  useGSAP(
    () => {
      if (prefersReducedMotion() || seenThisSession()) {
        setVisible(false);
        markLoaderDone();
        return;
      }
      const value = { n: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          rememberSeen();
          setVisible(false);
          markLoaderDone();
        },
      });
      tl.to(value, {
        n: 100,
        duration: 1.6,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counter.current) counter.current.textContent = String(Math.round(value.n)).padStart(3, "0");
        },
      })
        .from("[data-letter]", { yPercent: 110, duration: 0.8, stagger: 0.04 }, 0.2)
        .to(root.current, { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, "+=0.2");
    },
    { scope: root },
  );

  if (!visible) return null;

  return (
    <div ref={root} aria-hidden="true" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg">
      <span ref={counter} className="display text-[clamp(4rem,12vw,10rem)] text-accent">
        000
      </span>
      <div className="mt-4 flex overflow-hidden">
        {name.split("").map((ch, i) => (
          <span key={i} data-letter className="display inline-block text-[clamp(1.5rem,4vw,3rem)] text-fg">
            {ch === " " ? " " : ch}
          </span>
        ))}
      </div>
    </div>
  );
}
