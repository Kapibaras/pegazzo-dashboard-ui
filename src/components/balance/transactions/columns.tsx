'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transaction, TransactionSortBy, SortOrder } from '@/types/transaction';
import { TRANSACTION_TYPE_LABELS } from '@/lib/transaction';
import { PAYMENT_METHOD_LABELS } from '@/lib/balance';
import { formatCurrency } from '@/utils/formatters';
import { formatLongDatetime } from '@/utils/datetime/date';
import { cn } from '@/lib/utils';

type SortableHeaderProps = {
  label: string;
  columnKey: TransactionSortBy;
  sortBy: TransactionSortBy;
  sortOrder: SortOrder;
  onSort: (column: TransactionSortBy) => void;
};

const SortableHeader = ({ label, columnKey, sortBy, sortOrder, onSort }: SortableHeaderProps) => {
  const isActive = sortBy === columnKey;
  const Icon = isActive ? (sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <Button
      variant="ghost"
      className="text-primary-100 typo-bold-text hover:bg-primary-100 cursor-pointer"
      onClick={() => onSort(columnKey)}
    >
      {label}
      <Icon className="h-4! w-4!" />
    </Button>
  );
};

type GetColumnsParams = {
  sortBy: TransactionSortBy;
  sortOrder: SortOrder;
  onSort: (column: TransactionSortBy) => void;
};

export const getColumns = ({ sortBy, sortOrder, onSort }: GetColumnsParams): ColumnDef<Transaction>[] => [
  {
    accessorKey: 'reference',
    header: () => (
      <SortableHeader label="Referencia" columnKey="reference" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
    ),
    cell: ({ row }) => <span className="typo-bold-text text-primary-600">{row.getValue<string>('reference')}</span>,
  },
  {
    accessorKey: 'date',
    header: () => (
      <SortableHeader label="Fecha" columnKey="date" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
    ),
    cell: ({ row }) => <span className="font-numbers">{formatLongDatetime(row.getValue<string>('date'))}</span>,
  },
  {
    accessorKey: 'type',
    header: () => <span className="text-primary-100 typo-bold-text">Tipo</span>,
    cell: ({ row }) => {
      const type = row.getValue<string>('type');
      const isCredit = type === 'credit';
      return (
        <Badge
          className={cn(
            'text-xs font-medium',
            isCredit
              ? 'bg-success-50 text-success-700 hover:bg-success-50'
              : 'bg-error-50 text-error-700 hover:bg-error-50',
          )}
        >
          {TRANSACTION_TYPE_LABELS[type] ?? type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: () => (
      <SortableHeader label="Monto" columnKey="amount" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      const amount = row.getValue<number>('amount');
      const isCredit = type === 'credit';
      return (
        <span className={cn('font-numbers font-medium', isCredit ? 'text-success-700' : 'text-error-700')}>
          {isCredit ? '+' : '-'}
          {formatCurrency(amount)}
        </span>
      );
    },
  },
  {
    accessorKey: 'paymentMethod',
    header: () => <span className="text-primary-100 typo-bold-text">Método de Pago</span>,
    cell: ({ row }) => {
      const method = row.getValue<string>('paymentMethod');
      return <span>{PAYMENT_METHOD_LABELS[method] ?? method}</span>;
    },
  },
  {
    accessorKey: 'description',
    header: () => <span className="text-primary-100 typo-bold-text">Descripción</span>,
    cell: ({ row }) => {
      const description = row.getValue<string>('description');
      return (
        <span className="block max-w-[200px] truncate" title={description}>
          {description}
        </span>
      );
    },
  },
];

export const columnsLength = 6;
