import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-4 animate-pulse", className)}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonQuestion() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-muted rounded w-24" />
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted" />
          <div className="w-8 h-8 rounded-lg bg-muted" />
        </div>
      </div>
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Quick wins */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-3">
            <div className="h-8 bg-muted rounded w-12 mx-auto mb-2" />
            <div className="h-3 bg-muted rounded w-16 mx-auto" />
          </div>
        ))}
      </div>
      {/* Readiness score */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-muted" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          <div className="h-3 bg-muted rounded w-1/3 mx-auto" />
        </div>
      </div>
      {/* Category cards */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                <div className="h-2 bg-muted rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonReviewList() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-card border border-border border-l-4 border-l-muted rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="flex gap-2">
                <div className="h-5 bg-muted rounded-full w-16" />
                <div className="h-5 bg-muted rounded-full w-12" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
