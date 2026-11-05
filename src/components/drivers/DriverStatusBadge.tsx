import { Badge } from '@/components/ui/badge';
import { DRIVER_STATUS_LABELS } from '@/lib/driver';
import { cn } from '@/lib/utils';
import { DriverStatus } from '@/types/driver';

/** Same colour convention as the vehicle statuses: active = success, inactive = neutral, the third state = warning. */
export const DRIVER_STATUS_CLASSES: Record<DriverStatus, string> = {
  ACTIVE: 'bg-success-50 text-success-700 hover:bg-success-50',
  INACTIVE: 'bg-secondary-50 text-carbon-400 hover:bg-secondary-50',
  SUSPENDED: 'bg-warning-100 text-warning-700 hover:bg-warning-100',
};

type DriverStatusBadgeProps = {
  status: DriverStatus;
  size?: 'sm' | 'lg';
  className?: string;
};

const DriverStatusBadge = ({ status, size = 'sm', className }: DriverStatusBadgeProps) => (
  <Badge
    className={cn(
      'font-medium',
      size === 'sm' ? 'typo-caption' : 'typo-sm-text px-3 py-1',
      DRIVER_STATUS_CLASSES[status] ?? DRIVER_STATUS_CLASSES.INACTIVE,
      className,
    )}
  >
    {DRIVER_STATUS_LABELS[status] ?? status}
  </Badge>
);

export default DriverStatusBadge;
