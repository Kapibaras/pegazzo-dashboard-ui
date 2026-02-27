'use client';

import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { useTransactions } from '@/hooks/transactions';
import { getTransactionPeriodSubtitle } from '@/lib/transaction';
import { getColumns } from './columns';
import TransactionTable from './TransactionTable';
import TransactionTableSkeleton from './TransactionTableSkeleton';
import TransactionPagination from './TransactionPagination';
import TransactionPeriodSelector from './TransactionPeriodSelector';
import { ErrorCard } from '@/components/common';

const TransactionTableView = () => {
  const {
    transactions,
    pagination,
    isLoading,
    error,
    page,
    limit,
    sortBy,
    sortOrder,
    periodType,
    year,
    month,
    setPage,
    setLimit,
    setPeriodParams,
    handleSort,
    refetch,
  } = useTransactions();

  const columns = getColumns({ sortBy, sortOrder, onSort: handleSort });

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
  });

  const subtitle = getTransactionPeriodSubtitle(periodType, year, periodType === 'month' ? month : undefined);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="typo-title">Transacciones</h1>
        <TransactionPeriodSelector
          periodType={periodType}
          year={year}
          month={month}
          onPeriodChange={setPeriodParams}
        />
      </div>

      <div className="min-w-0 space-y-4">
        <p className="typo-text text-muted-foreground">{subtitle}</p>

        {isLoading && transactions.length === 0 ? (
          <TransactionTableSkeleton />
        ) : error ? (
          <ErrorCard message={error} onRetry={refetch} />
        ) : (
          <>
            <TransactionTable table={table} isLoading={isLoading} />
            {pagination && pagination.totalPages > 0 && (
              <TransactionPagination
                page={page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default TransactionTableView;
