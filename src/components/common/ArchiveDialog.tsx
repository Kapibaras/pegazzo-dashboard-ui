'use client';

import { TriangleAlert } from 'lucide-react';
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

type ArchiveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Singular noun in lower case, e.g. "coche" or "conductor". */
  entityLabel: string;
  entityName: string;
  isArchiving: boolean;
  onConfirm: () => void;
};

/** Confirmation to archive a record of any module (vehicles, drivers…). */
const ArchiveDialog = ({ open, onOpenChange, entityLabel, entityName, isArchiving, onConfirm }: ArchiveDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <div className="bg-warning-100 mb-1 flex size-11 items-center justify-center rounded-full">
          <TriangleAlert className="text-warning-700 size-5" aria-hidden />
        </div>
        <AlertDialogTitle className="typo-subtitle text-carbon-500">¿Archivar {entityLabel}?</AlertDialogTitle>
        <AlertDialogDescription className="typo-text text-carbon-300">
          <span className="font-semibold">{entityName}</span> dejará de aparecer en el listado. Podrás consultarlo en
          Filtros → «Ver archivados» y desarchivarlo cuando quieras.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isArchiving} className="cursor-pointer">
          Cancelar
        </AlertDialogCancel>
        <AlertDialogAction
          disabled={isArchiving}
          onClick={(event) => {
            event.preventDefault();
            onConfirm();
          }}
          className="bg-warning-600 hover:bg-warning-700 cursor-pointer text-white"
        >
          {isArchiving ? 'Archivando…' : 'Archivar'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ArchiveDialog;
