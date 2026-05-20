'use client';

import { useCallback, useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { ErrorCard } from '@/components/common';
import { getBalanceMetrics, getTransactionsCountAction } from '@/actions/balance';
import { useUser } from '@/contexts/UserProvider';
import { BalanceMetricsSimple } from '@/types/balance';
import AuthorizationCountCard from './AuthorizationCountCard';
import HomeDashboardSkeleton from './HomeDashboardSkeleton';
import IncomeVsExpenseChart from './IncomeVsExpenseChart';
import MonthlyBalanceCard from './MonthlyBalanceCard';
import TransactionCounter from './TransactionCounter';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: BalanceMetricsSimple };

const HomeDashboard = () => {
  const { user } = useUser();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  const fetchMetrics = useCallback(async () => {
    setState({ status: 'loading' });
    setPendingCount(null);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [metricsResult, pendingResult] = await Promise.all([
      getBalanceMetrics({ month, year }),
      getTransactionsCountAction({ month, year, status: 'PENDING' }),
    ]);

    if (metricsResult.success) {
      setState({ status: 'success', data: metricsResult.data });
    } else {
      setState({ status: 'error', message: metricsResult.message });
    }

    if (pendingResult.success) {
      setPendingCount(pendingResult.data.count);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (state.status === 'loading') {
    return <HomeDashboardSkeleton />;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="typo-title">Bienvenido, {user.name}</h1>
        </div>
        <ErrorCard title="No pudimos cargar tu resumen" message={state.message} onRetry={fetchMetrics} />
      </div>
    );
  }

  const { data } = state;
  const periodLabel = `${MONTH_NAMES[data.period.month - 1]} ${data.period.year}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="typo-title">Bienvenido, {user.name}</h1>
        <p className="typo-sm-text text-muted-foreground mt-1">
          Resumen de <b>{periodLabel}</b>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <MonthlyBalanceCard balance={data.balance} />
        <TransactionCounter count={data.transactionCount} />
        <AuthorizationCountCard
          title="Pendientes de aprobación"
          description="del mes en curso"
          href="/balance/autorizaciones"
          count={pendingCount}
          loading={pendingCount === null}
          icon={Clock}
          tone="warning"
        />
      </div>
      <IncomeVsExpenseChart totalIncome={data.totalIncome} totalExpense={data.totalExpense} />
    </div>
  );
};

export default HomeDashboard;
