'use client';

import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, CircleUserRound, ShieldUser } from 'lucide-react';

import CONFIG from '@/config';

export type UserTableData = {
  username: string;
  name: string;
  surnames: string;
  role: string;
};

export const columns: ColumnDef<UserTableData>[] = [
  {
    accessorKey: 'username',
    header: () => <div className="text-primary-100 typo-bold-text">Usuario</div>,
    cell: ({ row }) => {
      const { name, surnames, username } = row.original;
      return (
        <div className="username flex w-full flex-col gap-0.5 p-2.5">
          <span className="text-primary-600 typo-bold-text max-w-3/4 text-wrap">
            {name} {surnames}
          </span>
          <span className="typo-text">{username}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <div className="flex w-full justify-end">
        <Button
          variant="ghost"
          className="text-primary-100 typo-bold-text hover:bg-primary-100 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Rol
          <ArrowUpDown className="h-5! w-5!" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const { role } = row.original;
      const RoleIcon = CONFIG.USER_ROLES.OWNER === role ? ShieldUser : CircleUserRound;

      return (
        <div className="typo-bold-text text-primary-800 flex w-full items-center justify-start gap-1 p-2.5 capitalize">
          <RoleIcon className="h-6 w-6" /> {role}
        </div>
      );
    },
  },
];
