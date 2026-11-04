'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteAssociateAction } from '@/actions/associates';
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
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import { ToastService } from '@/services/toast';

type DeleteAssociateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  associateId: number;
  associateName: string;
  onDeleted: () => void;
};

const DeleteAssociateDialog = ({
  open,
  onOpenChange,
  associateId,
  associateName,
  onDeleted,
}: DeleteAssociateDialogProps) => {
  const { handleApiError } = useApiErrorHandler();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    const result = await deleteAssociateAction(associateId);
    setIsDeleting(false);

    if (!result.success) {
      await handleApiError({ status: result.status, detail: result.detail }, ['common', 'vehicles']);
      return;
    }

    onOpenChange(false);
    ToastService.success('Socio eliminado', `${associateName} se eliminó correctamente.`);
    onDeleted();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="bg-error-50 mb-1 flex size-11 items-center justify-center rounded-full">
            <Trash2 className="text-error-700 size-5" aria-hidden />
          </div>
          <AlertDialogTitle className="typo-subtitle text-carbon-500">¿Eliminar socio?</AlertDialogTitle>
          <AlertDialogDescription className="typo-text text-carbon-300">
            Se eliminará a <span className="font-semibold">{associateName}</span>. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
            className="bg-error-500 hover:bg-error-700 cursor-pointer text-white"
          >
            {isDeleting ? 'Eliminando…' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAssociateDialog;
