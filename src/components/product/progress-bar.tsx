import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value: number;
  max: number;
  tone?: "primary" | "warning" | "destructive";
}

export function ProgressBar({
  value,
  max,
  tone = "primary",
  className,
  ...props
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((Math.max(0, value) / max) * 100)) : 0;

  const toneClass = {
    primary: "bg-primary",
    warning: "bg-warning",
    destructive: "bg-destructive",
  }[tone];

  return (
    <ProgressPrimitive.Root
      value={pct}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary/80",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full transition-all duration-300 ease-out", toneClass)}
        style={{ width: `${pct}%` }}
      />
    </ProgressPrimitive.Root>
  );
}
