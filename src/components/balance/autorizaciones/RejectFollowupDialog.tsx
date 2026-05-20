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

interface RejectFollowupDialogProps {
  open: boolean;
  reference: string | null;
  isDeleting: boolean;
  onKeep: () => void;
  onDelete: () => void;
}

const RejectFollowupDialog = ({ open, reference, isDeleting, onKeep, onDelete }: RejectFollowupDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={(next) => (!next ? onKeep() : undefined)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="typo-subtitle text-carbon-500">Transacción rechazada</AlertDialogTitle>
          <AlertDialogDescription className="typo-text text-carbon-300">
            La transacción <span className="font-mono font-semibold">{reference}</span> ha sido rechazada. ¿Deseas
            también eliminarla?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3.5">
          <AlertDialogCancel
            onClick={onKeep}
            disabled={isDeleting}
            className="typo-bold-text border-secondary-100 text-carbon-300 cursor-pointer py-5.5"
          >
            No, solo rechazar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={isDeleting}
            className="typo-bold-text bg-error-400 hover:bg-error-500 text-error-50 cursor-pointer py-5.5 hover:text-white hover:shadow-sm"
          >
            {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RejectFollowupDialog;
