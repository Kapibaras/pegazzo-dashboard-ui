import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const KPICardSkeleton = () => (
  <Card className="min-w-0">
    <CardHeader>
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <Skeleton className="h-5 w-24" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-4 w-16" />
      </div>
    </CardContent>
  </Card>
);

const ComparisonRowSkeleton = () => (
  <div className="flex items-center justify-between gap-4 py-3">
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-7 w-20 rounded-full" />
    <Skeleton className="ml-auto h-4 w-52" />
  </div>
);

const BalanceSkeleton = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-96 rounded-md bg-muted-foreground/15" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-56" />
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            <ComparisonRowSkeleton />
            <ComparisonRowSkeleton />
            <ComparisonRowSkeleton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceSkeleton;
