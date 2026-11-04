import { Badge } from '@/components/ui/badge';
import { VEHICLE_STATUS_LABELS } from '@/lib/vehicle';
import { cn } from '@/lib/utils';
import { VehicleStatus } from '@/types/vehicle';

const STATUS_CLASSES: Record<VehicleStatus, string> = {
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
      size === 'sm' ? 'text-xs' : 'px-3 py-1 text-sm',
      STATUS_CLASSES[status] ?? STATUS_CLASSES.INACTIVE,
      className,
    )}
  >
    {VEHICLE_STATUS_LABELS[status] ?? status}
  </Badge>
);

export default VehicleStatusBadge;
