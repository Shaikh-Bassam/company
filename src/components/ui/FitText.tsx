"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/cn";

type Props = {
  lines: readonly string[];
  as?: "h1" | "h2" | "p" | "div";
  /** Upper bound for the computed font size, in px. */
  max?: number;
  /** Desktop (≥768px) upper bound as a share of the viewport width (e.g. 19 → 19vw). */
  maxVw?: number;
  align?: "left" | "center";
  className?: string;
  /** Custom line markup (e.g. per-character spans). Defaults to the plain string. */
  renderLine?: (line: string) => React.ReactNode;
  onMouseEnter?: () => void;
};

/**
 * Display heading that scales its font size so the longest line spans the full
 * width of its container (like the edge-to-edge titles on the reference site).
 * Each line is wrapped so entrance animations can target `[data-line]`.
 */
export function FitText({
  lines,
  as: Tag = "h2",
  max = 360,
  maxVw,
  align = "left",
  className,
  renderLine,
  onMouseEnter,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      const available = el.clientWidth;
      if (!available) return;
      el.style.fontSize = "100px";
      let widest = 0;
      el.querySelectorAll<HTMLElement>("[data-fit-line]").forEach((line) => {
        widest = Math.max(widest, line.getBoundingClientRect().width);
      });
      const desktop = window.innerWidth >= 768;
      const cap = maxVw && desktop ? Math.min(max, (maxVw / 100) * window.innerWidth) : max;
      if (widest > 0) el.style.fontSize = `${Math.min(cap, (available / widest) * 100 * 0.99)}px`;
    };

    fit();
    document.fonts?.ready.then(fit).catch(() => undefined);

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(fit);
    observer.observe(el.parentElement ?? el);
    return () => observer.disconnect();
  }, [lines, max, maxVw]);

  const Comp = Tag as React.ElementType;
  return (
    <Comp
      ref={ref}
      onMouseEnter={onMouseEnter}
      className={cn("display block w-full", align === "center" && "text-center", className)}
      style={{ fontSize: "clamp(2.5rem, 12vw, 22rem)" }}
    >
      {lines.map((line) => (
        <span key={line} className="block overflow-hidden whitespace-nowrap">
          <span data-fit-line data-line className="inline-block">
            {renderLine ? renderLine(line) : line}
          </span>
        </span>
      ))}
    </Comp>
  );
}
