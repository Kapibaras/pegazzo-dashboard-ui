'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Archive, ArchiveRestore, FileWarning, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { archiveDriverAction, unarchiveDriverAction } from '@/actions/drivers';
import ArchiveDialog from '@/components/common/ArchiveDialog';
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
import { DriverStatus } from '@/types/driver';
import DeleteDriverDialog from './DeleteDriverDialog';
import { ARCHIVE_REQUIRES_INACTIVE } from './DriverActionsMenu';

type DriverDetailActionsProps = {
  driverId: string;
  driverName: string;
  archived: boolean;
  status: DriverStatus;
  /** Number of required documents still missing (offers a shortcut to upload them). */
  missingDocumentsCount?: number;
};

/**
 * Detail page actions behind a single 3-dot menu. Edit / archive / delete are OWNER/ADMIN only (EMPLOYEE: none).
 * The status is changed from `DriverStatusSelector`, next to the driver's name.
 */
const DriverDetailActions = ({
  driverId,
  driverName,
  archived,
  status,
  missingDocumentsCount = 0,
}: DriverDetailActionsProps) => {
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
      await handleApiError({ status: result.status, detail: result.detail }, ['common', 'drivers']);
      return;
    }

    setArchiveOpen(false);
    ToastService.success(successTitle, successMessage);
    router.refresh();
  };

  const encodedId = encodeURIComponent(driverId);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Acciones del conductor"
            disabled={isBusy}
            className="cursor-pointer"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/conductores/${encodedId}/editar`}>
              <Pencil /> Editar
            </Link>
          </DropdownMenuItem>

          {missingDocumentsCount > 0 && !archived && (
            <DropdownMenuItem asChild className="text-warning-700 focus:text-warning-700 cursor-pointer">
              <Link href={`/conductores/${encodedId}/editar?paso=documentos`}>
                <FileWarning className="text-warning-700" /> Completar documentos ({missingDocumentsCount})
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
                    () => unarchiveDriverAction(driverId),
                    'Conductor desarchivado',
                    `${driverName} volvió al listado.`,
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

      <ArchiveDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        entityLabel="conductor"
        entityName={driverName}
        isArchiving={isBusy}
        onConfirm={() =>
          void runAction(
            () => archiveDriverAction(driverId),
            'Conductor archivado',
            `${driverName} se archivó correctamente.`,
          )
        }
      />
      <DeleteDriverDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        driverId={driverId}
        driverName={driverName}
      />
    </>
  );
};

export default DriverDetailActions;
