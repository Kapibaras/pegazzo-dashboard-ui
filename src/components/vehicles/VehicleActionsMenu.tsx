'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Archive, ArchiveRestore, MoreVertical, Pencil } from 'lucide-react';
import { archiveVehicleAction, unarchiveVehicleAction } from '@/actions/vehicles';
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
import ArchiveVehicleDialog from './ArchiveVehicleDialog';

type VehicleActionsMenuProps = {
  vehicleId: string;
  vehicleName: string;
  archived?: boolean;
  onChanged?: () => void;
  className?: string;
  triggerClassName?: string;
};

/** 3-dot menu (Editar / Archivar·Desarchivar). Hidden for EMPLOYEE (read-only). */
const VehicleActionsMenu = ({
  vehicleId,
  vehicleName,
  archived = false,
  onChanged,
  className,
  triggerClassName,
}: VehicleActionsMenuProps) => {
  const { user } = useUser();
  const { handleApiError } = useApiErrorHandler();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  if (user.role === Role.EMPLOYEE) return null;

  const run = async (action: 'archive' | 'unarchive') => {
    setIsBusy(true);
    const result = await (action === 'archive' ? archiveVehicleAction(vehicleId) : unarchiveVehicleAction(vehicleId));
    setIsBusy(false);

    if (!result.success) {
      await handleApiError({ status: result.status, detail: result.detail }, ['common', 'vehicles']);
      return;
    }

    setConfirmOpen(false);
    ToastService.success(
      action === 'archive' ? 'Coche archivado' : 'Coche desarchivado',
      action === 'archive' ? `${vehicleName} se archivó correctamente.` : `${vehicleName} volvió al listado.`,
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
            aria-label={`Acciones de ${vehicleName}`}
            className={cn('size-8 cursor-pointer rounded-md', triggerClassName)}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/coches/${encodeURIComponent(vehicleId)}/editar`}>
              <Pencil /> Editar
            </Link>
          </DropdownMenuItem>
          {archived ? (
            <DropdownMenuItem className="cursor-pointer" disabled={isBusy} onSelect={() => void run('unarchive')}>
              <ArchiveRestore /> Desarchivar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-error-700 focus:text-error-700 cursor-pointer"
              onSelect={() => setConfirmOpen(true)}
            >
              <Archive className="text-error-700" /> Archivar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ArchiveVehicleDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        vehicleName={vehicleName}
        isArchiving={isBusy}
        onConfirm={() => void run('archive')}
      />
    </div>
  );
};

export default VehicleActionsMenu;
