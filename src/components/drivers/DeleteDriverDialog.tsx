'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteDriverAction } from '@/actions/drivers';
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

type DeleteDriverDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverId: string;
  driverName: string;
};

const DeleteDriverDialog = ({ open, onOpenChange, driverId, driverName }: DeleteDriverDialogProps) => {
  const router = useRouter();
  const { handleApiError } = useApiErrorHandler();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    const result = await deleteDriverAction(driverId);
    setIsDeleting(false);

    if (!result.success) {
      await handleApiError({ status: result.status, detail: result.detail }, ['common', 'drivers']);
      return;
    }

    onOpenChange(false);
    ToastService.success('Conductor eliminado', `${driverName} se eliminó correctamente.`);
    router.push('/conductores?archived=true');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="bg-error-50 mb-1 flex size-11 items-center justify-center rounded-full">
            <Trash2 className="text-error-700 size-5" aria-hidden />
          </div>
          <AlertDialogTitle className="typo-subtitle text-carbon-500">
            ¿Eliminar conductor definitivamente?
          </AlertDialogTitle>
          <AlertDialogDescription className="typo-text text-carbon-300">
            Se eliminará <span className="font-semibold">{driverName}</span> junto con su foto, sus documentos y sus
            avales. Si el conductor tiene historial (contratos, eventos o incidencias) se conservará su registro
            interno. Esta acción no se puede deshacer.
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

export default DeleteDriverDialog;
