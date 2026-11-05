'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2, Lock } from 'lucide-react';
import { updateDriverStatusAction } from '@/actions/drivers';
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
import { DRIVER_STATUSES, DRIVER_STATUS_LABELS } from '@/lib/driver';
import { Role } from '@/lib/schemas/userSchema';
import { cn } from '@/lib/utils';
import { ToastService } from '@/services/toast';
import { DriverStatus } from '@/types/driver';
import DriverStatusBadge, { DRIVER_STATUS_CLASSES } from './DriverStatusBadge';

const STATUS_DOT: Record<DriverStatus, string> = {
  ACTIVE: 'bg-success-500',
  INACTIVE: 'bg-carbon-200',
  SUSPENDED: 'bg-warning-500',
};

type DriverStatusSelectorProps = {
  driverId: string;
  driverName: string;
  status: DriverStatus;
  archived: boolean;
  /**
   * Why the driver cannot be activated yet (missing required documents or no guarantor), or `null`. While set, only
   * Inactivo stays reachable: a driver can always be taken out of service (and archived).
   */
  activationBlocker?: string | null;
};

/**
 * The driver's status next to their name. For OWNER/ADMIN it is also the control to change it (a dropdown); EMPLOYEE
 * gets the plain badge. It is locked (shown with a padlock and a reason) while the driver is archived or cannot be
 * activated yet.
 */
const DriverStatusSelector = ({
  driverId,
  driverName,
  status,
  archived,
  activationBlocker = null,
}: DriverStatusSelectorProps) => {
  const { user } = useUser();
  const router = useRouter();
  const { handleApiError } = useApiErrorHandler();
  const [isBusy, setIsBusy] = useState(false);

  if (user.role === Role.EMPLOYEE) return <DriverStatusBadge status={status} size="lg" />;

  const lockedByBlocker = !!activationBlocker;
  const onlyInactiveLeft = lockedByBlocker && status === 'INACTIVE';
  const disabled = archived || onlyInactiveLeft;
  const reason = archived
    ? 'Desarchiva al conductor para poder cambiar su estado'
    : onlyInactiveLeft
      ? `${activationBlocker}: complétalo para poder activar al conductor`
      : undefined;

  const change = async (next: string) => {
    if (next === status || disabled || (lockedByBlocker && next !== 'INACTIVE')) return;

    setIsBusy(true);
    const result = await updateDriverStatusAction(driverId, next as DriverStatus);
    setIsBusy(false);

    if (!result.success) {
      await handleApiError({ status: result.status, detail: result.detail }, ['common', 'drivers']);
      return;
    }

    ToastService.success(
      'Estado actualizado',
      `${driverName} ahora está ${DRIVER_STATUS_LABELS[next as DriverStatus].toLowerCase()}.`,
    );
    router.refresh();
  };

  const trigger = (
    <button
      type="button"
      disabled={disabled || isBusy}
      aria-label={`Estado: ${DRIVER_STATUS_LABELS[status]}. ${disabled ? 'Bloqueado.' : 'Cambiar estado.'}`}
      className={cn(
        'typo-label inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-1 transition-[filter,box-shadow]',
        'focus-visible:ring-primary-700 outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        DRIVER_STATUS_CLASSES[status],
        disabled ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:brightness-95',
      )}
    >
      {DRIVER_STATUS_LABELS[status]}
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
        <DropdownMenuLabel className="typo-caption text-carbon-300">Cambiar estado</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={status} onValueChange={(next) => void change(next)}>
          {DRIVER_STATUSES.map((value) => {
            const blocked = lockedByBlocker && value !== 'INACTIVE';
            return (
              <DropdownMenuRadioItem
                key={value}
                value={value}
                disabled={blocked}
                title={blocked ? (activationBlocker ?? undefined) : undefined}
                className="cursor-pointer gap-2.5"
              >
                <span aria-hidden className={cn('size-2 rounded-full', STATUS_DOT[value])} />
                {DRIVER_STATUS_LABELS[value]}
                {blocked && <Lock className="text-carbon-200 ml-auto size-3.5" aria-hidden />}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DriverStatusSelector;
