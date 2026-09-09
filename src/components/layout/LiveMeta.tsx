"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

const TICK_MS = 30_000;

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, TICK_MS);
  return () => clearInterval(id);
}

function formatClock(timeZone: string): string {
  const now = new Date();
  const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone }).format(now);
  let offset = "";
  try {
    offset =
      new Intl.DateTimeFormat("en-US", { timeZoneName: "shortOffset", timeZone })
        .formatToParts(now)
        .find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    offset = "";
  }
  return offset ? `${time}  ${offset}` : time;
}

/** Location, live local time and coordinates, like the reference site's top-left meta. */
export function LiveMeta({ className, compact }: { className?: string; compact?: boolean }) {
  // Server renders a placeholder; the client fills the time in after hydration, refreshing every 30s.
  const tick = useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / TICK_MS),
    () => null,
  );
  const clock = tick === null ? "--:--" : formatClock(site.timeZone);

  return (
    <p className={cn("eyebrow flex items-center gap-5 whitespace-nowrap", className)}>
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
        {site.location}
      </span>
      <span className={cn(compact && "hidden md:inline")} suppressHydrationWarning>
        {clock}
      </span>
      <span className={cn("hidden", !compact && "lg:inline")}>{site.coordinates}</span>
    </p>
  );
}
