'use client';

import { useState } from 'react';
import {
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  useReactTable,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { User } from '@/types/user';
import { columns } from './table/columns';
import { CreateUserSheet } from './CreateUserSheet';
import UsersTable from './table/UsersTable';
import UserInputFilter from './table/UserInputFilter';

const UsersTableView = ({ users }: { users: User[] }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ search: false });

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <>
      <div className="mb-6 flex items-center gap-7">
        <UserInputFilter table={table} />
        <CreateUserSheet />
      </div>
      <UsersTable table={table} />
    </>
  );
};

export default UsersTableView;
