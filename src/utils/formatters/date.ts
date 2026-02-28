import { formatISO } from 'date-fns';

/**
 * Parses a date-only string (YYYY-MM-DD) as midnight in local time,
 * avoiding the one-day offset bug that occurs with `new Date('YYYY-MM-DD')`,
 * which interprets the string as UTC midnight instead of local time.
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object at local midnight
 *
 * @example
 * parseDateOnly('2026-02-15') // → Date (2026-02-15T00:00:00 local time)
 */
export const parseDateOnly = (dateStr: string): Date => new Date(`${dateStr}T00:00:00`);

/**
 * Combines a date string (YYYY-MM-DD) and a time string (HH:mm) into an
 * ISO 8601 string with the local timezone offset (e.g. "2026-02-15T14:30:00-05:00").
 * The local time is preserved as-is — no conversion to UTC is performed.
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param time - Time string in HH:mm format
 * @returns ISO 8601 string with local timezone offset
 *
 * @example
 * toLocalISOWithOffset('2026-02-15', '14:30') // → "2026-02-15T14:30:00-05:00"
 */
export const toLocalISOWithOffset = (dateStr: string, time: string): string =>
  formatISO(new Date(`${dateStr}T${time}`));
