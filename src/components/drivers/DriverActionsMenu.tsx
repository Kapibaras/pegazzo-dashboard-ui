'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Archive, ArchiveRestore, MoreVertical, Pencil } from 'lucide-react';
import { archiveDriverAction, unarchiveDriverAction } from '@/actions/drivers';
import ArchiveDialog from '@/components/common/ArchiveDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/contexts/UserProvider';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import { Role } from '@/lib/schemas/userSchema';
import { cn } from '@/lib/utils';
import { ToastService } from '@/services/toast';
import { DriverStatus } from '@/types/driver';

type DriverActionsMenuProps = {
  driverId: string;
  driverName: string;
  archived?: boolean;
  status: DriverStatus;
  onChanged?: () => void;
  className?: string;
  triggerClassName?: string;
};

export const ARCHIVE_REQUIRES_INACTIVE = 'Solo se pueden archivar conductores inactivos. Cambia su estado primero.';

/** 3-dot menu (Editar / Archivar·Desarchivar). Hidden for EMPLOYEE (read-only). */
const DriverActionsMenu = ({
  driverId,
  driverName,
  archived = false,
  status,
  onChanged,
  className,
  triggerClassName,
}: DriverActionsMenuProps) => {
  const { user } = useUser();
  const { handleApiError } = useApiErrorHandler();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  if (user.role === Role.EMPLOYEE) return null;

  const run = async (action: 'archive' | 'unarchive') => {
    setIsBusy(true);
    const result = await (action === 'archive' ? archiveDriverAction(driverId) : unarchiveDriverAction(driverId));
    setIsBusy(false);

    if (!result.success) {
      await handleApiError({ status: result.status, detail: result.detail }, ['common', 'drivers']);
      return;
    }

    setConfirmOpen(false);
    ToastService.success(
      action === 'archive' ? 'Conductor archivado' : 'Conductor desarchivado',
      action === 'archive' ? `${driverName} se archivó correctamente.` : `${driverName} volvió al listado.`,
    );
    onChanged?.();
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Acciones de ${driverName}`}
            className={cn('size-8 cursor-pointer rounded-md', triggerClassName)}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/conductores/${encodeURIComponent(driverId)}/editar`}>
              <Pencil /> Editar
            </Link>
          </DropdownMenuItem>
          {archived ? (
            <DropdownMenuItem className="cursor-pointer" disabled={isBusy} onSelect={() => void run('unarchive')}>
              <ArchiveRestore /> Desarchivar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-error-700 focus:text-error-700 cursor-pointer data-[disabled]:cursor-not-allowed"
              disabled={status !== 'INACTIVE'}
              title={status !== 'INACTIVE' ? ARCHIVE_REQUIRES_INACTIVE : undefined}
              onSelect={() => setConfirmOpen(true)}
            >
              <Archive className="text-error-700" /> Archivar
              {status !== 'INACTIVE' && (
                <span className="typo-caption text-carbon-300 ml-auto pl-3">Solo inactivos</span>
              )}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ArchiveDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        entityLabel="conductor"
        entityName={driverName}
        isArchiving={isBusy}
        onConfirm={() => void run('archive')}
      />
    </div>
  );
};

export default DriverActionsMenu;
