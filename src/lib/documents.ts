import { DocumentExpiryStatus } from '@/types/document';

export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_DOCUMENT_SIZE_MB = 15;
export const IMAGE_ACCEPT = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const DOCUMENT_ACCEPT = ['application/pdf', ...IMAGE_ACCEPT] as const;

export const EXPIRY_STATUS_LABELS: Record<DocumentExpiryStatus, string> = {
  valid: 'Vigente',
  expiring_soon: 'Por vencer',
  expired: 'Vencido',
};

/** Same threshold as the backend (`DocumentConfig.EXPIRING_SOON_DAYS`). */
const EXPIRING_SOON_DAYS = 30;

/** Client-side twin of the backend's `compute_expiry_status`, for dates that do not come with a status (e.g. a license). */
export const getExpiryStatus = (
  isoDate: string | null | undefined,
  now: Date = new Date(),
): DocumentExpiryStatus | null => {
  if (!isoDate) return null;
  const expiry = new Date(isoDate);
  if (Number.isNaN(expiry.getTime())) return null;
  if (now > expiry) return 'expired';
  if (now.getTime() + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000 > expiry.getTime()) return 'expiring_soon';
  return 'valid';
};
