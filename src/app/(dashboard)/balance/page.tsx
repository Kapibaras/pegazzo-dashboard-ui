import { Suspense } from 'react';
import { ScopedAPIClient } from '@/api';
import { ErrorCard } from '@/components/common';
import { BalanceDashboard, BalanceSkeleton } from '@/components/balance';
import { BalanceService } from '@/services';
import { parsePeriod, periodToApiParams, periodSubtitle } from '@/lib/balance';
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
    const data = await service.getDetailedMetrics(apiParams);
    return <BalanceDashboard data={data} periodLabel={periodSubtitle(period)} />;
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
    <Suspense key={period} fallback={<BalanceSkeleton />}>
      <BalanceMetrics period={period} />
    </Suspense>
  );
}
