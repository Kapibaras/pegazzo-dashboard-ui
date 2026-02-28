import { BalancePeriodType } from './balance';

export type TransactionType = 'debit' | 'credit';
export type PaymentMethod = 'cash' | 'personal_transfer' | 'pegazzo_transfer';
export type TransactionSortBy = 'date' | 'amount' | 'reference';
export type SortOrder = 'asc' | 'desc';

export type Transaction = {
  amount: number;
  reference: string;
  date: string;
  type: TransactionType;
  description: string;
  paymentMethod: PaymentMethod;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type TransactionsResponse = {
  transactions: Transaction[];
  pagination: PaginationMeta;
};

export type TransactionsParams = {
  period: BalancePeriodType;
  week?: number;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
  sort_by?: TransactionSortBy;
  sort_order?: SortOrder;
};

export type TransactionCreate = {
  amount: number;
  date?: string;
  type: TransactionType;
  description: string;
  payment_method: PaymentMethod;
};

export type TransactionPatch = {
  amount?: number;
  description?: string;
  payment_method?: PaymentMethod;
};
