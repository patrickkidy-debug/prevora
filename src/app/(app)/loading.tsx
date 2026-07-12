import { Skeleton } from "@/components/ui/skeleton";

/**
 * Instant navigation feedback for every section in the app group.
 * Rendered immediately (via Suspense) while the server component fetches,
 * so moving between sections feels instant even under DB/auth latency.
 */
export default function AppLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-56" />
        </div>
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>

      {/* Hero / summary block */}
      <Skeleton className="h-36 w-full rounded-xl" />

      {/* Card grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </div>
  );
}
