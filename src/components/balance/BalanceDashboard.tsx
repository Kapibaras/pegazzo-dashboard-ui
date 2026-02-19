import KPIGrid from './KPIGrid';
import ComparisonPanel from './ComparisonPanel';
import { BalanceMetricsDetailed } from '@/types/balance';

type BalanceDashboardProps = {
  data: BalanceMetricsDetailed;
  periodLabel: string;
};

const BalanceDashboard = ({ data, periodLabel }: BalanceDashboardProps) => {
  return (
    <div className="space-y-6">
      <p className="typo-text text-muted-foreground">{periodLabel}</p>
      <KPIGrid currentPeriod={data.currentPeriod} comparison={data.comparison} />
      <ComparisonPanel
        comparison={data.comparison}
        currentPeriod={data.currentPeriod}
        previousPeriod={data.previousPeriod}
      />
    </div>
  );
};

export default BalanceDashboard;
