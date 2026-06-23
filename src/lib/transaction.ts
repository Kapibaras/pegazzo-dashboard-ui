import { TransactionSortBy, SortOrder, TransactionStatus, TransactionType } from '@/types/transaction';
import { MONTH_NAMES } from '@/lib/balance';
import CONSTANTS from '@/config/constants';
import transactionCategories from '@/data/transactionCategories.json';

type CategoryMap = Record<string, readonly string[]>;
type TransactionCategoriesData = Record<TransactionType, CategoryMap>;

export type TransactionPeriodType = 'month' | 'year';

export const TRANSACTION_PERIOD_OPTIONS: { value: TransactionPeriodType; label: string }[] = [
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
];

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  debit: 'Cargo',
  credit: 'Abono',
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  REJECTED: 'Rechazada',
};

const TRANSACTION_CATEGORIES = transactionCategories as TransactionCategoriesData;

export const getCategoriesByType = (type: TransactionType): CategoryMap => TRANSACTION_CATEGORIES[type];

export const buildCategoryPayload = (group: string, subcategory: string): string => `${group} - ${subcategory}`;

export const parseCategoryPayload = (
  value: string | null | undefined,
): { group: string; subcategory: string } | null => {
  if (!value) return null;
  const idx = value.indexOf(' - ');
  if (idx === -1) return null;
  return { group: value.slice(0, idx), subcategory: value.slice(idx + 3) };
};

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const DEFAULT_SORT_BY: TransactionSortBy = 'date';
export const DEFAULT_SORT_ORDER: SortOrder = 'desc';

export const LIMIT_OPTIONS = [10, 25, 50];

export const getAvailableYears = (): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = CONSTANTS.BALANCE.START_YEAR; y <= currentYear; y++) {
    years.push(y);
  }
  return years;
};

export const getAvailableMonths = (year: number): number[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const maxMonth = year === currentYear ? currentMonth : 12;
  return Array.from({ length: maxMonth }, (_, i) => i + 1);
};

export const getTransactionPeriodSubtitle = (
  periodType: TransactionPeriodType,
  year: number,
  month?: number,
): string => {
  switch (periodType) {
    case 'year':
      return `Datos del año ${year}`;
    case 'month':
      return `Datos del mes de ${MONTH_NAMES[(month ?? 1) - 1]} de ${year}`;
  }
};
