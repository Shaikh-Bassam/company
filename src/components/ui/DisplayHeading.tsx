import { cn } from "@/lib/cn";

type Props = {
  lines: readonly string[];
  as?: "h1" | "h2" | "h3";
  size?: "hero" | "section" | "small";
  align?: "left" | "center";
  className?: string;
};

const sizes: Record<NonNullable<Props["size"]>, string> = {
  hero: "text-[clamp(3.25rem,9vw,8.5rem)]",
  section: "text-[clamp(2.75rem,7vw,6.5rem)]",
  small: "text-[clamp(2rem,4vw,3.5rem)]",
};

export function DisplayHeading({ lines, as: Tag = "h2", size = "section", align = "left", className }: Props) {
  return (
    <Tag className={cn("display", sizes[size], align === "center" && "text-center", className)}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <span data-line className="block">
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
