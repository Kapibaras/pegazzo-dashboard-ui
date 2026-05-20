import { Badge } from '@/components/ui/badge';
import { TRANSACTION_STATUS_LABELS } from '@/lib/transaction';
import { TransactionStatus } from '@/types/transaction';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

const STATUS_CLASSES: Record<TransactionStatus, string> = {
  PENDING: 'bg-warning-100 text-warning-700 hover:bg-warning-100',
  CONFIRMED: 'bg-success-50 text-success-700 hover:bg-success-50',
  REJECTED: 'bg-error-50 text-error-700 hover:bg-error-50',
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <Badge className={cn('text-xs font-medium', STATUS_CLASSES[status], className)}>
      {TRANSACTION_STATUS_LABELS[status]}
    </Badge>
  );
};

export default StatusBadge;
