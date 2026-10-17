import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground animate-pulse">
      {/* Header Skeleton */}
      <header className="shrink-0 border-b border-border/80 bg-background/85 px-4 pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="size-9 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 overflow-hidden p-4 max-w-6xl mx-auto w-full space-y-6">
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

        {/* Quick Add Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[68px] rounded-2xl" />
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Dock Skeleton */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/85 pb-[env(safe-area-inset-bottom,0px)] lg:hidden">
        <div className="mx-auto grid h-16 max-w-xl grid-cols-5 items-center px-4">
          <Skeleton className="h-7 w-12 mx-auto rounded-full" />
          <Skeleton className="h-7 w-12 mx-auto rounded-full" />
          <Skeleton className="size-12 mx-auto rounded-2xl -mt-5" />
          <Skeleton className="h-7 w-12 mx-auto rounded-full" />
          <Skeleton className="h-7 w-12 mx-auto rounded-full" />
        </div>
      </nav>
    </div>
  );
}
