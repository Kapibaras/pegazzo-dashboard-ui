import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const SKELETON_ROWS = 10;
const COLUMN_WIDTHS = ['w-28', 'w-36', 'w-16', 'w-24', 'w-28', 'w-40'];

const TransactionTableSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="border-secondary-100 overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-secondary-500">
            <TableRow className="hover:bg-secondary-500!">
              {COLUMN_WIDTHS.map((width, i) => (
                <TableHead key={i} className="px-5 py-2 lg:px-6 lg:py-3">
                  <Skeleton className={`h-4 ${width}`} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: SKELETON_ROWS }).map((_, rowIdx) => (
              <TableRow key={rowIdx} className="border-secondary-100">
                {COLUMN_WIDTHS.map((width, colIdx) => (
                  <TableCell key={colIdx} className="px-5 py-3 lg:px-6">
                    <Skeleton className={`h-4 ${width}`} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionTableSkeleton;
