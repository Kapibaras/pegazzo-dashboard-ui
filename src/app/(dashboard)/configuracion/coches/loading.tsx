import { Skeleton } from '@/components/ui/skeleton';

const Loading = () => (
  <div className="flex flex-col gap-5">
    <div className="space-y-2">
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-5 w-44" />
    </div>
    <Skeleton className="h-9 w-full max-w-md" />
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-48 w-full" />
      ))}
    </div>
  </div>
);

export default Loading;
