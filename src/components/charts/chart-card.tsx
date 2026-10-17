"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  question: string;
  currentValue: string;
  interpretation: string;
  action?: ReactNode;
  accessibleSummary: string;
  children: ReactNode;
  className?: string;
  badge?: ReactNode;
}

export function ChartCard({
  question,
  currentValue,
  interpretation,
  action,
  accessibleSummary,
  children,
  className,
  badge,
}: ChartCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-card p-5 lg:p-6 shadow-xs flex flex-col justify-between transition-all relative overflow-hidden",
        className
      )}
      aria-label={question}
    >
      <div className="space-y-3">
        {/* Header: Question & Badge */}
        <div className="flex flex-wrap items-start justify-between gap-2.5">
          <h3 className="text-sm font-semibold text-foreground/90 leading-tight">
            {question}
          </h3>
          {badge}
        </div>

        {/* Prominent Current Value */}
        <div className="flex items-baseline gap-2">
          <span className="money text-2xl lg:text-3xl font-black text-foreground tracking-tight">
            {currentValue}
          </span>
        </div>

        {/* Interpretation Line */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {interpretation}
        </p>
      </div>

      {/* Primary Chart Area */}
      <div className="mt-4 min-h-[120px] w-full" aria-hidden="true">
        {children}
      </div>

      {/* Screen-reader accessible summary */}
      <div className="sr-only">
        <p>{accessibleSummary}</p>
      </div>

      {/* Action / Footer */}
      {action && <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">{action}</div>}
    </article>
  );
}
