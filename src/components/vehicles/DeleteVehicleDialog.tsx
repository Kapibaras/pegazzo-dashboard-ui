'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteVehicleAction } from '@/actions/vehicles';
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

type DeleteVehicleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: string;
  vehicleName: string;
};

const DeleteVehicleDialog = ({ open, onOpenChange, vehicleId, vehicleName }: DeleteVehicleDialogProps) => {
  const router = useRouter();
  const { handleApiError } = useApiErrorHandler();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    const result = await deleteVehicleAction(vehicleId);
    setIsDeleting(false);

    if (!result.success) {
      await handleApiError({ status: result.status, detail: result.detail }, ['common', 'vehicles']);
      return;
    }

    onOpenChange(false);
    ToastService.success('Coche eliminado', `${vehicleName} se eliminó correctamente.`);
    router.push('/coches?archived=true');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="bg-error-50 mb-1 flex size-11 items-center justify-center rounded-full">
            <Trash2 className="text-error-700 size-5" aria-hidden />
          </div>
          <AlertDialogTitle className="typo-subtitle text-carbon-500">¿Eliminar coche definitivamente?</AlertDialogTitle>
          <AlertDialogDescription className="typo-text text-carbon-300">
            Se eliminará <span className="font-semibold">{vehicleName}</span> junto con sus documentos e imágenes. Si el
            coche tiene historial (contratos, transacciones o eventos) se conservará su registro interno. Esta acción no se
            puede deshacer.
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

export default DeleteVehicleDialog;
