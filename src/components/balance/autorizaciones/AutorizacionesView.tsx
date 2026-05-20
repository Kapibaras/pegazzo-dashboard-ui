'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCheck } from 'lucide-react';
import SingletonAPIClient from '@/api/clients/singleton';
import { ErrorCard } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import BalanceService from '@/services/balance';
import { ToastService } from '@/services/toast';
import { Transaction } from '@/types/transaction';
import AutorizacionesEmptyState from './AutorizacionesEmptyState';
import AutorizacionesTable from './AutorizacionesTable';
import AutorizacionesTableSkeleton from './AutorizacionesTableSkeleton';
import BulkApproveConfirmDialog from './BulkApproveConfirmDialog';
import RejectFollowupDialog from './RejectFollowupDialog';

type ViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; transactions: Transaction[] };

type RejectFollowupState = {
  reference: string;
} | null;

type BulkProgress = {
  done: number;
  total: number;
} | null;

const AutorizacionesView = () => {
  const [state, setState] = useState<ViewState>({ status: 'loading' });
  const [pendingByRef, setPendingByRef] = useState<Set<string>>(new Set());
  const [rejectFollowup, setRejectFollowup] = useState<RejectFollowupState>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<BulkProgress>(null);
  const { handleApiError } = useApiErrorHandler();

  const service = useMemo(() => new BalanceService(SingletonAPIClient.getInstance()), []);

  const fetchPending = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const now = new Date();
      const response = await service.getTransactions({
        period: 'year',
        year: now.getFullYear(),
        status: 'PENDING',
        limit: 100,
        sort_by: 'date',
        sort_order: 'desc',
      });
      setState({ status: 'success', transactions: response.transactions });
    } catch (err) {
      const apiErr = err as { status_code?: number; detail?: string };
      setState({
        status: 'error',
        message: apiErr?.detail ?? 'No se pudieron cargar las transacciones pendientes.',
      });
    }
  }, [service]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const transactions = state.status === 'success' ? state.transactions : [];
  const pendingCount = transactions.length;

  const removeRow = (reference: string) => {
    setState((prev) =>
      prev.status === 'success'
        ? { ...prev, transactions: prev.transactions.filter((t) => t.reference !== reference) }
        : prev,
    );
  };

  const markBusy = (reference: string, busy: boolean) => {
    setPendingByRef((prev) => {
      const next = new Set(prev);
      if (busy) next.add(reference);
      else next.delete(reference);
      return next;
    });
  };

  const handleApprove = async (reference: string) => {
    markBusy(reference, true);
    try {
      await service.authorizeTransaction(reference, { status: 'CONFIRMED' });
      removeRow(reference);
      ToastService.success('Transacción aprobada', `La transacción ${reference} fue aprobada.`);
    } catch (err) {
      const apiErr = err as { status_code?: number; detail?: string };
      handleApiError(
        { status: apiErr?.status_code ?? 500, detail: apiErr?.detail ?? `No se pudo aprobar ${reference}.` },
        ['balance', 'common'],
      );
    } finally {
      markBusy(reference, false);
    }
  };

  const handleReject = async (reference: string) => {
    markBusy(reference, true);
    try {
      await service.authorizeTransaction(reference, { status: 'REJECTED' });
      removeRow(reference);
      setRejectFollowup({ reference });
    } catch (err) {
      const apiErr = err as { status_code?: number; detail?: string };
      handleApiError(
        { status: apiErr?.status_code ?? 500, detail: apiErr?.detail ?? `No se pudo rechazar ${reference}.` },
        ['balance', 'common'],
      );
    } finally {
      markBusy(reference, false);
    }
  };

  const handleRejectKeep = () => {
    setRejectFollowup(null);
  };

  const handleRejectDelete = async () => {
    if (!rejectFollowup) return;
    const { reference } = rejectFollowup;
    setIsDeleting(true);
    try {
      await service.deleteTransaction(reference);
      ToastService.success('Transacción eliminada', `La transacción ${reference} fue eliminada.`);
    } catch (err) {
      const apiErr = err as { status_code?: number; detail?: string };
      handleApiError(
        { status: apiErr?.status_code ?? 500, detail: apiErr?.detail ?? `No se pudo eliminar ${reference}.` },
        ['balance', 'common'],
      );
    } finally {
      setIsDeleting(false);
      setRejectFollowup(null);
    }
  };

  const handleBulkApproveConfirm = async () => {
    setBulkDialogOpen(false);
    const refs = transactions.map((t) => t.reference);
    setBulkProgress({ done: 0, total: refs.length });
    let succeeded = 0;
    let failed = 0;

    for (const reference of refs) {
      try {
        await service.authorizeTransaction(reference, { status: 'CONFIRMED' });
        removeRow(reference);
        succeeded += 1;
      } catch {
        failed += 1;
      } finally {
        setBulkProgress((prev) => (prev ? { ...prev, done: prev.done + 1 } : prev));
      }
    }

    setBulkProgress(null);
    await fetchPending();

    if (failed === 0) {
      ToastService.success('Aprobación completa', `Se aprobaron ${succeeded} transacciones.`);
    } else if (succeeded === 0) {
      ToastService.error('No se pudo aprobar', `Falló la aprobación de ${failed} transacciones.`);
    } else {
      ToastService.info(
        'Aprobación parcial',
        `Se aprobaron ${succeeded} transacciones. ${failed} fallaron y permanecen en la lista.`,
      );
    }
  };

  const subtitle =
    state.status === 'success'
      ? `${pendingCount} ${pendingCount === 1 ? 'transacción pendiente' : 'transacciones pendientes'} de aprobación`
      : 'Revisa y autoriza las transacciones registradas.';

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="typo-title">Autorizaciones</h1>
          <p className="typo-text text-muted-foreground mt-1">{subtitle}</p>
        </div>
        {state.status === 'success' && pendingCount > 0 && (
          <Button
            onClick={() => setBulkDialogOpen(true)}
            disabled={bulkProgress !== null}
            className="bg-success-500 hover:bg-success-600 typo-bold-text cursor-pointer text-white"
          >
            <CheckCheck className="h-4 w-4" />
            {bulkProgress ? `Aprobando ${bulkProgress.done} de ${bulkProgress.total}...` : 'Aprobar Todas'}
          </Button>
        )}
      </div>

      <div className="min-w-0 space-y-4">
        {state.status === 'loading' && <AutorizacionesTableSkeleton />}
        {state.status === 'error' && <ErrorCard message={state.message} onRetry={fetchPending} />}
        {state.status === 'success' &&
          (pendingCount === 0 ? (
            <AutorizacionesEmptyState />
          ) : (
            <AutorizacionesTable
              transactions={transactions}
              pendingByRef={pendingByRef}
              disabled={bulkProgress !== null}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
      </div>

      <BulkApproveConfirmDialog
        open={bulkDialogOpen}
        count={pendingCount}
        isRunning={bulkProgress !== null}
        onOpenChange={(next) => (bulkProgress === null ? setBulkDialogOpen(next) : undefined)}
        onConfirm={handleBulkApproveConfirm}
      />

      <RejectFollowupDialog
        open={rejectFollowup !== null}
        reference={rejectFollowup?.reference ?? null}
        isDeleting={isDeleting}
        onKeep={handleRejectKeep}
        onDelete={handleRejectDelete}
      />
    </>
  );
};

export default AutorizacionesView;
