import { Wallet, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import KPICard from './KPICard';
import { formatCurrency } from '@/utils/formatters';
import { PeriodMetrics, PeriodComparison } from '@/types/balance';

type KPIGridProps = {
  currentPeriod: PeriodMetrics;
  comparison: PeriodComparison;
};

const KPIGrid = ({ currentPeriod, comparison }: KPIGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard
        icon={Wallet}
        title="Balance"
        value={formatCurrency(currentPeriod.balance)}
        change={{ value: comparison.balanceChangePercent, type: 'percent' }}
      />
      <KPICard
        icon={TrendingUp}
        title="Ingresos"
        value={formatCurrency(currentPeriod.totalIncome)}
        change={{ value: comparison.incomeChangePercent, type: 'percent' }}
        iconColorClass="text-success-600"
        iconBgClass="bg-success-50"
      />
      <KPICard
        icon={TrendingDown}
        title="Gastos"
        value={formatCurrency(currentPeriod.totalExpense)}
        change={{ value: comparison.expenseChangePercent, type: 'percent' }}
        iconColorClass="text-error-600"
        iconBgClass="bg-error-50"
      />
      <KPICard
        icon={ArrowRightLeft}
        title="Transacciones"
        value={String(currentPeriod.transactionCount)}
        change={{ value: comparison.transactionChange, type: 'absolute' }}
        iconColorClass="text-accent-600"
        iconBgClass="bg-accent-50"
      />
    </div>
  );
};

export default KPIGrid;
