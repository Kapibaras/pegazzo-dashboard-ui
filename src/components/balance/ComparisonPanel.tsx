import { TrendingUp, TrendingDown, Minus, ArrowLeftRight, Wallet, type LucideIcon } from 'lucide-react';
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
  invertChange?: boolean;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

const ComparisonRow = ({
  label,
  changePercent,
  previousValue,
  currentValue,
  invertChange = false,
  icon: Icon,
  iconBg,
  iconColor,
}: ComparisonItem) => {
  const isPositive = changePercent > 0;
  const isNegative = changePercent < 0;

  const positiveColor = invertChange ? 'text-error-400' : 'text-success-400';
  const negativeColor = invertChange ? 'text-success-400' : 'text-error-400';
  const positiveBg = invertChange ? 'bg-error-50' : 'bg-success-50';
  const negativeBg = invertChange ? 'bg-success-50' : 'bg-error-50';

  const colorClass = isPositive ? positiveColor : isNegative ? negativeColor : 'text-accent-400';
  const bgClass = isPositive ? positiveBg : isNegative ? negativeBg : 'bg-accent-50';
  const ChangeIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div className="space-y-2 py-4 first:pt-0 last:pb-0">
      <div className="flex items-center gap-2">
        <div className={cn('flex size-6 items-center justify-center rounded-md', iconBg)}>
          <Icon className={cn('size-3.5', iconColor)} />
        </div>
        <span className="typo-sm-text text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="font-numbers text-2xl font-semibold tracking-tight">{formatCurrency(currentValue)}</span>
        <div className={cn('mb-0.5 flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1', bgClass, colorClass)}>
          <ChangeIcon className="size-3.5" />
          <span className="font-numbers text-sm">
            {isPositive ? '+' : ''}
            {formatPercent(changePercent)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Anterior
        </span>
        <span className="font-numbers text-sm text-muted-foreground">{formatCurrency(previousValue)}</span>
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
      icon: Wallet,
      iconBg: 'bg-chart-4/15',
      iconColor: 'text-chart-4',
    },
    {
      label: 'Ingresos',
      changePercent: comparison.incomeChangePercent,
      previousValue: previousPeriod.totalIncome,
      currentValue: currentPeriod.totalIncome,
      icon: TrendingUp,
      iconBg: 'bg-success-50',
      iconColor: 'text-success-600',
    },
    {
      label: 'Gastos',
      changePercent: comparison.expenseChangePercent,
      previousValue: previousPeriod.totalExpense,
      currentValue: currentPeriod.totalExpense,
      invertChange: true,
      icon: TrendingDown,
      iconBg: 'bg-error-50',
      iconColor: 'text-error-600',
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-100">
            <ArrowLeftRight className="size-5 text-primary-600" />
          </div>
          <CardTitle className="typo-subtitle">Comparación con período anterior</CardTitle>
        </div>
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
