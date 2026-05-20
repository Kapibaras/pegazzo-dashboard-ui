import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const SKELETON_ROWS = 6;

const HEADERS = ['Referencia', 'Fecha', 'Tipo', 'Monto', 'Categoría', 'Acciones'];

const AutorizacionesTableSkeleton = () => {
  return (
    <div className="border-secondary-100/80 min-w-0 overflow-hidden rounded-lg border shadow-sm">
      <Table>
        <TableHeader className="border-primary-700/20 from-secondary-500 to-secondary-600 border-b bg-gradient-to-b">
          <TableRow className="hover:bg-transparent">
            {HEADERS.map((label) => (
              <TableHead key={label} className="px-5 py-3 lg:px-6">
                <span className="text-primary-100 typo-bold-text">{label}</span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: SKELETON_ROWS }).map((_, rowIdx) => (
            <TableRow
              key={rowIdx}
              className={cn('border-secondary-100/50', rowIdx % 2 === 0 ? 'bg-white' : 'bg-surface-300/50')}
            >
              {HEADERS.map((label) => (
                <TableCell key={label} className="px-5 py-3.5 lg:px-6">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AutorizacionesTableSkeleton;
