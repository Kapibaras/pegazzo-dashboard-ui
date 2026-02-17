'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBalanceMetrics } from '@/actions/balance';
import { useUser } from '@/contexts/UserProvider';
import { BalanceMetricsSimple } from '@/types/balance';
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

  const fetchMetrics = useCallback(async () => {
    setState({ status: 'loading' });

    const result = await getBalanceMetrics();

    if (result.success) {
      setState({ status: 'success', data: result.data });
    } else {
      setState({ status: 'error', message: result.message });
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
      <div className="flex flex-col items-center gap-4 py-12">
        <AlertCircle className="text-error-500 size-12" />
        <p className="typo-text text-center">{state.message}</p>
        <Button onClick={fetchMetrics} variant="outline">
          Reintentar
        </Button>
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <MonthlyBalanceCard balance={data.balance} />
        <TransactionCounter count={data.transactionCount} />
      </div>
      <IncomeVsExpenseChart totalIncome={data.totalIncome} totalExpense={data.totalExpense} />
    </div>
  );
};

export default HomeDashboard;
