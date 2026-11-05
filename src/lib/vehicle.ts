import { SortOrder } from '@/types/transaction';
import { VehicleSortBy, VehicleStatus } from '@/types/vehicle';

export const DEFAULT_VEHICLE_PAGE = 1;
export const DEFAULT_VEHICLE_LIMIT = 12;
export const VEHICLE_LIMIT_OPTIONS = [12, 24, 48] as const;
export const DEFAULT_VEHICLE_SORT_BY: VehicleSortBy = 'created_at';
export const DEFAULT_VEHICLE_SORT_ORDER: SortOrder = 'desc';

export const VEHICLE_VIEW_STORAGE_KEY = 'pegazzo:vehicles:view';
export type VehicleView = 'grid' | 'table';
export const DEFAULT_VEHICLE_VIEW: VehicleView = 'grid';

export const MAX_VEHICLE_PHOTOS = 4;

export const VEHICLE_STATUSES: VehicleStatus[] = ['ACTIVE', 'INACTIVE', 'IN_MAINTENANCE'];

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  IN_MAINTENANCE: 'En mantenimiento',
};

export type VehicleSortOption = { value: string; label: string; sortBy: VehicleSortBy; sortOrder: SortOrder };

/** The backend also supports `sort_by=status` and `year`, but the design does not expose them. */
export const VEHICLE_SORT_OPTIONS: VehicleSortOption[] = [
  { value: 'created_at:desc', label: 'Más recientes', sortBy: 'created_at', sortOrder: 'desc' },
  { value: 'created_at:asc', label: 'Más antiguos', sortBy: 'created_at', sortOrder: 'asc' },
  { value: 'make:asc', label: 'Marca A–Z', sortBy: 'make', sortOrder: 'asc' },
  { value: 'make:desc', label: 'Marca Z–A', sortBy: 'make', sortOrder: 'desc' },
  { value: 'plate:asc', label: 'Placa A–Z', sortBy: 'plate', sortOrder: 'asc' },
  { value: 'plate:desc', label: 'Placa Z–A', sortBy: 'plate', sortOrder: 'desc' },
];

export const getSortOptionValue = (sortBy: VehicleSortBy, sortOrder: SortOrder): string => `${sortBy}:${sortOrder}`;

export const isVehicleStatus = (value: string | undefined | null): value is VehicleStatus =>
  !!value && (VEHICLE_STATUSES as string[]).includes(value);

export const isVehicleSortBy = (value: string | undefined | null): value is VehicleSortBy =>
  !!value && ['make', 'plate', 'status', 'year', 'created_at'].includes(value);

export const getVehicleTitle = (vehicle: { make: string; model: string }): string =>
  `${vehicle.make} ${vehicle.model}`.trim();

/** Colour names stored as free text -> a CSS colour for the swatch dot (falls back to neutral grey). */
const COLOR_SWATCHES: Record<string, string> = {
  blanco: '#ffffff',
  negro: '#121212',
  gris: '#878787',
  plata: '#c0c0c0',
  plateado: '#c0c0c0',
  rojo: '#c61518',
  azul: '#2083aa',
  verde: '#16b451',
  amarillo: '#f0b429',
  naranja: '#f97316',
  cafe: '#78350f',
  café: '#78350f',
  beige: '#d6c3a1',
  dorado: '#ca8a04',
  morado: '#7c3aed',
};

export const getColorSwatch = (color: string): string => COLOR_SWATCHES[color.trim().toLowerCase()] ?? '#b3b8bd';

export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '—';
  const amount = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(
    amount,
  );
};

export const formatOdometer = (value: number | null | undefined): string =>
  value === null || value === undefined ? '—' : `${new Intl.NumberFormat('es-MX').format(value)} km`;

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  circulation_card: 'Tarjeta de circulación',
  plates: 'Placas',
  insurance_policy: 'Póliza de seguro',
  invoice: 'Factura de compra',
  credit_contract: 'Contrato de crédito',
  amortization_table: 'Tabla de amortización',
};

export const getDocumentTypeLabel = (type: string): string => DOCUMENT_TYPE_LABELS[type] ?? type;

const TRANSMISSION_LABELS: Record<string, string> = {
  TM: 'Manual (TM)',
  TA: 'Automática (TA)',
  MT: 'Manual (MT)',
  AT: 'Automática (AT)',
};

export const getTransmissionLabel = (value: string): string => TRANSMISSION_LABELS[value.toUpperCase()] ?? value;

/** Pegazzo-owned cars store "Pegazzo" as the legal owner name (see the wizard's "Propiedad de Pegazzo" toggle). */
export const isPegazzoOwner = (legalOwnerName: string): boolean => legalOwnerName.trim().toLowerCase() === 'pegazzo';

/**
 * Documents that must be uploaded for a car, which depend on its financing:
 * - liquidated: the purchase invoice exists and there is no credit contract nor amortization table to ask for;
 * - not liquidated: the credit contract and the amortization table are asked for instead (the invoice is not available yet).
 * The insurance policy, circulation card and plates are always required.
 */
export const requiredDocumentTypes = (isLiquidated: boolean): string[] =>
  isLiquidated
    ? ['invoice', 'insurance_policy', 'circulation_card', 'plates']
    : ['credit_contract', 'amortization_table', 'insurance_policy', 'circulation_card', 'plates'];
