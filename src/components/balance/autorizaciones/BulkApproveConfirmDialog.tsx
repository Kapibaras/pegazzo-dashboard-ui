'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BulkApproveConfirmDialogProps {
  open: boolean;
  count: number;
  isRunning: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const BulkApproveConfirmDialog = ({
  open,
  count,
  isRunning,
  onOpenChange,
  onConfirm,
}: BulkApproveConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="typo-subtitle text-carbon-500">
            ¿Aprobar todas las transacciones?
          </AlertDialogTitle>
          <AlertDialogDescription className="typo-text text-carbon-300">
            Esta acción aprobará <span className="font-semibold">{count}</span>{' '}
            {count === 1 ? 'transacción pendiente' : 'transacciones pendientes'}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3.5">
          <AlertDialogCancel
            disabled={isRunning}
            className="typo-bold-text border-secondary-100 text-carbon-300 cursor-pointer py-5.5"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isRunning}
            className="typo-bold-text bg-success-500 hover:bg-success-600 cursor-pointer py-5.5 text-white hover:shadow-sm"
          >
            {isRunning ? 'Aprobando...' : 'Aprobar Todas'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BulkApproveConfirmDialog;
