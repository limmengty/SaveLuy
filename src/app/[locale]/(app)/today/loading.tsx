import { AppShell } from "@/components/app-shell/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function TodayLoading() {
  return (
    <AppShell title="Today" locale="en-KH">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-7">
          {/* Hero Card Skeleton */}
          <div className="rounded-2xl border border-border bg-card p-5 lg:p-7 space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-14 w-48" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-full rounded-full" />
          </div>

          {/* Quick Add Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Activity Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        <div className="space-y-7">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </AppShell>
  );
}
