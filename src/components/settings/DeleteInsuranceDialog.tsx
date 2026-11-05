'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteInsuranceAction } from '@/actions/insurances';
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
import { Insurance } from '@/types/vehicle';

type DeleteInsuranceDialogProps = {
  target: Insurance | null;
  onClose: () => void;
};

const DeleteInsuranceDialog = ({ target, onClose }: DeleteInsuranceDialogProps) => {
  const { handleApiError } = useApiErrorHandler();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!target) return;
    setIsDeleting(true);
    const result = await deleteInsuranceAction(target.id);
    setIsDeleting(false);

    if (!result.success) {
      await handleApiError({ status: result.status, detail: result.detail }, ['common', 'vehicles']);
      return;
    }

    ToastService.success('Aseguradora eliminada', `${target.name} ya no aparece al registrar un coche.`);
    onClose();
  };

  return (
    <AlertDialog open={target !== null} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="bg-error-50 mb-1 flex size-11 items-center justify-center rounded-full">
            <Trash2 className="text-error-700 size-5" aria-hidden />
          </div>
          <AlertDialogTitle className="typo-subtitle text-carbon-500">¿Eliminar aseguradora?</AlertDialogTitle>
          <AlertDialogDescription className="typo-text text-carbon-300">
            Se quitará <span className="font-semibold">{target?.name ?? ''}</span> de las opciones al registrar un
            coche. Esta acción no se puede deshacer.
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

export default DeleteInsuranceDialog;
