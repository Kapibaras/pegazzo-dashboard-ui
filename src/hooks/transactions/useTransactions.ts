'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SingletonAPIClient } from '@/api';
import BalanceService from '@/services/balance';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import { parsePeriod, periodToApiParams } from '@/lib/balance';
import { DEFAULT_LIMIT, DEFAULT_PAGE, DEFAULT_SORT_BY, DEFAULT_SORT_ORDER } from '@/lib/transaction';
import { PaginationMeta, Transaction, TransactionSortBy, SortOrder } from '@/types/transaction';

const useTransactions = () => {
  const searchParams = useSearchParams();
  const { handleApiError } = useApiErrorHandler();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [sortBy, setSortBy] = useState<TransactionSortBy>(DEFAULT_SORT_BY);
  const [sortOrder, setSortOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER);

  const abortControllerRef = useRef<AbortController | null>(null);
  const prevPeriodRef = useRef<string>('');
  const handleApiErrorRef = useRef(handleApiError);
  handleApiErrorRef.current = handleApiError;

  const period = parsePeriod(searchParams.get('period') ?? undefined);
  const periodKey = `${period}-${searchParams.toString()}`;

  const fetchTransactions = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const client = SingletonAPIClient.getInstance();
      const service = new BalanceService(client);
      const periodParams = periodToApiParams(period);

      const response = await service.getTransactions({
        ...periodParams,
        page,
        limit: DEFAULT_LIMIT,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (controller.signal.aborted) return;

      setTransactions(response.transactions);
      setPagination(response.pagination);
    } catch (err) {
      if (controller.signal.aborted) return;

      const apiError = err as { status?: number; detail?: string; message?: string };
      if (apiError.status === 401) {
        await handleApiErrorRef.current({ status: 401, detail: apiError.detail ?? '' });
        return;
      }

      setError(apiError.detail ?? apiError.message ?? 'Error al cargar las transacciones.');
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [period, page, sortBy, sortOrder]);

  // Reset page when period changes
  useEffect(() => {
    if (prevPeriodRef.current && prevPeriodRef.current !== periodKey) {
      setPage(DEFAULT_PAGE);
    }
    prevPeriodRef.current = periodKey;
  }, [periodKey]);

  useEffect(() => {
    fetchTransactions();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchTransactions]);

  const handleSort = useCallback(
    (column: TransactionSortBy) => {
      if (column === sortBy) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(column);
        setSortOrder(DEFAULT_SORT_ORDER);
      }
      setPage(DEFAULT_PAGE);
    },
    [sortBy],
  );

  return {
    transactions,
    pagination,
    isLoading,
    error,
    page,
    sortBy,
    sortOrder,
    setPage,
    handleSort,
    refetch: fetchTransactions,
  };
};

export default useTransactions;
