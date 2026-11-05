'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SingletonAPIClient } from '@/api';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import { normalizeApiError } from '@/helpers/apiError';
import {
  DEFAULT_DRIVER_LIMIT,
  DEFAULT_DRIVER_PAGE,
  DEFAULT_DRIVER_SORT_BY,
  DEFAULT_DRIVER_SORT_ORDER,
} from '@/lib/driver';
import DriverService from '@/services/driver';
import { DriverSortBy, DriverStatus, DriverSummary, DriversParams } from '@/types/driver';
import { PaginationMeta, SortOrder } from '@/types/transaction';

export type DriverListState = {
  page: number;
  limit: number;
  status?: DriverStatus;
  search: string;
  sortBy: DriverSortBy;
  sortOrder: SortOrder;
  archived: boolean;
};

export const DEFAULT_DRIVER_LIST_STATE: DriverListState = {
  page: DEFAULT_DRIVER_PAGE,
  limit: DEFAULT_DRIVER_LIMIT,
  status: undefined,
  search: '',
  sortBy: DEFAULT_DRIVER_SORT_BY,
  sortOrder: DEFAULT_DRIVER_SORT_ORDER,
  archived: false,
};

/** Serializes the list state to the shareable URL query (`/conductores?status=ACTIVE&sort_by=name...`), omitting defaults. */
export const buildDriverQuery = (state: DriverListState): string => {
  const params = new URLSearchParams();
  const defaults = DEFAULT_DRIVER_LIST_STATE;

  if (state.status) params.set('status', state.status);
  if (state.search.trim()) params.set('search', state.search.trim());
  if (state.sortBy !== defaults.sortBy) params.set('sort_by', state.sortBy);
  if (state.sortOrder !== defaults.sortOrder || state.sortBy !== defaults.sortBy)
    params.set('sort_order', state.sortOrder);
  if (state.archived) params.set('archived', 'true');
  if (state.limit !== defaults.limit) params.set('limit', String(state.limit));
  if (state.page !== defaults.page) params.set('page', String(state.page));

  return params.toString();
};

const useDrivers = (initial: Partial<DriverListState> = {}) => {
  const { handleApiError } = useApiErrorHandler();
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<DriverListState>({ ...DEFAULT_DRIVER_LIST_STATE, ...initial });

  const [drivers, setDrivers] = useState<DriverSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const handleApiErrorRef = useRef(handleApiError);
  handleApiErrorRef.current = handleApiError;

  const service = useMemo(() => new DriverService(SingletonAPIClient.getInstance()), []);

  const { page, limit, status, search, sortBy, sortOrder, archived } = state;

  const fetchDrivers = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const params: DriversParams = { page, limit, sortBy, sortOrder, archived };
      if (status) params.status = status;
      if (search.trim()) params.search = search.trim();

      const response = await service.getDrivers(params, controller.signal);

      // The singleton client resolves `undefined` for cancelled requests.
      if (controller.signal.aborted || !response) return;

      setDrivers(response.drivers ?? []);
      setPagination(response.pagination);
    } catch (err) {
      if (controller.signal.aborted) return;

      const apiError = normalizeApiError(err, 'Error al cargar los conductores.');
      if (apiError.status === 401) {
        await handleApiErrorRef.current({ status: 401, detail: apiError.detail });
        return;
      }

      setError(apiError.detail);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [service, page, limit, status, search, sortBy, sortOrder, archived]);

  useEffect(() => {
    void fetchDrivers();
    return () => abortControllerRef.current?.abort();
  }, [fetchDrivers]);

  // Keep the URL in sync (shareable state). It goes through the router, not `history.replaceState`, so that the
  // refresh triggered by `revalidatePath` in server actions keeps the filters instead of reverting the URL.
  useEffect(() => {
    const query = buildDriverQuery(state);
    const next = query ? `${pathname}?${query}` : pathname;
    const current = `${window.location.pathname}${window.location.search}`;
    if (next !== current) router.replace(next, { scroll: false });
  }, [state, pathname, router]);

  // After archiving/deleting the last item of a page, step back to the last page that still exists.
  useEffect(() => {
    if (pagination && pagination.totalPages > 0 && page > pagination.totalPages) {
      setState((prev) => ({ ...prev, page: pagination.totalPages }));
    }
  }, [pagination, page]);

  const update = useCallback((patch: Partial<DriverListState>, resetPage = true) => {
    setState((prev) => ({ ...prev, ...patch, page: resetPage ? DEFAULT_DRIVER_PAGE : (patch.page ?? prev.page) }));
  }, []);

  const setPage = useCallback((value: number) => update({ page: value }, false), [update]);
  const setLimit = useCallback((value: number) => update({ limit: value }), [update]);
  const setStatus = useCallback((value: DriverStatus | undefined) => update({ status: value }), [update]);
  const setSearch = useCallback((value: string) => update({ search: value }), [update]);
  const setSort = useCallback(
    (nextSortBy: DriverSortBy, nextSortOrder: SortOrder) => update({ sortBy: nextSortBy, sortOrder: nextSortOrder }),
    [update],
  );
  const setArchived = useCallback((value: boolean) => update({ archived: value }), [update]);

  return {
    drivers,
    pagination,
    isLoading,
    error,
    ...state,
    setPage,
    setLimit,
    setStatus,
    setSearch,
    setSort,
    setArchived,
    refetch: fetchDrivers,
  };
};

export default useDrivers;
