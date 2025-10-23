'use client';

import { flexRender, Table as TableType } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { columnsLength } from './columns';
import ViewUserSheet from '../ViewUserSheet';
import { User } from '@/types/user';

const UsersTable = ({ table }: { table: TableType<User> }) => {
  return (
    <div className="border-secondary-100 overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-secondary-500 border-secondary-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-secondary-500!">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="px-5 py-2 lg:px-10 lg:py-3">
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
                  className="border-secondary-100 hover:bg-primary-50 cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="lg:px-7 [&:has(.username)]:w-[85%]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              </ViewUserSheet>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnsLength} className="typo-text h-24 text-center">
                No hay usuarios para mostrar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
