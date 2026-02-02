import { Skeleton } from '@/components/ui/skeleton';

export function DashboardHeaderSkeleton() {
  return (
    <div className="space-y-1">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
  );
}

export function QuickStatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}

export function CardSkeleton({ className = "h-32" }: { className?: string }) {
  return <Skeleton className={`${className} rounded-xl`} />;
}

export function RoutineSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <DashboardHeaderSkeleton />
      <QuickStatsSkeleton />
      <CardSkeleton className="h-28" />
      <CardSkeleton className="h-36" />
      <CardSkeleton className="h-24" />
      <RoutineSkeleton />
    </div>
  );
}
