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

interface SaveOptionsDialogProps {
  open: boolean;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveOnly: () => void;
  onSaveAndResubmit: () => void;
}

const SaveOptionsDialog = ({ open, isSaving, onOpenChange, onSaveOnly, onSaveAndResubmit }: SaveOptionsDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="typo-subtitle text-carbon-500">¿Reenviar a revisión?</AlertDialogTitle>
          <AlertDialogDescription className="typo-text text-carbon-300">
            Puedes guardar los cambios sin cambiar el estado, o guardar y enviar la transacción a revisión nuevamente
            como Pendiente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3.5">
          <AlertDialogCancel
            onClick={onSaveOnly}
            disabled={isSaving}
            className="typo-bold-text border-secondary-100 text-carbon-300 cursor-pointer py-5.5"
          >
            Solo guardar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onSaveAndResubmit}
            disabled={isSaving}
            className="typo-bold-text bg-terciary-500 hover:bg-primary-700 text-primary-100 cursor-pointer py-5.5 hover:shadow-sm"
          >
            {isSaving ? 'Guardando...' : 'Guardar y reenviar a revisión'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SaveOptionsDialog;
