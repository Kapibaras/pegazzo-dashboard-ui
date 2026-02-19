export type BalancePeriod = {
  month: number;
  year: number;
};

export type BalanceMetricsSimple = {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  period: BalancePeriod;
};

export const BALANCE_PERIODS = ['week', 'month', 'year'] as const;
export type BalancePeriodType = (typeof BALANCE_PERIODS)[number];
export const DEFAULT_PERIOD: BalancePeriodType = 'month';

export type PeriodMetrics = {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
};

export type PeriodComparison = {
  balanceChangePercent: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
  transactionChange: number;
};

export type PaymentMethodBreakdown = {
  amounts: Record<string, number>;
  percentages: Record<string, number>;
};

export type PaymentMethodBreakdownByType = {
  credit: PaymentMethodBreakdown;
  debit: PaymentMethodBreakdown;
};

export type WeeklyAverages = { income: number; expense: number };

export type BalanceMetricsDetailed = {
  currentPeriod: PeriodMetrics;
  previousPeriod: PeriodMetrics;
  comparison: PeriodComparison;
  paymentMethodBreakdown: PaymentMethodBreakdownByType;
  weeklyAverages: WeeklyAverages;
  incomeExpenseRatio: number;
};

export type BalanceMetricsParams = {
  period: BalancePeriodType;
  week?: number;
  month?: number;
  year?: number;
};
