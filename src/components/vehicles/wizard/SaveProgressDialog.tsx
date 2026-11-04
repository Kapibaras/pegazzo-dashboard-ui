'use client';

import { CheckCircle2, Circle, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type SaveTaskStatus = 'pending' | 'running' | 'done' | 'error';
export type SaveTaskView = { key: string; label: string; status: SaveTaskStatus; error?: string };

type SaveProgressDialogProps = {
  open: boolean;
  title: string;
  tasks: SaveTaskView[];
  isRunning: boolean;
  /** Label of the button that leaves the chain once the main record exists (e.g. "Continuar a documentos"). */
  continueLabel: string;
  canContinue: boolean;
  onRetry: () => void;
  onContinue: () => void;
};

const ICONS: Record<SaveTaskStatus, React.ReactNode> = {
  pending: <Circle className="text-carbon-100 size-5" aria-hidden />,
  running: <Loader2 className="text-primary-700 size-5 animate-spin" aria-hidden />,
  done: <CheckCircle2 className="text-success-500 size-5" aria-hidden />,
  error: <XCircle className="text-error-500 size-5" aria-hidden />,
};

const STATUS_TEXT: Record<SaveTaskStatus, string> = {
  pending: 'Pendiente',
  running: 'En proceso',
  done: 'Listo',
  error: 'Falló',
};

/** Overlay with the checklist of the save chain ("✓ Coche creado · ✗ Foto 2 falló — Reintentar"). Cannot be dismissed while running. */
const SaveProgressDialog = ({
  open,
  title,
  tasks,
  isRunning,
  continueLabel,
  canContinue,
  onRetry,
  onContinue,
}: SaveProgressDialogProps) => {
  const hasErrors = tasks.some((task) => task.status === 'error');

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isRunning
              ? 'No cierres esta ventana mientras se guardan los cambios.'
              : hasErrors
                ? 'Algunos pasos fallaron. Reintenta solo los pendientes: lo que ya se guardó no se vuelve a crear.'
                : 'Todo se guardó correctamente.'}
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-2.5" aria-live="polite">
          {tasks.map((task) => (
            <li key={task.key} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0">{ICONS[task.status]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-carbon-500 text-sm font-medium">{task.label}</p>
                <p className={task.status === 'error' ? 'text-error-700 text-xs' : 'text-carbon-200 text-xs'}>
                  {task.status === 'error' && task.error ? task.error : STATUS_TEXT[task.status]}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {!isRunning && hasErrors && (
          <DialogFooter>
            <Button
              type="button"
              onClick={onRetry}
              className="bg-terciary-500 text-primary-100 hover:bg-primary-800 cursor-pointer gap-2"
            >
              <RefreshCw className="size-4" /> Reintentar pendientes
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!canContinue}
              onClick={onContinue}
              className="cursor-pointer"
            >
              {continueLabel}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SaveProgressDialog;
