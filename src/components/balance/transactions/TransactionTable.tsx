'use client';

import { flexRender, Table as TableType } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Transaction } from '@/types/transaction';
import { columnsLength } from './columns';
import { cn } from '@/lib/utils';

type TransactionTableProps = {
  table: TableType<Transaction>;
  isLoading: boolean;
};

const TransactionTable = ({ table, isLoading }: TransactionTableProps) => {
  return (
    <div
      className={cn(
        'min-w-0 overflow-hidden rounded-lg border border-secondary-100/80 shadow-sm transition-all duration-300 ease-in-out',
        isLoading && 'pointer-events-none scale-[0.997] opacity-40 saturate-[0.25]',
      )}
    >
      <Table>
        <TableHeader className="border-b border-primary-700/20 bg-gradient-to-b from-secondary-500 to-secondary-600">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="px-5 py-3 lg:px-6">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  'border-secondary-100/50 transition-colors duration-150',
                  row.index % 2 === 0 ? 'bg-white' : 'bg-surface-300/50',
                  'hover:bg-primary-50/80',
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-5 py-3.5 lg:px-6">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnsLength} className="h-32 text-center">
                <span className="typo-text text-secondary-200">No hay transacciones en este período.</span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
