'use client';

import { useState } from 'react';
import { Pencil, Trash2, CreditCard, FileText, Hash, Calendar, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/transaction';
import { TRANSACTION_TYPE_LABELS } from '@/lib/transaction';
import { PAYMENT_METHOD_LABELS } from '@/lib/balance';
import { formatCurrency } from '@/utils/formatters';
import { formatLongDatetime } from '@/utils/datetime/date';
import { cn } from '@/lib/utils';
import { Role } from '@/lib/schemas/userSchema';
import { ToastService } from '@/services/toast';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import SingletonAPIClient from '@/api/clients/singleton';
import BalanceService from '@/services/balance';
import TransactionForm from './TransactionForm';
import DeleteTransactionDialog from './DeleteTransactionDialog';

interface TransactionDetailSheetProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefetch: () => void;
  userRole: string;
}

const InfoRow = ({
  icon: Icon,
  label,
  children,
  mono,
  multiline,
  scrollable,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  mono?: boolean;
  multiline?: boolean;
  scrollable?: boolean;
}) => (
  <div className={cn('flex gap-4 px-5 py-4', multiline ? 'items-start' : 'items-center')}>
    <Icon className={cn('text-carbon-300 h-7 w-7 shrink-0', multiline && 'mt-0.5')} strokeWidth={1.75} />
    <div className="min-w-0 flex-1">
      <p className="typo-text text-carbon-200 mb-0.5 text-xs uppercase tracking-wider">{label}</p>
      <div className={cn('typo-text text-carbon-500 break-words', mono && 'font-mono text-sm', scrollable && 'max-h-24 overflow-y-auto pr-1')}>
        {children}
      </div>
    </div>
  </div>
);

const TransactionDetailSheet = ({
  transaction,
  open,
  onOpenChange,
  onRefetch,
  userRole,
}: TransactionDetailSheetProps) => {
  const [sheetMode, setSheetMode] = useState<'view' | 'edit'>('view');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { handleApiError } = useApiErrorHandler();
  const isOwner = userRole === Role.OWNER;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSheetMode('view');
      setDeleteDialogOpen(false);
    }
    onOpenChange(nextOpen);
  };

  const handleDelete = async () => {
    if (!transaction) return;
    setIsDeleting(true);
    try {
      await new BalanceService(SingletonAPIClient.getInstance()).deleteTransaction(transaction.reference);
      ToastService.success('Transacción eliminada', `La transacción ${transaction.reference} fue eliminada.`);
      setDeleteDialogOpen(false);
      onOpenChange(false);
      onRefetch();
    } catch (err) {
      const apiErr = err as { status_code?: number; detail?: string };
      handleApiError({ status: apiErr?.status_code ?? 500, detail: apiErr?.detail ?? 'Error al eliminar.' }, [
        'balance',
        'common',
      ]);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!transaction) return null;

  const isCredit = transaction.type === 'credit';
  const typeLabel = TRANSACTION_TYPE_LABELS[transaction.type] ?? transaction.type;
  const AmountIcon = isCredit ? ArrowUpRight : ArrowDownLeft;

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="text-carbon-500 [&>button]:hover:text-terciary-500 [&>button]:text-carbon-500 fixed top-[4rem] flex h-[calc(100vh-4rem)] w-full flex-col gap-0 overflow-hidden md:max-w-sm [&>button>svg]:h-6 [&>button>svg]:w-6 [&>button>svg]:flex-shrink-0">
          <SheetHeader className="shrink-0">
            <SheetTitle className="typo-subtitle text-carbon-500 mb-4">
              {sheetMode === 'view' ? 'Detalle de Transacción' : 'Editar Transacción'}
            </SheetTitle>
            <SheetDescription className="typo-text text-carbon-300">
              {sheetMode === 'view' ? 'Información completa de la transacción.' : 'Modifica los campos editables.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col overflow-y-auto">
            {sheetMode === 'view' ? (
              <>
                {/* ── Hero amount card ─────────────────────────────── */}
                <div
                  className={cn(
                    'mx-4 mb-4 rounded-xl p-5',
                    isCredit ? 'bg-success-50 border-success-100 border' : 'bg-error-50 border-error-100 border',
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <Badge
                      className={cn(
                        'rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide',
                        isCredit
                          ? 'bg-success-100 text-success-700 hover:bg-success-100'
                          : 'bg-error-100 text-error-700 hover:bg-error-100',
                      )}
                    >
                      {typeLabel}
                    </Badge>
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full',
                        isCredit ? 'bg-success-100' : 'bg-error-100',
                      )}
                    >
                      <AmountIcon className={cn('h-4 w-4', isCredit ? 'text-success-700' : 'text-error-700')} />
                    </div>
                  </div>

                  <p
                    className={cn(
                      'font-numbers text-3xl leading-none font-bold tracking-tight',
                      isCredit ? 'text-success-700' : 'text-error-700',
                    )}
                  >
                    {isCredit ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>

                  <p className="typo-text text-carbon-300 mt-2 text-xs">
                    <Calendar className="mr-1 inline h-3 w-3" />
                    {formatLongDatetime(transaction.date)}
                  </p>
                </div>

                {/* ── Info card ─────────────────────────────────────── */}
                <div className="border-surface-700/20 bg-surface-400/40 mx-4 overflow-hidden rounded-xl border">
                  <InfoRow icon={Hash} label="Referencia" mono>
                    <span className="text-primary-600">{transaction.reference}</span>
                  </InfoRow>
                  <div className="border-surface-700/15 mx-3 border-t" />
                  <InfoRow icon={CreditCard} label="Método de pago">
                    {PAYMENT_METHOD_LABELS[transaction.paymentMethod] ?? transaction.paymentMethod}
                  </InfoRow>
                  <div className="border-surface-700/15 mx-3 border-t" />
                  <InfoRow icon={FileText} label="Descripción" multiline scrollable>
                    {transaction.description}
                  </InfoRow>
                </div>

                {/* ── OWNER action buttons (sticky bottom) ─────────── */}
                {isOwner && (
                  <div className="border-surface-700/20 mt-auto border-t px-4 pt-4 pb-6">
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="typo-bold-text border-error-200 text-error-600 hover:border-error-300 hover:bg-error-50 hover:text-error-700 flex-1 cursor-pointer"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                      <Button
                        className="bg-terciary-500 hover:bg-primary-700 text-primary-100 typo-bold-text flex-1 cursor-pointer"
                        onClick={() => setSheetMode('edit')}
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* ── Edit mode: compact read-only header ──────────── */}
                <div className="border-surface-700/20 bg-surface-400/40 mx-4 mb-2 flex items-center gap-3 rounded-xl border px-4 py-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      isCredit ? 'bg-success-100' : 'bg-error-100',
                    )}
                  >
                    <AmountIcon className={cn('h-4 w-4', isCredit ? 'text-success-700' : 'text-error-700')} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-primary-600 font-mono text-sm font-semibold">{transaction.reference}</p>
                    <p className="typo-text text-carbon-300 text-xs">{formatLongDatetime(transaction.date)}</p>
                  </div>
                  <Badge
                    className={cn(
                      'shrink-0 text-xs font-semibold',
                      isCredit
                        ? 'bg-success-100 text-success-700 hover:bg-success-100'
                        : 'bg-error-100 text-error-700 hover:bg-error-100',
                    )}
                  >
                    {typeLabel}
                  </Badge>
                </div>

                <div className="flex-1 px-4 pb-4">
                  <TransactionForm
                    mode="edit"
                    reference={transaction.reference}
                    defaultValues={{
                      amount: transaction.amount,
                      description: transaction.description,
                      payment_method: transaction.paymentMethod,
                    }}
                    onSuccess={() => {
                      setSheetMode('view');
                      onOpenChange(false);
                      onRefetch();
                    }}
                  />
                </div>

                <div className="border-surface-700/20 border-t px-4 pt-3 pb-6">
                  <Button
                    variant="outline"
                    className="typo-bold-text w-full cursor-pointer"
                    onClick={() => setSheetMode('view')}
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <DeleteTransactionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        reference={transaction.reference}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default TransactionDetailSheet;
