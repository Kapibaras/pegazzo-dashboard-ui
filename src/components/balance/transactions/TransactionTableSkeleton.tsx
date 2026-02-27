import { ArrowUpDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const SKELETON_ROWS = 12;
const COLUMN_COUNT = 6;

const HEADERS: { label: string; sortable: boolean }[] = [
  { label: 'Referencia', sortable: true },
  { label: 'Fecha', sortable: true },
  { label: 'Tipo', sortable: false },
  { label: 'Monto', sortable: true },
  { label: 'Método de Pago', sortable: false },
  { label: 'Descripción', sortable: false },
];

const TransactionTableSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="border-secondary-100 min-w-0 overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-secondary-500">
            <TableRow className="hover:bg-secondary-500!">
              {HEADERS.map((header) => (
                <TableHead key={header.label} className="px-5 py-2 lg:px-6 lg:py-3">
                  {header.sortable ? (
                    <span className="typo-bold-text text-primary-100 inline-flex items-center gap-2 px-3 py-1.5">
                      {header.label}
                      <ArrowUpDown className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="text-primary-100 typo-bold-text">{header.label}</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: SKELETON_ROWS }).map((_, rowIdx) => (
              <TableRow key={rowIdx} className="border-secondary-100">
                {Array.from({ length: COLUMN_COUNT }).map((_, colIdx) => (
                  <TableCell key={colIdx} className="px-5 py-3 lg:px-6">
                    <Skeleton className="h-4 w-24" />
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
