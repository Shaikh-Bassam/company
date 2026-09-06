import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "outline" | "solid";

const base =
  "inline-flex min-h-12 items-center justify-center rounded-full px-7 text-[13px] font-bold uppercase tracking-[0.04em] transition-colors duration-300";
const variants: Record<Variant, string> = {
  outline: "border border-current hover:bg-fg hover:text-bg",
  solid: "bg-fg text-bg hover:bg-accent hover:text-accent-fg",
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

export function Button({ variant = "outline", href, onClick, type = "button", disabled, className, children }: Props) {
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
      className={cn(cls, "disabled:cursor-not-allowed disabled:opacity-50")}
    >
      {children}
    </button>
  );
}
