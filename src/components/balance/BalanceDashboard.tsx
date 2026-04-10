import KPIGrid from './KPIGrid';
import ComparisonPanel from './ComparisonPanel';
import PaymentMethodBreakdown from './PaymentMethodBreakdown';
import HistoricalTrendChart from './HistoricalTrendChart';
import PaymentMethodDonutChart from './PaymentMethodDonutChart';
import FinancialSummary from './FinancialSummary';
import { BalanceMetricsDetailed, BalancePeriodType, BalanceTrendResponse } from '@/types/balance';

type BalanceDashboardProps = {
  data: BalanceMetricsDetailed;
  trendData: BalanceTrendResponse | null;
  period: BalancePeriodType;
  periodLabel: string;
};

const BalanceDashboard = ({ data, trendData, period, periodLabel }: BalanceDashboardProps) => {
  return (
    <div className="space-y-6">
      <p className="typo-text text-muted-foreground">{periodLabel}</p>
      <KPIGrid currentPeriod={data.currentPeriod} comparison={data.comparison} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ComparisonPanel
          comparison={data.comparison}
          currentPeriod={data.currentPeriod}
          previousPeriod={data.previousPeriod}
        />
        <div className="lg:col-span-2">
          <HistoricalTrendChart data={trendData?.data ?? []} period={period} />
        </div>
      </div>
      <PaymentMethodBreakdown breakdown={data.paymentMethodBreakdown} />
      <PaymentMethodDonutChart
        credit={data.paymentMethodBreakdown.credit}
        debit={data.paymentMethodBreakdown.debit}
        balance={data.paymentMethodBreakdown.balance}
      />
      <FinancialSummary weeklyAverages={data.weeklyAverages} incomeExpenseRatio={data.incomeExpenseRatio} />
    </div>
  );
};

export default BalanceDashboard;
