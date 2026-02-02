import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function NutritionSummarySkeleton() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MealBlockSkeleton() {
  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-2 bg-muted/30">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MealsSkeleton() {
  return (
    <div className="space-y-4">
      <NutritionSummarySkeleton />
      {[...Array(4)].map((_, i) => (
        <MealBlockSkeleton key={i} />
      ))}
    </div>
  );
}
