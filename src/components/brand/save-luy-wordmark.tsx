import { cn } from "@/lib/utils";

interface SaveLuyWordmarkProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * SaveLuy Canonical Wordmark
 *
 * Rules:
 * - Exactly "SaveLuy"
 * - "Save" has subtle structural weight (font-extrabold)
 * - "Luy" has high-contrast vibrant prominence (font-black text-primary)
 * - Zero font-shift, perfectly tabular and baseline-aligned.
 */
export function SaveLuyWordmark({
  className,
  size = "md",
}: SaveLuyWordmarkProps) {
  const sizeStyles = {
    sm: "text-base tracking-tight",
    md: "text-lg tracking-tight",
    lg: "text-2xl tracking-tight",
    xl: "text-3xl sm:text-4xl font-extrabold tracking-tight",
  };

  return (
    <span
      className={cn(
        "inline-flex items-baseline font-extrabold select-none",
        sizeStyles[size],
        className
      )}
    >
      <span className="text-foreground">Save</span>
      <span className="font-black text-primary ml-0.5">Luy</span>
    </span>
  );
}
