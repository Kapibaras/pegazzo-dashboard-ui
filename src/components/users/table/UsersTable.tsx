'use client';

import { flexRender, Table as TableType } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { columnsLength } from './columns';
import ViewUserSheet from '../ViewUserSheet';
import { User } from '@/types/user';
import { cn } from '@/lib/utils';

const UsersTable = ({ table }: { table: TableType<User> }) => {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-secondary-100/80 shadow-sm">
      <Table>
        <TableHeader className="border-b border-primary-700/20 bg-gradient-to-b from-secondary-500 to-secondary-600">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="px-5 py-3 lg:px-10">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <ViewUserSheet key={row.id} user={row.original}>
                <TableRow
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    'border-secondary-100/50 cursor-pointer transition-colors duration-150',
                    row.index % 2 === 0 ? 'bg-white' : 'bg-surface-300/50',
                    'hover:bg-primary-50/80',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3.5 lg:px-7 [&:has(.username)]:w-[85%]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              </ViewUserSheet>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnsLength} className="h-32 text-center">
                <span className="typo-text text-secondary-200">No hay usuarios para mostrar.</span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
