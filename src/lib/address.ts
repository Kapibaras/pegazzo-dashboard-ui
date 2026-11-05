import { AddressFields } from '@/types/driver';

/** Backend limits (`AddressFieldsSchema`); they keep the joined text under the 255-character columns. */
export const ADDRESS_LIMITS = {
  street: 70,
  exteriorNumber: 10,
  interiorNumber: 10,
  neighborhood: 50,
  municipality: 40,
  state: 30,
} as const;

/** The address as the form holds it: every field is a string (an empty interior number is `''`). */
export type AddressFormValues = Omit<AddressFields, 'interiorNumber'> & { interiorNumber: string };

export const EMPTY_ADDRESS: AddressFormValues = {
  street: '',
  exteriorNumber: '',
  interiorNumber: '',
  neighborhood: '',
  postalCode: '',
  municipality: '',
  state: '',
};

/** Same joined text the backend builds, e.g. "Av. Reforma 100 Int. 4, Col. Centro, C.P. 06000, Cuauhtémoc, CDMX". */
export const formatAddress = (fields: AddressFields): string => {
  const interior = fields.interiorNumber?.trim();
  const number = `${fields.street.trim()} ${fields.exteriorNumber.trim()}${interior ? ` Int. ${interior}` : ''}`;
  return [
    number,
    `Col. ${fields.neighborhood.trim()}`,
    `C.P. ${fields.postalCode.trim()}`,
    fields.municipality.trim(),
    fields.state.trim(),
  ].join(', ');
};

const FIELDS = [
  'street',
  'exteriorNumber',
  'interiorNumber',
  'neighborhood',
  'postalCode',
  'municipality',
  'state',
] as const;

/** Compares two addresses ignoring surrounding spaces and a missing vs. empty interior number. */
export const sameAddress = (a: AddressFields, b: AddressFields): boolean =>
  FIELDS.every((field) => (a[field] ?? '').trim() === (b[field] ?? '').trim());

/** Fields as the form holds them (every value a string), from what the API returned (`null` for legacy addresses). */
export const toAddressFormValues = (fields: AddressFields | null | undefined): AddressFormValues => ({
  ...EMPTY_ADDRESS,
  ...(fields ?? {}),
  interiorNumber: fields?.interiorNumber ?? '',
});

/** What is sent to the API: trimmed, and no interior number when it was left blank. */
export const toAddressPayload = (fields: AddressFields): AddressFields => {
  const interior = fields.interiorNumber?.trim();
  return {
    street: fields.street.trim(),
    exteriorNumber: fields.exteriorNumber.trim(),
    ...(interior ? { interiorNumber: interior } : {}),
    neighborhood: fields.neighborhood.trim(),
    postalCode: fields.postalCode.trim(),
    municipality: fields.municipality.trim(),
    state: fields.state.trim(),
  };
};
