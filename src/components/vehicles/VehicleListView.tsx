'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, List, PlusCircle, Settings } from 'lucide-react';
import { ErrorCard } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserProvider';
import { useVehicles, VehicleListState } from '@/hooks/vehicles';
import { BUTTON_ICON_CLASS, outlineButton, primaryButton } from '@/lib/buttonStyles';
import { Role } from '@/lib/schemas/userSchema';
import { DEFAULT_VEHICLE_VIEW, VEHICLE_LIMIT_OPTIONS, VEHICLE_VIEW_STORAGE_KEY, VehicleView } from '@/lib/vehicle';
import { cn } from '@/lib/utils';
import VehicleCard from './VehicleCard';
import VehicleEmptyState from './VehicleEmptyState';
import VehicleFilters from './VehicleFilters';
import VehicleListSkeleton from './VehicleListSkeleton';
import ListPagination from '@/components/common/ListPagination';
import VehicleTable from './VehicleTable';

type VehicleListViewProps = {
  initialState?: Partial<VehicleListState>;
};

const VIEW_OPTIONS: { value: VehicleView; label: string; icon: typeof LayoutGrid }[] = [
  { value: 'grid', label: 'Vista de tarjetas', icon: LayoutGrid },
  { value: 'table', label: 'Vista de tabla', icon: List },
];

const readStoredView = (): VehicleView => {
  try {
    const stored = window.localStorage.getItem(VEHICLE_VIEW_STORAGE_KEY);
    return stored === 'grid' || stored === 'table' ? stored : DEFAULT_VEHICLE_VIEW;
  } catch {
    return DEFAULT_VEHICLE_VIEW;
  }
};

const VehicleListView = ({ initialState }: VehicleListViewProps) => {
  const { user } = useUser();
  const canCreate = user.role === Role.OWNER || user.role === Role.ADMIN;

  const [view, setView] = useState<VehicleView>(DEFAULT_VEHICLE_VIEW);

  // The preference lives in localStorage (not the URL); it is read after mount to keep SSR markup stable.
  useEffect(() => {
    setView(readStoredView());
  }, []);

  const changeView = (next: VehicleView) => {
    setView(next);
    try {
      window.localStorage.setItem(VEHICLE_VIEW_STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private mode, blocked): the choice just won't persist.
    }
  };

  const {
    vehicles,
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
  } = useVehicles(initialState);

  const hasFilters = !!status || !!search.trim() || archived;
  const total = pagination?.total ?? 0;
  const subtitle = archived
    ? `${total} ${total === 1 ? 'vehículo archivado' : 'vehículos archivados'}`
    : `${total} ${total === 1 ? 'vehículo en la flota' : 'vehículos en la flota'}`;

  const clearFilters = () => {
    setSearch('');
    setStatus(undefined);
    setArchived(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="typo-title text-carbon-500">Coches</h1>
          <p className="typo-text text-carbon-300" aria-live="polite">
            {pagination ? subtitle : ' '}
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

          {user.role === Role.OWNER && (
            <Button asChild variant="outline" className={outlineButton()}>
              <Link href="/configuracion/coches">
                <Settings className={BUTTON_ICON_CLASS} aria-hidden /> Configuración
              </Link>
            </Button>
          )}

          {canCreate && (
            <Button asChild className={primaryButton()}>
              <Link href="/coches/nuevo">
                <PlusCircle className={BUTTON_ICON_CLASS} aria-hidden /> Agregar coche
              </Link>
            </Button>
          )}
        </div>
      </div>

      <VehicleFilters
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
        {isLoading && vehicles.length === 0 ? (
          <VehicleListSkeleton view={view} />
        ) : error ? (
          <ErrorCard message={error} onRetry={refetch} />
        ) : vehicles.length === 0 ? (
          <VehicleEmptyState hasFilters={hasFilters} canCreate={canCreate} onClearFilters={clearFilters} />
        ) : (
          <>
            {view === 'grid' ? (
              <div
                className={cn(
                  'grid gap-5 transition-opacity sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
                  isLoading && 'opacity-60',
                )}
              >
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} archived={archived} onChanged={refetch} />
                ))}
              </div>
            ) : (
              <VehicleTable vehicles={vehicles} archived={archived} isLoading={isLoading} onChanged={refetch} />
            )}

            {pagination && pagination.totalPages > 0 && (
              <ListPagination
                page={page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={limit}
                limitOptions={VEHICLE_LIMIT_OPTIONS}
                noun="coches"
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

export default VehicleListView;
