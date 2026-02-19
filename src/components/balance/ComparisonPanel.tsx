import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { PeriodComparison, PeriodMetrics } from '@/types/balance';

type ComparisonPanelProps = {
  comparison: PeriodComparison;
  currentPeriod: PeriodMetrics;
  previousPeriod: PeriodMetrics;
};

type ComparisonItem = {
  label: string;
  changePercent: number;
  previousValue: number;
  currentValue: number;
};

const ComparisonRow = ({ label, changePercent, previousValue, currentValue }: ComparisonItem) => {
  const isPositive = changePercent > 0;
  const isNegative = changePercent < 0;

  const colorClass = isPositive ? 'text-success-400' : isNegative ? 'text-error-400' : 'text-accent-400';
  const bgClass = isPositive ? 'bg-success-50' : isNegative ? 'bg-error-50' : 'bg-accent-50';
  const ChangeIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="typo-text text-muted-foreground min-w-20">{label}</span>
      <div className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1', bgClass, colorClass)}>
        <ChangeIcon className="size-3.5" />
        <span className="font-numbers text-sm">
          {isPositive ? '+' : ''}
          {formatPercent(changePercent)}
        </span>
      </div>
      <div className="typo-sm-text text-muted-foreground ml-auto text-right">
        <span className="font-numbers">{formatCurrency(previousValue)}</span> →{' '}
        <span className="font-numbers">{formatCurrency(currentValue)}</span>
      </div>
    </div>
  );
};

const ComparisonPanel = ({ comparison, currentPeriod, previousPeriod }: ComparisonPanelProps) => {
  const items: ComparisonItem[] = [
    {
      label: 'Balance',
      changePercent: comparison.balanceChangePercent,
      previousValue: previousPeriod.balance,
      currentValue: currentPeriod.balance,
    },
    {
      label: 'Ingresos',
      changePercent: comparison.incomeChangePercent,
      previousValue: previousPeriod.totalIncome,
      currentValue: currentPeriod.totalIncome,
    },
    {
      label: 'Gastos',
      changePercent: comparison.expenseChangePercent,
      previousValue: previousPeriod.totalExpense,
      currentValue: currentPeriod.totalExpense,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="typo-subtitle">Comparación con período anterior</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {items.map((item) => (
            <ComparisonRow key={item.label} {...item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonPanel;
