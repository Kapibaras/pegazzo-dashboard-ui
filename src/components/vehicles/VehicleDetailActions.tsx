'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Archive, ArchiveRestore, FileWarning, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { archiveVehicleAction, unarchiveVehicleAction } from '@/actions/vehicles';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/contexts/UserProvider';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import { Role } from '@/lib/schemas/userSchema';
import { ToastService } from '@/services/toast';
import { VehicleStatus } from '@/types/vehicle';
import ArchiveVehicleDialog from './ArchiveVehicleDialog';
import DeleteVehicleDialog from './DeleteVehicleDialog';
import { ARCHIVE_REQUIRES_INACTIVE } from './VehicleActionsMenu';

type VehicleDetailActionsProps = {
  vehicleId: string;
  vehicleName: string;
  archived: boolean;
  status: VehicleStatus;
  /** Required documents that are still not uploaded (offers a shortcut to upload them). */
  missingDocuments?: string[];
};

/**
 * Detail page actions behind a single 3-dot menu. Edit / archive / delete are OWNER/ADMIN only (EMPLOYEE: none).
 * The status is changed from `VehicleStatusSelector`, next to the car's name.
 */
const VehicleDetailActions = ({
  vehicleId,
  vehicleName,
  archived,
  status,
  missingDocuments = [],
}: VehicleDetailActionsProps) => {
  const { user } = useUser();
  const router = useRouter();
  const { handleApiError } = useApiErrorHandler();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  if (user.role === Role.EMPLOYEE) return null;

  const runAction = async (
    action: () => Promise<{ success: true } | { success: false; status: number; detail: string }>,
    successTitle: string,
    successMessage: string,
  ) => {
    setIsBusy(true);
    const result = await action();
    setIsBusy(false);

    if (!result.success) {
      await handleApiError({ status: result.status, detail: result.detail }, ['common', 'vehicles']);
      return;
    }

    setArchiveOpen(false);
    ToastService.success(successTitle, successMessage);
    router.refresh();
  };

  const statusLocked = missingDocuments.length > 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Acciones del coche"
            disabled={isBusy}
            className="cursor-pointer"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/coches/${encodeURIComponent(vehicleId)}/editar`}>
              <Pencil /> Editar
            </Link>
          </DropdownMenuItem>

          {statusLocked && !archived && (
            <DropdownMenuItem asChild className="text-warning-700 focus:text-warning-700 cursor-pointer">
              <Link href={`/coches/${encodeURIComponent(vehicleId)}/editar?paso=documentos`}>
                <FileWarning className="text-warning-700" /> Completar documentos ({missingDocuments.length})
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {archived ? (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() =>
                  void runAction(
                    () => unarchiveVehicleAction(vehicleId),
                    'Coche desarchivado',
                    `${vehicleName} volvió al listado.`,
                  )
                }
              >
                <ArchiveRestore /> Desarchivar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-error-700 focus:text-error-700 cursor-pointer"
                onSelect={() => setDeleteOpen(true)}
              >
                <Trash2 className="text-error-700" /> Eliminar
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem
              className="text-error-700 focus:text-error-700 cursor-pointer data-[disabled]:cursor-not-allowed"
              disabled={status !== 'INACTIVE'}
              title={status !== 'INACTIVE' ? ARCHIVE_REQUIRES_INACTIVE : undefined}
              onSelect={() => setArchiveOpen(true)}
            >
              <Archive className="text-error-700" /> Archivar
              {status !== 'INACTIVE' && (
                <span className="typo-caption text-carbon-300 ml-auto pl-3">Solo inactivos</span>
              )}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ArchiveVehicleDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        vehicleName={vehicleName}
        isArchiving={isBusy}
        onConfirm={() =>
          void runAction(
            () => archiveVehicleAction(vehicleId),
            'Coche archivado',
            `${vehicleName} se archivó correctamente.`,
          )
        }
      />
      <DeleteVehicleDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        vehicleId={vehicleId}
        vehicleName={vehicleName}
      />
    </>
  );
};

export default VehicleDetailActions;
