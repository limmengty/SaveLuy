import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-6xl mx-auto w-full">
      {/* Hero Card Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-12 w-44" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      {/* Grid Content Skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
