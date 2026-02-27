'use client';

import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { useTransactions } from '@/hooks/transactions';
import { getColumns } from './columns';
import TransactionTable from './TransactionTable';
import TransactionTableSkeleton from './TransactionTableSkeleton';
import TransactionPagination from './TransactionPagination';
import { ErrorCard } from '@/components/common';
import { DEFAULT_LIMIT } from '@/lib/transaction';

const TransactionTableView = () => {
  const { transactions, pagination, isLoading, error, page, sortBy, sortOrder, setPage, handleSort, refetch } =
    useTransactions();

  const columns = getColumns({ sortBy, sortOrder, onSort: handleSort });

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
  });

  if (isLoading && transactions.length === 0) {
    return <TransactionTableSkeleton />;
  }

  if (error) {
    return <ErrorCard message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <TransactionTable table={table} isLoading={isLoading} />
      {pagination && pagination.totalPages > 0 && (
        <TransactionPagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={DEFAULT_LIMIT}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default TransactionTableView;
