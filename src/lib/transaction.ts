import { TransactionSortBy, SortOrder } from '@/types/transaction';
import { MONTH_NAMES } from '@/lib/balance';
import CONSTANTS from '@/config/constants';

export type TransactionPeriodType = 'month' | 'year';

export const TRANSACTION_PERIOD_OPTIONS: { value: TransactionPeriodType; label: string }[] = [
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
];

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  debit: 'Gasto',
  credit: 'Ingreso',
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
