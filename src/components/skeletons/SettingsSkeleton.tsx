import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

export function SettingsCardSkeleton() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-5 w-5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <ProfileSkeleton />
      <SettingsCardSkeleton />
      <SettingsCardSkeleton />
      <SettingsCardSkeleton />
    </div>
  );
}
