import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VehicleView } from '@/lib/vehicle';
import { VEHICLE_TABLE_HEADERS } from './VehicleTable';

const GRID_ITEMS = 8;
const TABLE_ROWS = 8;

const GridSkeleton = () => (
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" aria-hidden>
    {Array.from({ length: GRID_ITEMS }, (_, index) => (
      <div key={index} className="border-surface-600/70 overflow-hidden rounded-xl border bg-white">
        <Skeleton className="aspect-[16/10] w-full rounded-none" />
        <div className="flex flex-col gap-2 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="border-secondary-100/80 min-w-0 overflow-hidden rounded-lg border shadow-sm" aria-hidden>
    <Table>
      <TableHeader className="border-primary-700/20 from-secondary-500 to-secondary-600 border-b bg-gradient-to-b">
        <TableRow className="hover:bg-transparent">
          {VEHICLE_TABLE_HEADERS.map((header) => (
            <TableHead key={header} className="typo-bold-text text-primary-100 px-5 py-3">
              {header}
            </TableHead>
          ))}
          <TableHead className="w-12 px-3" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: TABLE_ROWS }, (_, row) => (
          <TableRow key={row}>
            <TableCell className="px-5 py-2.5">
              <Skeleton className="h-12 w-[76px] rounded-md" />
            </TableCell>
            <TableCell className="px-5">
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell className="px-5">
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell className="px-5">
              <Skeleton className="h-4 w-12" />
            </TableCell>
            <TableCell className="px-5">
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell className="px-5">
              <Skeleton className="h-5 w-20 rounded-full" />
            </TableCell>
            <TableCell className="px-3">
              <Skeleton className="size-6 rounded-md" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const VehicleListSkeleton = ({ view }: { view: VehicleView }) => (view === 'grid' ? <GridSkeleton /> : <TableSkeleton />);

export default VehicleListSkeleton;
