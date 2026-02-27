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
    <div className={cn('border-secondary-100 overflow-hidden rounded-md border', isLoading && 'opacity-50')}>
      <Table>
        <TableHeader className="bg-secondary-500 border-secondary-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-secondary-500!">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="px-5 py-2 lg:px-6 lg:py-3">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="border-secondary-100 hover:bg-primary-50">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-5 py-3 lg:px-6">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnsLength} className="typo-text h-24 text-center">
                No hay transacciones en este período.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
