import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "accent" | "ghost";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors";
const variants: Record<Variant, string> = {
  accent: "bg-accent text-accent-fg hover:bg-fg",
  ghost: "border border-line text-fg hover:border-fg",
};

type Props = {
  variant?: Variant;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Button({ variant = "accent", href, onClick, type = "button", disabled, className, children }: Props) {
  const cls = cn(base, variants[variant], className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(cls, "disabled:cursor-not-allowed disabled:opacity-60")}
    >
      {children}
    </button>
  );
}
