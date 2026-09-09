"use client";

import { scrollToTop } from "@/lib/scroll";

export function BackToTop({ className }: { className?: string }) {
  return (
    <button type="button" onClick={scrollToTop} className={className}>
      Back to top
    </button>
  );
}
