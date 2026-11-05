import { z } from 'zod';
import { AddressFormValues, EMPTY_ADDRESS, sameAddress, toAddressFormValues, toAddressPayload } from '@/lib/address';
import { CURP_LENGTH, CURP_REGEX, MAX_GUARANTORS } from '@/lib/driver';
import {
  AddressFields,
  DriverCreate,
  DriverDetail,
  DriverUpdate,
  GarageUpdate,
  GuarantorCreate,
  GuarantorUpdate,
} from '@/types/driver';

/**
 * Form values are kept as strings (what the inputs hold) and converted to the backend types in `toCreatePayload` /
 * `toUpdatePayload`. Limits mirror the backend `DriverCreateSchema` / `GuarantorCreateSchema` / `AddressFieldsSchema`.
 */

/** "El nombre es obligatorio." / "La licencia es obligatoria." / "Los apellidos son obligatorios." */
const required = (label: string): string => {
  if (label.startsWith('La ')) return `${label} es obligatoria.`;
  if (label.startsWith('Los ')) return `${label} son obligatorios.`;
  if (label.startsWith('Las ')) return `${label} son obligatorias.`;
  return `${label} es obligatorio.`;
};

const text = (label: string, max: number) =>
  z.string().trim().min(1, required(label)).max(max, `Máximo ${max} caracteres.`);

const date = (label: string) =>
  z
    .string()
    .min(1, required(label))
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Fecha inválida.');

const telephones = (label: string) =>
  z
    .array(z.string().trim().min(1).max(20, 'Cada teléfono admite máximo 20 caracteres.'))
    .min(1, `Agrega al menos un teléfono${label}.`);

/** The CURP is typed in upper case (the field converts it) and must have the official 18-character shape. */
const curp = z
  .string()
  .trim()
  .min(1, required('La CURP'))
  .length(CURP_LENGTH, `La CURP debe tener ${CURP_LENGTH} caracteres.`)
  .regex(CURP_REGEX, 'La CURP no tiene un formato válido. Revisa que esté completa y sin errores.');

const addressSchema = z.object({
  street: text('La calle', 70),
  exteriorNumber: text('El número exterior', 10),
  interiorNumber: z.string().trim().max(10, 'Máximo 10 caracteres.'),
  neighborhood: text('La colonia', 50),
  postalCode: z
    .string()
    .trim()
    .min(1, required('El código postal'))
    .regex(/^\d{5}$/, 'El código postal debe tener 5 dígitos.'),
  municipality: text('El municipio o alcaldía', 40),
  state: text('El estado', 30),
});

const guarantorSchema = z.object({
  /**
   * Backend id; present only for guarantors that already exist (edit mode), the new ones are created on save.
   * Not named `id` because react-hook-form's field arrays use that key for their own bookkeeping.
   */
  guarantorId: z.number().optional(),
  name: text('El nombre', 50),
  surnames: text('Los apellidos', 100),
  relation: text('El parentesco', 50),
  telephones: telephones(' del aval'),
  address: addressSchema,
  /** UI only (never sent): the address is the driver's, kept in sync with it while this is on. */
  sameAsDriver: z.boolean(),
});

const garageSchema = z.object({
  /** Backend id; present only for garages that already exist (edit mode). Same naming reason as `guarantorId`. */
  garageId: z.number().optional(),
  address: addressSchema,
  /** UI only (never sent); only the first garage can use the driver's address. */
  sameAsDriver: z.boolean(),
});

const objectSchema = z.object({
  // Step 1 – Datos del conductor
  name: text('El nombre', 50),
  surnames: text('Los apellidos', 100),
  identificationNumber: curp,
  licenseNumber: text('El número de licencia', 20),
  /** Date of the license; empty when it is permanent. */
  licenseValidity: z.string(),
  licensePermanent: z.boolean(),
  telephones: telephones(''),
  // Step 2 – Domicilio y cocheras
  address: addressSchema,
  garages: z.array(garageSchema).min(1, 'Agrega al menos una cochera.'),
  // Step 4 – Avales
  guarantors: z
    .array(guarantorSchema)
    .min(1, 'Registra al menos un aval.')
    .max(MAX_GUARANTORS, `Máximo ${MAX_GUARANTORS} avales.`),
});

export type GuarantorFormValues = z.infer<typeof guarantorSchema>;
export type GarageFormValues = z.infer<typeof garageSchema>;
export type DriverFormValues = z.infer<typeof objectSchema>;

type SchemaOptions = {
  /** In edit mode an already expired license can be left untouched; only a *changed* date must not be in the past. */
  initialLicenseValidity?: string;
};

const licenseDate = date('La vigencia de la licencia');

export const buildDriverSchema = ({ initialLicenseValidity }: SchemaOptions = {}) =>
  objectSchema.superRefine((values, ctx) => {
    // A permanent license has no date to check.
    if (values.licensePermanent) return;

    const parsed = licenseDate.safeParse(values.licenseValidity);
    if (!parsed.success) {
      ctx.addIssue({ code: 'custom', path: ['licenseValidity'], message: parsed.error.issues[0].message });
      return;
    }
    if (
      values.licenseValidity !== initialLicenseValidity &&
      Date.parse(`${values.licenseValidity}T23:59:59Z`) <= Date.now()
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['licenseValidity'],
        message: 'La vigencia de la licencia no puede estar en el pasado.',
      });
    }
  });

const emptyAddress = (): AddressFormValues => ({ ...EMPTY_ADDRESS });

export const EMPTY_GUARANTOR: GuarantorFormValues = {
  name: '',
  surnames: '',
  relation: '',
  telephones: [],
  address: emptyAddress(),
  sameAsDriver: false,
};

export const EMPTY_GARAGE: GarageFormValues = { address: emptyAddress(), sameAsDriver: false };

export const DEFAULT_DRIVER_FORM_VALUES: DriverFormValues = {
  name: '',
  surnames: '',
  identificationNumber: '',
  licenseNumber: '',
  licenseValidity: '',
  licensePermanent: false,
  telephones: [],
  address: emptyAddress(),
  garages: [{ address: emptyAddress(), sameAsDriver: false }],
  guarantors: [{ ...EMPTY_GUARANTOR, address: emptyAddress() }],
};

export type WizardStepId = 'data' | 'address' | 'photo' | 'guarantors' | 'summary' | 'documents';

/** Fields validated when leaving each step (and used to jump to the step of the first invalid field on save). */
export const STEP_FIELDS: Record<
  Exclude<WizardStepId, 'photo' | 'summary' | 'documents'>,
  (keyof DriverFormValues)[]
> = {
  data: [
    'name',
    'surnames',
    'identificationNumber',
    'licenseNumber',
    'licensePermanent',
    'licenseValidity',
    'telephones',
  ],
  address: ['address', 'garages'],
  guarantors: ['guarantors'],
};

/* ------------------------------------------------------------------ API <-> form */

const toDateInput = (iso: string): string => iso.slice(0, 10);

/** The license validity is a calendar date: it is sent as midnight UTC so it never shifts a day. */
const toApiDateTime = (value: string): string => `${value}T00:00:00Z`;

/** An address that equals the driver's own is shown with "use the driver's address" on when editing. */
const usesDriverAddress = (driver: DriverDetail, fields: AddressFields | null | undefined): boolean =>
  !!driver.addressFields && !!fields && sameAddress(fields, driver.addressFields);

export const driverToFormValues = (driver: DriverDetail): DriverFormValues => ({
  name: driver.name,
  surnames: driver.surnames,
  identificationNumber: driver.identificationNumber,
  licenseNumber: driver.licenseNumber,
  licenseValidity: driver.licenseValidity ? toDateInput(driver.licenseValidity) : '',
  licensePermanent: driver.licenseValidity === null,
  telephones: driver.telephones ?? [],
  address: toAddressFormValues(driver.addressFields),
  garages: (driver.garages ?? []).map((garage, index) => ({
    garageId: garage.id,
    address: toAddressFormValues(garage.addressFields),
    sameAsDriver: index === 0 && usesDriverAddress(driver, garage.addressFields),
  })),
  guarantors: (driver.guarantors ?? []).map((guarantor) => ({
    guarantorId: guarantor.id,
    name: guarantor.name,
    surnames: guarantor.surnames,
    relation: guarantor.relation,
    telephones: guarantor.telephones ?? [],
    address: toAddressFormValues(guarantor.addressFields),
    sameAsDriver: usesDriverAddress(driver, guarantor.addressFields),
  })),
});

const sameList = (a: string[], b: string[]): boolean => a.length === b.length && a.every((item, i) => item === b[i]);

export const toGuarantorPayload = (guarantor: GuarantorFormValues): GuarantorCreate => ({
  name: guarantor.name.trim(),
  surnames: guarantor.surnames.trim(),
  relation: guarantor.relation.trim(),
  telephones: guarantor.telephones,
  addressFields: toAddressPayload(guarantor.address),
});

export const toGaragePayload = (garage: GarageFormValues): GarageUpdate => ({
  addressFields: toAddressPayload(garage.address),
});

/** New drivers are always created Inactivo: they can only be activated once their documents are complete. */
export const toCreatePayload = (values: DriverFormValues): DriverCreate => ({
  name: values.name.trim(),
  surnames: values.surnames.trim(),
  status: 'INACTIVE',
  telephones: values.telephones,
  licenseNumber: values.licenseNumber.trim(),
  licenseValidity: values.licensePermanent ? null : toApiDateTime(values.licenseValidity),
  identificationNumber: values.identificationNumber.trim().toUpperCase(),
  addressFields: toAddressPayload(values.address),
});

/** Only the fields that changed (the backend re-validates e.g. the license date, so unchanged ones are never sent). */
export const toUpdatePayload = (values: DriverFormValues, initial: DriverFormValues): DriverUpdate => {
  const payload: DriverUpdate = {};
  const trimmed = (field: 'name' | 'surnames' | 'licenseNumber') => {
    const next = values[field].trim();
    if (next !== initial[field].trim()) payload[field] = next;
  };

  (['name', 'surnames', 'licenseNumber'] as const).forEach(trimmed);
  const curpValue = values.identificationNumber.trim().toUpperCase();
  if (curpValue !== initial.identificationNumber.trim().toUpperCase()) payload.identificationNumber = curpValue;
  const validity = (v: DriverFormValues) => (v.licensePermanent ? null : toApiDateTime(v.licenseValidity));
  if (validity(values) !== validity(initial)) payload.licenseValidity = validity(values);
  if (!sameList(values.telephones, initial.telephones)) payload.telephones = values.telephones;
  if (!sameAddress(values.address, initial.address)) payload.addressFields = toAddressPayload(values.address);

  return payload;
};

export type GuarantorChanges = {
  added: GuarantorFormValues[];
  updated: { id: number; payload: GuarantorUpdate; label: string }[];
  removed: { id: number; label: string }[];
};

/** Compares the guarantors of the form with the saved ones (matched by `guarantorId`). */
export const diffGuarantors = (values: GuarantorFormValues[], initial: GuarantorFormValues[]): GuarantorChanges => {
  const label = (g: GuarantorFormValues) => `${g.name} ${g.surnames}`.trim();
  const keptIds = new Set(values.filter((g) => g.guarantorId !== undefined).map((g) => g.guarantorId));

  const updated = values.flatMap((guarantor) => {
    const saved = initial.find((item) => item.guarantorId !== undefined && item.guarantorId === guarantor.guarantorId);
    if (!saved) return [];

    const payload: GuarantorUpdate = {};
    (['name', 'surnames', 'relation'] as const).forEach((field) => {
      const next = guarantor[field].trim();
      if (next !== saved[field].trim()) payload[field] = next;
    });
    if (!sameList(guarantor.telephones, saved.telephones)) payload.telephones = guarantor.telephones;
    if (!sameAddress(guarantor.address, saved.address)) payload.addressFields = toAddressPayload(guarantor.address);

    return Object.keys(payload).length > 0
      ? [{ id: guarantor.guarantorId as number, payload, label: label(guarantor) }]
      : [];
  });

  return {
    added: values.filter((g) => g.guarantorId === undefined),
    updated,
    removed: initial
      .filter((g) => g.guarantorId !== undefined && !keptIds.has(g.guarantorId))
      .map((g) => ({ id: g.guarantorId as number, label: label(g) })),
  };
};

export type GarageChanges = {
  added: GarageFormValues[];
  updated: { id: number; payload: GarageUpdate }[];
  removed: number[];
};

/** Compares the garages of the form with the saved ones (matched by `garageId`). */
export const diffGarages = (values: GarageFormValues[], initial: GarageFormValues[]): GarageChanges => {
  const keptIds = new Set(values.filter((g) => g.garageId !== undefined).map((g) => g.garageId));

  const updated = values.flatMap((garage) => {
    const saved = initial.find((item) => item.garageId !== undefined && item.garageId === garage.garageId);
    if (!saved || sameAddress(garage.address, saved.address)) return [];
    return [{ id: garage.garageId as number, payload: toGaragePayload(garage) }];
  });

  return {
    added: values.filter((g) => g.garageId === undefined),
    updated,
    removed: initial
      .filter((g) => g.garageId !== undefined && !keptIds.has(g.garageId))
      .map((g) => g.garageId as number),
  };
};
