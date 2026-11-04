'use client';

import { useEffect, useState } from 'react';
import { ArrowUpDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { VEHICLE_SORT_OPTIONS, VEHICLE_STATUSES, VEHICLE_STATUS_LABELS, getSortOptionValue } from '@/lib/vehicle';
import { cn } from '@/lib/utils';
import { SortOrder } from '@/types/transaction';
import { VehicleSortBy, VehicleStatus } from '@/types/vehicle';

const ALL_VALUE = '__all__';
const SEARCH_DEBOUNCE_MS = 400;

const TRIGGER_CLASSES = cn(
  'cursor-pointer border-primary-200/40 bg-primary-50/40 text-primary-800 font-medium shadow-sm transition-all',
  'hover:bg-primary-100/60 hover:border-primary-300/50 focus:ring-primary-400/30',
  'data-[state=open]:bg-primary-100/60 data-[state=open]:border-primary-400/50',
);
const ITEM_CLASSES = 'text-primary-800 focus:bg-primary-100/60 focus:text-primary-900 cursor-pointer font-medium';

type VehicleFiltersProps = {
  search: string;
  status: VehicleStatus | undefined;
  sortBy: VehicleSortBy;
  sortOrder: SortOrder;
  archived: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: VehicleStatus | undefined) => void;
  onSortChange: (sortBy: VehicleSortBy, sortOrder: SortOrder) => void;
  onArchivedChange: (value: boolean) => void;
};

const VehicleFilters = ({
  search,
  status,
  sortBy,
  sortOrder,
  archived,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onArchivedChange,
}: VehicleFiltersProps) => {
  const [draft, setDraft] = useState(search);

  // Debounced search (the URL/query only changes once the user pauses typing).
  useEffect(() => {
    if (draft === search) return;
    const timeout = setTimeout(() => onSearchChange(draft), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [draft, search, onSearchChange]);

  const handleSort = (value: string) => {
    const option = VEHICLE_SORT_OPTIONS.find((candidate) => candidate.value === value);
    if (option) onSortChange(option.sortBy, option.sortOrder);
  };

  const sortValue = getSortOptionValue(sortBy, sortOrder);
  const hasKnownSort = VEHICLE_SORT_OPTIONS.some((option) => option.value === sortValue);

  return (
    <div className="flex flex-wrap items-center gap-3" role="search">
      <div className="relative min-w-[240px] flex-1 sm:max-w-md">
        <Search
          className="text-carbon-200 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Buscar por marca, modelo o id…"
          aria-label="Buscar coches"
          className="bg-surface-400 border-surface-600 h-9 pr-9 pl-9"
        />
        {draft && (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => {
              setDraft('');
              onSearchChange('');
            }}
            className="text-carbon-200 hover:text-carbon-500 absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <Select
        value={status ?? ALL_VALUE}
        onValueChange={(value) => onStatusChange(value === ALL_VALUE ? undefined : (value as VehicleStatus))}
      >
        <SelectTrigger size="sm" aria-label="Filtrar por estado" className={TRIGGER_CLASSES}>
          <span className="text-primary-700/80">Estado:</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE} className={ITEM_CLASSES}>
            Todos
          </SelectItem>
          {VEHICLE_STATUSES.map((value) => (
            <SelectItem key={value} value={value} className={ITEM_CLASSES}>
              {VEHICLE_STATUS_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={hasKnownSort ? sortValue : undefined} onValueChange={handleSort}>
        <SelectTrigger size="sm" aria-label="Ordenar coches" className={TRIGGER_CLASSES}>
          <ArrowUpDown className="size-4" aria-hidden />
          <span className="text-primary-700/80">Ordenar:</span>
          <SelectValue placeholder="Recientes" />
        </SelectTrigger>
        <SelectContent>
          {VEHICLE_SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className={ITEM_CLASSES}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(TRIGGER_CLASSES, 'h-8 gap-2 px-3', archived && 'border-primary-700 bg-primary-100/70')}
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filtros
            {archived && <span className="bg-primary-700 size-1.5 rounded-full" aria-label="Filtro activo" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span className="flex flex-col">
              <span className="text-carbon-500 text-sm font-semibold">Ver archivados</span>
              <span className="text-carbon-300 text-xs">Muestra solo los coches archivados.</span>
            </span>
            <Switch checked={archived} onCheckedChange={onArchivedChange} aria-label="Ver archivados" />
          </label>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default VehicleFilters;
