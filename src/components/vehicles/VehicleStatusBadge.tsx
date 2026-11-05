import { Badge } from '@/components/ui/badge';
import { VEHICLE_STATUS_LABELS } from '@/lib/vehicle';
import { cn } from '@/lib/utils';
import { VehicleStatus } from '@/types/vehicle';

export const VEHICLE_STATUS_CLASSES: Record<VehicleStatus, string> = {
  ACTIVE: 'bg-success-50 text-success-700 hover:bg-success-50',
  INACTIVE: 'bg-secondary-50 text-carbon-400 hover:bg-secondary-50',
  IN_MAINTENANCE: 'bg-warning-100 text-warning-700 hover:bg-warning-100',
};

type VehicleStatusBadgeProps = {
  status: VehicleStatus;
  size?: 'sm' | 'lg';
  className?: string;
};

const VehicleStatusBadge = ({ status, size = 'sm', className }: VehicleStatusBadgeProps) => (
  <Badge
    className={cn(
      'font-medium',
      size === 'sm' ? 'typo-caption' : 'typo-sm-text px-3 py-1',
      VEHICLE_STATUS_CLASSES[status] ?? VEHICLE_STATUS_CLASSES.INACTIVE,
      className,
    )}
  >
    {VEHICLE_STATUS_LABELS[status] ?? status}
  </Badge>
);

export default VehicleStatusBadge;
