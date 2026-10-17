import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/app-shell/app-shell";

export function PlanSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2 animate-pulse">
      {/* Left Column: Weekly Flexible Envelopes */}
      <section className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-6 rounded-2xl border border-border bg-card p-5">
          {/* Essentials input skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-3 w-36" />
          </div>
          {/* Progress bar skeleton */}
          <Skeleton className="h-3 w-full rounded-full" />

          {/* Fun money input skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-3 w-44" />
          </div>
          {/* Progress bar skeleton */}
          <Skeleton className="h-3 w-full rounded-full" />

          {/* Summary line skeleton */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Protected & Perspective */}
      <div className="space-y-8">
        {/* Protected monthly skeleton */}
        <section className="space-y-3">
          <Skeleton className="h-4 w-36" />
          <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
            <Skeleton className="h-4 w-64" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-9 w-full rounded-xl mt-2" />
          </div>
        </section>

        {/* Perspective and allocation skeleton */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-36 rounded-full" />
          </div>
          <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
            <div className="space-y-2">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-3 w-52" />
            </div>

            {/* Allocation Equation Card Skeleton */}
            <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-4 w-24 rounded-full" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-16" /></div>
                <div className="flex justify-between"><Skeleton className="h-3 w-36" /><Skeleton className="h-3 w-16" /></div>
                <div className="flex justify-between"><Skeleton className="h-3 w-40" /><Skeleton className="h-3 w-16" /></div>
                <div className="flex justify-between pt-2 border-t border-border/40"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-20" /></div>
              </div>
            </div>
          </div>
        </section>

        {/* Wait list link skeleton */}
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function PlanLoading() {
  return (
    <AppShell title="Plan" locale="en-KH">
      <PlanSkeleton />
    </AppShell>
  );
}
