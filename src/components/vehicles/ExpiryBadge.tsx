import { Badge } from '@/components/ui/badge';
import { EXPIRY_STATUS_LABELS } from '@/lib/vehicle';
import { cn } from '@/lib/utils';
import { DocumentExpiryStatus } from '@/types/vehicle';

const EXPIRY_CLASSES: Record<DocumentExpiryStatus, string> = {
  valid: 'bg-success-50 text-success-700 hover:bg-success-50',
  expiring_soon: 'bg-warning-100 text-warning-700 hover:bg-warning-100',
  expired: 'bg-error-50 text-error-700 hover:bg-error-50',
};

type ExpiryBadgeProps = {
  status: DocumentExpiryStatus | null | undefined;
  className?: string;
};

/** Renders nothing for documents without an expiry date (`expiryStatus` is null). Shared with the Driver detail. */
const ExpiryBadge = ({ status, className }: ExpiryBadgeProps) => {
  if (!status) return null;

  return (
    <Badge className={cn('typo-caption', EXPIRY_CLASSES[status], className)}>{EXPIRY_STATUS_LABELS[status]}</Badge>
  );
};

export default ExpiryBadge;
