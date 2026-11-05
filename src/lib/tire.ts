/**
 * Tyre size code (ISO 4000 / ISO-metric), e.g. "185/65 R15 91H":
 * width (mm) / aspect ratio (%) + construction (R radial, D diagonal) + rim (in) [+ load index + speed symbol].
 * The form edits the parts separately and the API receives them joined in this canonical shape.
 */
export type TireParts = {
  width: string;
  aspect: string;
  construction: 'R' | 'D';
  rim: string;
  load: string;
  speed: string;
};

export const EMPTY_TIRE: TireParts = { width: '', aspect: '', construction: 'R', rim: '', load: '', speed: '' };

const TIRE_PATTERN = /^(\d{3})\/(\d{2})\s*([RD])\s*(\d{2})(?:\s*(\d{2,3})\s*([A-Z]{1,2}))?$/i;

export const isValidTireSpecification = (value: string): boolean => TIRE_PATTERN.test(value.trim());

/** Splits a stored code into parts; `null` when it does not follow the standard shape (legacy free text). */
export const parseTire = (value: string): TireParts | null => {
  if (!value.trim()) return { ...EMPTY_TIRE };
  const match = TIRE_PATTERN.exec(value.trim());
  if (!match) return null;
  return {
    width: match[1],
    aspect: match[2],
    construction: match[3].toUpperCase() as 'R' | 'D',
    rim: match[4],
    load: match[5] ?? '',
    speed: (match[6] ?? '').toUpperCase(),
  };
};

/** Joins the parts. Incomplete input yields an incomplete string (the schema flags it); nothing typed yields ''. */
export const composeTire = ({ width, aspect, construction, rim, load, speed }: TireParts): string => {
  if (!width && !aspect && !rim && !load && !speed) return '';
  const base = `${width}/${aspect} ${construction}${rim}`;
  return load || speed ? `${base} ${load}${speed}` : base;
};
