import { cn } from "@/lib/cn";

/**
 * Text that rolls upward on hover, revealing an identical copy from below
 * (the reference site's link hover). Put `group` on the hovered parent.
 */
export function RollText({ children, className }: { children: string; className?: string }) {
  const motion = "block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full";
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <span className={motion}>{children}</span>
      <span aria-hidden="true" className={cn(motion, "absolute left-0 top-full")}>
        {children}
      </span>
    </span>
  );
}
