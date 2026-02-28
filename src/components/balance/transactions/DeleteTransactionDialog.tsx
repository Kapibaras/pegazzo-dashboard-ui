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

interface DeleteTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: string;
  isDeleting: boolean;
  onConfirm: () => void;
}

const DeleteTransactionDialog = ({ open, onOpenChange, reference, isDeleting, onConfirm }: DeleteTransactionDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="typo-subtitle text-carbon-500">¿Eliminar transacción?</AlertDialogTitle>
          <AlertDialogDescription className="typo-text text-carbon-300">
            Esta acción no se puede deshacer. Se eliminará permanentemente la transacción{' '}
            <span className="font-mono font-semibold">{reference}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3.5">
          <AlertDialogCancel
            disabled={isDeleting}
            className="typo-bold-text border-secondary-100 text-carbon-300 cursor-pointer py-5.5"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="typo-bold-text bg-error-400 hover:bg-error-500 text-error-50 cursor-pointer py-5.5 hover:text-white hover:shadow-sm"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTransactionDialog;
