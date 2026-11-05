import { DriverListSkeleton } from '@/components/drivers';
import { Skeleton } from '@/components/ui/skeleton';

const Loading = () => (
  <div className="flex flex-col gap-5">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-5 w-56" />
    </div>
    <Skeleton className="h-9 w-full max-w-md" />
    <DriverListSkeleton view="grid" />
  </div>
);

export default Loading;
