'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Archive, ArchiveRestore, FileWarning, MoreVertical, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { archiveVehicleAction, unarchiveVehicleAction, updateVehicleStatusAction } from '@/actions/vehicles';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/contexts/UserProvider';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import { Role } from '@/lib/schemas/userSchema';
import { VEHICLE_STATUSES, VEHICLE_STATUS_LABELS } from '@/lib/vehicle';
import { ToastService } from '@/services/toast';
import { VehicleStatus } from '@/types/vehicle';
import ArchiveVehicleDialog from './ArchiveVehicleDialog';
import DeleteVehicleDialog from './DeleteVehicleDialog';

type VehicleDetailActionsProps = {
  vehicleId: string;
  vehicleName: string;
  status: VehicleStatus;
  archived: boolean;
  /** Required documents that are still not uploaded. While any is missing the status cannot be changed. */
  missingDocuments?: string[];
};

/** Detail page actions behind a single 3-dot menu. Edit / archive / delete are OWNER/ADMIN only (EMPLOYEE: none). */
const VehicleDetailActions = ({
  vehicleId,
  vehicleName,
  status,
  archived,
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

  const handleStatusChange = (next: string) => {
    if (next === status || statusLocked) return;
    void runAction(
      () => updateVehicleStatusAction(vehicleId, next as VehicleStatus),
      'Estado actualizado',
      `${vehicleName} ahora está ${VEHICLE_STATUS_LABELS[next as VehicleStatus].toLowerCase()}.`,
    );
  };

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

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              disabled={archived || statusLocked}
              title={statusLocked ? 'Carga los documentos obligatorios para poder cambiar el estado' : undefined}
              className="cursor-pointer"
            >
              <RefreshCw /> Cambiar estado
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={status} onValueChange={handleStatusChange}>
                {VEHICLE_STATUSES.map((value) => (
                  <DropdownMenuRadioItem key={value} value={value} className="cursor-pointer">
                    {VEHICLE_STATUS_LABELS[value]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

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
              className="text-error-700 focus:text-error-700 cursor-pointer"
              onSelect={() => setArchiveOpen(true)}
            >
              <Archive className="text-error-700" /> Archivar
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
