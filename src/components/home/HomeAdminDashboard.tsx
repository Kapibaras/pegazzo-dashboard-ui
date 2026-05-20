'use client';

import { useCallback, useEffect, useState } from 'react';
import { Clock, XCircle } from 'lucide-react';
import { getTransactionsCountAction } from '@/actions/balance';
import { ErrorCard } from '@/components/common';
import { useUser } from '@/contexts/UserProvider';
import AuthorizationCountCard from './AuthorizationCountCard';

type CountsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; pending: number; rejected: number };

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

const HomeAdminDashboard = () => {
  const { user } = useUser();
  const [state, setState] = useState<CountsState>({ status: 'loading' });

  const fetchCounts = useCallback(async () => {
    setState({ status: 'loading' });
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [pendingRes, rejectedRes] = await Promise.all([
      getTransactionsCountAction({ month, year, status: 'PENDING' }),
      getTransactionsCountAction({ month, year, status: 'REJECTED' }),
    ]);

    if (!pendingRes.success) {
      setState({ status: 'error', message: pendingRes.message });
      return;
    }
    if (!rejectedRes.success) {
      setState({ status: 'error', message: rejectedRes.message });
      return;
    }

    setState({
      status: 'success',
      pending: pendingRes.data.count,
      rejected: rejectedRes.data.count,
    });
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const now = new Date();
  const periodLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="typo-title">Bienvenido, {user.name}</h1>
        <p className="typo-sm-text text-muted-foreground mt-1">
          Resumen de <b>{periodLabel}</b>
        </p>
      </div>

      {state.status === 'error' ? (
        <ErrorCard title="No pudimos cargar tu resumen" message={state.message} onRetry={fetchCounts} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AuthorizationCountCard
            title="Transacciones pendientes"
            description="del mes en curso"
            href="/balance/transacciones?status=PENDING"
            count={state.status === 'success' ? state.pending : null}
            loading={state.status === 'loading'}
            icon={Clock}
            tone="warning"
          />
          <AuthorizationCountCard
            title="Transacciones rechazadas"
            description="del mes en curso"
            href="/balance/transacciones?status=REJECTED"
            count={state.status === 'success' ? state.rejected : null}
            loading={state.status === 'loading'}
            icon={XCircle}
            tone="error"
          />
        </div>
      )}
    </div>
  );
};

export default HomeAdminDashboard;
