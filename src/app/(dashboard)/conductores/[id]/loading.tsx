import { Skeleton } from '@/components/ui/skeleton';

const Loading = () => (
  <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando conductor">
    <div className="space-y-3">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-4 w-40" />
    </div>
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <Skeleton className="aspect-[4/3] w-full max-w-[280px] rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[117px] rounded-xl" />
        ))}
      </div>
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-48 rounded-xl" />
      ))}
    </div>
  </div>
);

export default Loading;
