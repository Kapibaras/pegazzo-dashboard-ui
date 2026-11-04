import { Skeleton } from '@/components/ui/skeleton';
import { VehicleListSkeleton } from '@/components/vehicles';

const Loading = () => (
  <div className="flex flex-col gap-5">
    <div className="space-y-2">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-5 w-56" />
    </div>
    <Skeleton className="h-9 w-full max-w-md" />
    <VehicleListSkeleton view="grid" />
  </div>
);

export default Loading;
