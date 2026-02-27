import { Suspense } from 'react';
import { ScopedAPIClient } from '@/api';
import { ErrorCard } from '@/components/common';
import { BalanceDashboard, BalanceFilters, BalanceSkeleton } from '@/components/balance';
import { BalanceService } from '@/services';
import { parsePeriod, periodToApiParams, periodSubtitle, TREND_LIMITS } from '@/lib/balance';
import { getCookiesServer } from '@/utils/cookies/server';
import isAPIErrorType from '@/api/errors';
import { BalancePeriodType } from '@/types/balance';

type BalancePageProps = {
  searchParams: Promise<{ period?: string }>;
};

const BalanceMetrics = async ({ period }: { period: BalancePeriodType }) => {
  const apiParams = periodToApiParams(period);

  try {
    const cookies = await getCookiesServer();
    const service = new BalanceService(new ScopedAPIClient(cookies));
    const [data, trendData] = await Promise.all([
      service.getDetailedMetrics(apiParams),
      service.getTrendData({ period, limit: TREND_LIMITS[period] }).catch(() => null),
    ]);
    return <BalanceDashboard data={data} trendData={trendData} period={period} periodLabel={periodSubtitle(period)} />;
  } catch (error) {
    if (isAPIErrorType(error) && error.status_code === 401 && error.detail === 'SESSION_EXPIRED') {
      throw error;
    }

    const message = isAPIErrorType(error) ? error.detail : 'No se pudieron cargar las métricas del balance.';
    return <ErrorCard message={message} />;
  }
};

export default async function BalancePage({ searchParams }: BalancePageProps) {
  const { period: periodParam } = await searchParams;
  const period = parsePeriod(periodParam);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="typo-title">Métricas Actuales del Balance</h1>
        <BalanceFilters />
      </div>
      <Suspense key={period} fallback={<BalanceSkeleton />}>
        <BalanceMetrics period={period} />
      </Suspense>
    </>
  );
}
