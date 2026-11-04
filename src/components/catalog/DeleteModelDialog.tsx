'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteModelAction } from '@/actions/models';
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

export type ModelToDelete = { id: number; make: string; model: string; isLastOfMake: boolean };

type DeleteModelDialogProps = {
  target: ModelToDelete | null;
  onClose: () => void;
};

const DeleteModelDialog = ({ target, onClose }: DeleteModelDialogProps) => {
  const { handleApiError } = useApiErrorHandler();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!target) return;
    setIsDeleting(true);
    const result = await deleteModelAction(target.id);
    setIsDeleting(false);

    if (!result.success) {
      await handleApiError({ status: result.status, detail: result.detail }, ['common', 'vehicles']);
      return;
    }

    ToastService.success('Modelo eliminado', `${target.make} ${target.model} ya no aparece en el catálogo.`);
    onClose();
  };

  return (
    <AlertDialog open={target !== null} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="bg-error-50 mb-1 flex size-11 items-center justify-center rounded-full">
            <Trash2 className="text-error-700 size-5" aria-hidden />
          </div>
          <AlertDialogTitle className="typo-subtitle text-carbon-500">¿Eliminar del catálogo?</AlertDialogTitle>
          <AlertDialogDescription className="typo-text text-carbon-300">
            Se quitará <span className="font-semibold">{target ? `${target.make} ${target.model}` : ''}</span> de las
            opciones al registrar un coche. Los coches que ya tienen este modelo conservan sus datos.
            {target?.isLastOfMake && (
              <>
                {' '}
                Era el último modelo de <span className="font-semibold">{target.make}</span>, por lo que la marca
                también desaparecerá.
              </>
            )}
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

export default DeleteModelDialog;
