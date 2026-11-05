import { SortOrder } from '@/types/transaction';
import { DriverDetail, DriverSortBy, DriverStatus, Garage, Guarantor } from '@/types/driver';

export const DEFAULT_DRIVER_PAGE = 1;
export const DEFAULT_DRIVER_LIMIT = 12;
export const DRIVER_LIMIT_OPTIONS = [12, 24, 48] as const;
export const DEFAULT_DRIVER_SORT_BY: DriverSortBy = 'created_at';
export const DEFAULT_DRIVER_SORT_ORDER: SortOrder = 'desc';

export const DRIVER_VIEW_STORAGE_KEY = 'pegazzo:drivers:view';
export type DriverView = 'grid' | 'table';
export const DEFAULT_DRIVER_VIEW: DriverView = 'grid';

/** CURP: 18 characters (4 letters, birth date, sex, state, 3 consonants, homoclave and check digit). */
export const CURP_LENGTH = 18;
export const CURP_REGEX = /^[A-Z]{4}\d{6}[HMX][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;

/** Backend limit (`GuarantorConfig.MAX_PER_DRIVER`). */
export const MAX_GUARANTORS = 5;

export const DRIVER_STATUSES: DriverStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

export const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  SUSPENDED: 'Suspendido',
};

export type DriverSortOption = { value: string; label: string; sortBy: DriverSortBy; sortOrder: SortOrder };

export const DRIVER_SORT_OPTIONS: DriverSortOption[] = [
  { value: 'created_at:desc', label: 'Más recientes', sortBy: 'created_at', sortOrder: 'desc' },
  { value: 'created_at:asc', label: 'Más antiguos', sortBy: 'created_at', sortOrder: 'asc' },
  { value: 'name:asc', label: 'Nombre A–Z', sortBy: 'name', sortOrder: 'asc' },
  { value: 'name:desc', label: 'Nombre Z–A', sortBy: 'name', sortOrder: 'desc' },
  { value: 'status:asc', label: 'Estado A–Z', sortBy: 'status', sortOrder: 'asc' },
  { value: 'status:desc', label: 'Estado Z–A', sortBy: 'status', sortOrder: 'desc' },
];

export const getDriverSortOptionValue = (sortBy: DriverSortBy, sortOrder: SortOrder): string =>
  `${sortBy}:${sortOrder}`;

export const isDriverStatus = (value: string | undefined | null): value is DriverStatus =>
  !!value && (DRIVER_STATUSES as string[]).includes(value);

export const isDriverSortBy = (value: string | undefined | null): value is DriverSortBy =>
  !!value && ['name', 'status', 'created_at'].includes(value);

export const getDriverFullName = (driver: { name: string; surnames: string }): string =>
  `${driver.name} ${driver.surnames}`.trim();

/* ------------------------------------------------------------------ documents */

/**
 * Documents asked for in the dashboard, per owner. The backend also accepts `contract` and `promissory_note` (driver and
 * guarantors), but those are uploaded later, when the contracts are generated, so they are not asked for here.
 */
export const DRIVER_DOCUMENT_TYPES = ['ine', 'driver_license', 'proof_of_address'] as const;
export const GUARANTOR_DOCUMENT_TYPES = ['ine', 'proof_of_address'] as const;
/** Each garage has its own address proof. */
export const GARAGE_DOCUMENT_TYPES = ['proof_of_address'] as const;

/** All of them are required to be able to activate the driver. */
export const REQUIRED_DRIVER_DOCUMENT_TYPES: readonly string[] = DRIVER_DOCUMENT_TYPES;
export const REQUIRED_GUARANTOR_DOCUMENT_TYPES: readonly string[] = GUARANTOR_DOCUMENT_TYPES;
export const REQUIRED_GARAGE_DOCUMENT_TYPES: readonly string[] = GARAGE_DOCUMENT_TYPES;

export const GARAGE_PROOF_LABEL = 'Comprobante de domicilio de la cochera';

/** Shown where documents are uploaded, so nobody looks for the contract or the promissory notes here. */
export const LATER_DOCUMENTS_NOTE =
  'El contrato y los pagarés (del conductor y de sus avales) no se suben aquí: se cargarán más adelante, al generar los contratos.';

const DRIVER_DOCUMENT_LABELS: Record<string, string> = {
  ine: 'INE',
  driver_license: 'Licencia de conducir',
  proof_of_address: 'Comprobante de domicilio',
  contract: 'Contrato',
  promissory_note: 'Pagaré',
};

export const getDriverDocumentLabel = (type: string): string => DRIVER_DOCUMENT_LABELS[type] ?? type;

/** When a type has several documents (old uploads) the newest one, i.e. the highest id, is the current one. */
export const currentDocumentsByType = <T extends { id: number; type: string }>(documents: T[]): Record<string, T> =>
  documents.reduce<Record<string, T>>(
    (acc, doc) => (!acc[doc.type] || doc.id > acc[doc.type].id ? { ...acc, [doc.type]: doc } : acc),
    {},
  );

export type MissingDriverDocuments = {
  driver: string[];
  guarantors: { guarantor: Guarantor; missing: string[] }[];
  garages: { garage: Garage; missing: string[] }[];
  /** Total number of missing required documents (driver + every guarantor). */
  total: number;
};

export const getMissingDriverDocuments = (
  driver: Pick<DriverDetail, 'documents' | 'guarantors' | 'garages'>,
): MissingDriverDocuments => {
  const own = currentDocumentsByType(driver.documents);
  const missingOwn = REQUIRED_DRIVER_DOCUMENT_TYPES.filter((type) => !own[type]);
  const guarantors = driver.guarantors.map((guarantor) => {
    const stored = currentDocumentsByType(guarantor.documents);
    return { guarantor, missing: REQUIRED_GUARANTOR_DOCUMENT_TYPES.filter((type) => !stored[type]) };
  });
  const garages = (driver.garages ?? []).map((garage) => {
    const stored = currentDocumentsByType(garage.documents);
    return { garage, missing: REQUIRED_GARAGE_DOCUMENT_TYPES.filter((type) => !stored[type]) };
  });
  const total =
    missingOwn.length +
    guarantors.reduce((sum, item) => sum + item.missing.length, 0) +
    garages.reduce((sum, item) => sum + item.missing.length, 0);
  return { driver: missingOwn, guarantors, garages, total };
};

/** Why the driver cannot be set to Activo yet, or `null` when it can. */
export const getActivationBlocker = (
  driver: Pick<DriverDetail, 'documents' | 'guarantors' | 'garages'>,
): string | null => {
  if (driver.guarantors.length === 0) return 'Falta registrar al menos un aval';
  if ((driver.garages ?? []).length === 0) return 'Falta registrar al menos una cochera';
  return getMissingDriverDocuments(driver).total > 0 ? 'Faltan documentos obligatorios' : null;
};
