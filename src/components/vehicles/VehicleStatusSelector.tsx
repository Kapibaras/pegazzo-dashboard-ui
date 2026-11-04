'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2, Lock } from 'lucide-react';
import { updateVehicleStatusAction } from '@/actions/vehicles';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/contexts/UserProvider';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import { Role } from '@/lib/schemas/userSchema';
import { cn } from '@/lib/utils';
import { VEHICLE_STATUSES, VEHICLE_STATUS_LABELS } from '@/lib/vehicle';
import { ToastService } from '@/services/toast';
import { VehicleStatus } from '@/types/vehicle';
import VehicleStatusBadge, { VEHICLE_STATUS_CLASSES } from './VehicleStatusBadge';

const STATUS_DOT: Record<VehicleStatus, string> = {
  ACTIVE: 'bg-success-500',
  INACTIVE: 'bg-carbon-200',
  IN_MAINTENANCE: 'bg-warning-500',
};

type VehicleStatusSelectorProps = {
  vehicleId: string;
  vehicleName: string;
  status: VehicleStatus;
  archived: boolean;
  /** Required documents that are still not uploaded. While any is missing the status cannot be changed. */
  missingDocuments?: string[];
};

/**
 * The car's status next to its name. For OWNER/ADMIN it is also the control to change it (a dropdown); EMPLOYEE gets
 * the plain badge. It is locked (shown with a padlock and a reason) while the car is archived or has missing documents.
 */
const VehicleStatusSelector = ({
  vehicleId,
  vehicleName,
  status,
  archived,
  missingDocuments = [],
}: VehicleStatusSelectorProps) => {
  const { user } = useUser();
  const router = useRouter();
  const { handleApiError } = useApiErrorHandler();
  const [isBusy, setIsBusy] = useState(false);

  if (user.role === Role.EMPLOYEE) return <VehicleStatusBadge status={status} size="lg" />;

  const lockedByDocuments = missingDocuments.length > 0;
  const disabled = archived || lockedByDocuments;
  const reason = archived
    ? 'Desarchiva el coche para poder cambiar su estado'
    : lockedByDocuments
      ? 'Carga los documentos obligatorios para poder cambiar el estado'
      : undefined;

  const change = async (next: string) => {
    if (next === status || disabled) return;

    setIsBusy(true);
    const result = await updateVehicleStatusAction(vehicleId, next as VehicleStatus);
    setIsBusy(false);

    if (!result.success) {
      await handleApiError({ status: result.status, detail: result.detail }, ['common', 'vehicles']);
      return;
    }

    ToastService.success(
      'Estado actualizado',
      `${vehicleName} ahora está ${VEHICLE_STATUS_LABELS[next as VehicleStatus].toLowerCase()}.`,
    );
    router.refresh();
  };

  const trigger = (
    <button
      type="button"
      disabled={disabled || isBusy}
      aria-label={`Estado: ${VEHICLE_STATUS_LABELS[status]}. ${disabled ? 'Bloqueado.' : 'Cambiar estado.'}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-1 text-sm font-medium transition-[filter,box-shadow]',
        'focus-visible:ring-primary-700 outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        VEHICLE_STATUS_CLASSES[status],
        disabled ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:brightness-95',
      )}
    >
      {VEHICLE_STATUS_LABELS[status]}
      {isBusy ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
      ) : disabled ? (
        <Lock className="size-3.5" aria-hidden />
      ) : (
        <ChevronDown className="size-3.5" aria-hidden />
      )}
    </button>
  );

  // A disabled button does not open anything; the wrapper carries the tooltip with the reason.
  if (disabled) return <span title={reason}>{trigger}</span>;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-carbon-300 text-xs font-medium">Cambiar estado</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={status} onValueChange={(next) => void change(next)}>
          {VEHICLE_STATUSES.map((value) => (
            <DropdownMenuRadioItem key={value} value={value} className="cursor-pointer gap-2.5">
              <span aria-hidden className={cn('size-2 rounded-full', STATUS_DOT[value])} />
              {VEHICLE_STATUS_LABELS[value]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VehicleStatusSelector;
