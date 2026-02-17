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
