'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, List, PlusCircle } from 'lucide-react';
import { ErrorCard } from '@/components/common';
import ListPagination from '@/components/common/ListPagination';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserProvider';
import { DriverListState, useDrivers } from '@/hooks/drivers';
import { BUTTON_ICON_CLASS, primaryButton } from '@/lib/buttonStyles';
import { DEFAULT_DRIVER_VIEW, DRIVER_LIMIT_OPTIONS, DRIVER_VIEW_STORAGE_KEY, DriverView } from '@/lib/driver';
import { Role } from '@/lib/schemas/userSchema';
import { cn } from '@/lib/utils';
import DriverCard from './DriverCard';
import DriverEmptyState from './DriverEmptyState';
import DriverFilters from './DriverFilters';
import DriverListSkeleton from './DriverListSkeleton';
import DriverTable from './DriverTable';

type DriverListViewProps = {
  initialState?: Partial<DriverListState>;
};

const VIEW_OPTIONS: { value: DriverView; label: string; icon: typeof LayoutGrid }[] = [
  { value: 'grid', label: 'Vista de tarjetas', icon: LayoutGrid },
  { value: 'table', label: 'Vista de tabla', icon: List },
];

const readStoredView = (): DriverView => {
  try {
    const stored = window.localStorage.getItem(DRIVER_VIEW_STORAGE_KEY);
    return stored === 'grid' || stored === 'table' ? stored : DEFAULT_DRIVER_VIEW;
  } catch {
    return DEFAULT_DRIVER_VIEW;
  }
};

const DriverListView = ({ initialState }: DriverListViewProps) => {
  const { user } = useUser();
  const canCreate = user.role === Role.OWNER || user.role === Role.ADMIN;

  const [view, setView] = useState<DriverView>(DEFAULT_DRIVER_VIEW);

  // The preference lives in localStorage (not the URL); it is read after mount to keep SSR markup stable.
  useEffect(() => {
    setView(readStoredView());
  }, []);

  const changeView = (next: DriverView) => {
    setView(next);
    try {
      window.localStorage.setItem(DRIVER_VIEW_STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private mode, blocked): the choice just won't persist.
    }
  };

  const {
    drivers,
    pagination,
    isLoading,
    error,
    page,
    limit,
    status,
    search,
    sortBy,
    sortOrder,
    archived,
    setPage,
    setLimit,
    setStatus,
    setSearch,
    setSort,
    setArchived,
    refetch,
  } = useDrivers(initialState);

  const hasFilters = !!status || !!search.trim() || archived;
  const total = pagination?.total ?? 0;
  const subtitle = archived
    ? `${total} ${total === 1 ? 'conductor archivado' : 'conductores archivados'}`
    : `${total} ${total === 1 ? 'conductor registrado' : 'conductores registrados'}`;

  const clearFilters = () => {
    setSearch('');
    setStatus(undefined);
    setArchived(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="typo-title text-carbon-500">Conductores</h1>
          <p className="typo-text text-carbon-300" aria-live="polite">
            {pagination ? subtitle : ' '}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div role="group" aria-label="Cambiar vista" className="bg-surface-600/60 flex rounded-lg p-1">
            {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-label={label}
                aria-pressed={view === value}
                onClick={() => changeView(value)}
                className={cn(
                  'flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors',
                  view === value ? 'bg-terciary-500 text-primary-100' : 'text-carbon-300 hover:text-carbon-500',
                )}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>

          {canCreate && (
            <Button asChild className={primaryButton()}>
              <Link href="/conductores/nuevo">
                <PlusCircle className={BUTTON_ICON_CLASS} aria-hidden /> Agregar conductor
              </Link>
            </Button>
          )}
        </div>
      </div>

      <DriverFilters
        search={search}
        status={status}
        sortBy={sortBy}
        sortOrder={sortOrder}
        archived={archived}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
        onArchivedChange={setArchived}
      />

      <div className="min-w-0 space-y-4">
        {isLoading && drivers.length === 0 ? (
          <DriverListSkeleton view={view} />
        ) : error ? (
          <ErrorCard message={error} onRetry={refetch} />
        ) : drivers.length === 0 ? (
          <DriverEmptyState hasFilters={hasFilters} canCreate={canCreate} onClearFilters={clearFilters} />
        ) : (
          <>
            {view === 'grid' ? (
              <div
                className={cn(
                  'grid gap-5 transition-opacity sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
                  isLoading && 'opacity-60',
                )}
              >
                {drivers.map((driver) => (
                  <DriverCard key={driver.id} driver={driver} archived={archived} onChanged={refetch} />
                ))}
              </div>
            ) : (
              <DriverTable drivers={drivers} archived={archived} isLoading={isLoading} onChanged={refetch} />
            )}

            {pagination && pagination.totalPages > 0 && (
              <ListPagination
                page={page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={limit}
                limitOptions={DRIVER_LIMIT_OPTIONS}
                noun="conductores"
                onPageChange={setPage}
                onLimitChange={setLimit}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DriverListView;
