/** Formats an ISO date as "05 nov 2026" (es-MX, UTC so a date-only value never shifts a day). */
export const formatDate = (value: string | null | undefined): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    date,
  );
};
