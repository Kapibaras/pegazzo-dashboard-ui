'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SingletonAPIClient } from '@/api';
import BalanceService from '@/services/balance';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  TransactionPeriodType,
} from '@/lib/transaction';
import { PaginationMeta, Transaction, TransactionsParams, TransactionSortBy, SortOrder } from '@/types/transaction';

export type PeriodParams = {
  period: TransactionPeriodType;
  year: number;
  month?: number;
};

const useTransactions = () => {
  const { handleApiError } = useApiErrorHandler();

  const now = new Date();
  const [periodType, setPeriodType] = useState<TransactionPeriodType>('month');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimitState] = useState(DEFAULT_LIMIT);
  const [sortBy, setSortBy] = useState<TransactionSortBy>(DEFAULT_SORT_BY);
  const [sortOrder, setSortOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER);

  const abortControllerRef = useRef<AbortController | null>(null);
  const handleApiErrorRef = useRef(handleApiError);
  handleApiErrorRef.current = handleApiError;

  const fetchTransactions = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const client = SingletonAPIClient.getInstance();
      const service = new BalanceService(client);

      const params: TransactionsParams = {
        period: periodType,
        year,
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (periodType === 'month') {
        params.month = month;
      }

      const response = await service.getTransactions(params);

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
  }, [periodType, year, month, page, limit, sortBy, sortOrder]);

  useEffect(() => {
    fetchTransactions();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchTransactions]);

  const setPeriodParams = useCallback((params: PeriodParams) => {
    setPeriodType(params.period);
    setYear(params.year);
    if (params.month !== undefined) setMonth(params.month);
    setPage(DEFAULT_PAGE);
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPage(DEFAULT_PAGE);
  }, []);

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
    refetch: fetchTransactions,
  };
};

export default useTransactions;
