import { cn } from "@/lib/cn";

/** Outlined pill tag. `active` fills it, for use as a selected filter. */
export function Badge({ children, active, className }: { children: React.ReactNode; active?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "eyebrow inline-flex items-center rounded-full border border-current px-3 py-1.5 transition-colors duration-300",
        active && "border-fg bg-fg text-bg",
        className,
      )}
    >
      {children}
    </span>
  );
}
