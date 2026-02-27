import { TransactionSortBy, SortOrder } from '@/types/transaction';

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  debit: 'Gasto',
  credit: 'Ingreso',
};

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const DEFAULT_SORT_BY: TransactionSortBy = 'date';
export const DEFAULT_SORT_ORDER: SortOrder = 'desc';
