import type { ComponentProps } from "react";
import { SaveLuyMark } from "./save-luy-mark";
import { SaveLuyWordmark } from "./save-luy-wordmark";
import { cn } from "@/lib/utils";

interface SaveLuyLockupProps extends ComponentProps<"div"> {
  markSize?: number;
  wordmarkSize?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
}

/**
 * SaveLuy Canonical Logo Lockup
 * Combines the geometric shield-ledger mark with the calibrated wordmark.
 */
export function SaveLuyLockup({
  markSize = 28,
  wordmarkSize = "md",
  showWordmark = true,
  className,
  ...props
}: SaveLuyLockupProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-2.5", className)}
      role="img"
      aria-label="SaveLuy"
      {...props}
    >
      <SaveLuyMark size={markSize} className="shrink-0 transition-transform duration-200" />
      {showWordmark && <SaveLuyWordmark size={wordmarkSize} />}
    </div>
  );
}
