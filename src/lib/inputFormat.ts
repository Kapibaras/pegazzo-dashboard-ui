/**
 * Live formatting for inputs. Form values stay "raw" (digits, optional dot) so validation and API payloads do not
 * change; only what the input shows is formatted.
 */

export type NumberFormat = 'integer' | 'decimal';

/** Keeps digits (and, for `decimal`, a single dot with at most 2 decimals) and drops leading zeros. */
export const sanitizeNumber = (input: string, format: NumberFormat): string => {
  const cleaned = input.replace(/[^\d.]/g, '');
  if (format === 'integer') return cleaned.replace(/\./g, '').replace(/^0+(?=\d)/, '');

  const dot = cleaned.indexOf('.');
  const integerPart = (dot === -1 ? cleaned : cleaned.slice(0, dot)).replace(/^0+(?=\d)/, '');
  if (dot === -1) return integerPart;
  const decimals = cleaned
    .slice(dot + 1)
    .replace(/\./g, '')
    .slice(0, 2);
  return `${integerPart || '0'}.${decimals}`;
};

/** "1234567.5" -> "1,234,567.5" (keeps a trailing dot so "12." can still be typed). */
export const formatNumberDisplay = (raw: string): string => {
  if (!raw) return '';
  const [integerPart, decimals] = raw.split('.');
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimals === undefined ? grouped : `${grouped}.${decimals}`;
};

/** Number of significant characters (digits and dot) in the first `caret` characters of `text`. */
export const countSignificant = (text: string, caret: number): number =>
  text.slice(0, caret).replace(/[^\d.]/g, '').length;

/** Caret position in `formatted` after `count` significant characters. */
export const caretForCount = (formatted: string, count: number): number => {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i += 1) {
    if (/[\d.]/.test(formatted[i])) seen += 1;
    if (seen === count) return i + 1;
  }
  return formatted.length;
};

export type DialCode = { code: string; label: string };

export const DIAL_CODES: DialCode[] = [
  { code: '+52', label: 'México' },
  { code: '+1', label: 'EE. UU. / Canadá' },
  { code: '+34', label: 'España' },
  { code: '+57', label: 'Colombia' },
  { code: '+54', label: 'Argentina' },
  { code: '+56', label: 'Chile' },
  { code: '+51', label: 'Perú' },
  { code: '+502', label: 'Guatemala' },
  { code: '+503', label: 'El Salvador' },
  { code: '+504', label: 'Honduras' },
  { code: '+506', label: 'Costa Rica' },
  { code: '+507', label: 'Panamá' },
];

export const DEFAULT_DIAL_CODE = '+52';
export const PHONE_MAX_DIGITS = 10;

/** "5512345678" -> "55 1234 5678": two digits first, then groups of four. */
export const formatPhoneDigits = (digits: string): string => {
  const clean = digits.replace(/\D/g, '').slice(0, PHONE_MAX_DIGITS);
  const groups = [clean.slice(0, 2)];
  for (let i = 2; i < clean.length; i += 4) groups.push(clean.slice(i, i + 4));
  return groups.filter(Boolean).join(' ');
};

/** Full value sent to the API ("+52 55 1234 5678"); empty when no digits were typed. */
export const composePhone = (dialCode: string, digits: string): string => {
  const formatted = formatPhoneDigits(digits);
  return formatted ? `${dialCode} ${formatted}` : '';
};
