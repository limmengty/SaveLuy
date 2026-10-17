"use client";

import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { EnvelopeUsagePoint } from "@/features/analytics/types";

interface EnvelopeUsageBarsProps {
  envelopes: EnvelopeUsagePoint[];
  locale?: string;
  className?: string;
}

export function EnvelopeUsageBars({ envelopes, locale = "en-KH", className }: EnvelopeUsageBarsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {envelopes.map((env) => {
        const clampedPercent = Math.min(100, Math.max(0, env.percentageUsed));
        return (
          <div key={env.envelopeId} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                {env.name}
                {env.isOverLimit && (
                  <span className="inline-flex items-center gap-0.5 text-destructive font-bold">
                    <AlertTriangle className="size-3" /> Over budget
                  </span>
                )}
              </span>
              <span className="text-muted-foreground font-mono">
                {formatMoney(env.spentCents)} used · {formatMoney(env.remainingCents)} left
              </span>
            </div>

            {/* Visual Bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary/80">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  env.isOverLimit ? "bg-destructive" : "bg-primary"
                )}
                style={{ width: `${clampedPercent}%` }}
              />
            </div>

            {/* Percentage & Total */}
            <div className="flex items-center justify-between text-2xs text-muted-foreground">
              <span>{env.percentageUsed}% of {formatMoney(env.allocatedCents)}</span>
              <Link
                href={`/${locale}/activity?envelope=${env.envelopeId}`}
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <span>View {env.name}</span>
                <ArrowRight className="size-2.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
