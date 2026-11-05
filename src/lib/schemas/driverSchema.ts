import { z } from 'zod';
import { MAX_GUARANTORS } from '@/lib/driver';
import { DriverCreate, DriverDetail, DriverUpdate, GuarantorCreate, GuarantorUpdate } from '@/types/driver';

/**
 * Form values are kept as strings (what the inputs hold) and converted to the backend types in `toCreatePayload` /
 * `toUpdatePayload`. Limits mirror the backend `DriverCreateSchema` / `GuarantorCreateSchema`.
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
  address: text('El domicilio', 255),
});

const baseSchema = z.object({
  // Step 1 – Datos del conductor
  name: text('El nombre', 50),
  surnames: text('Los apellidos', 100),
  identificationNumber: text('El número de identificación', 20),
  licenseNumber: text('El número de licencia', 20),
  licenseValidity: date('La vigencia de la licencia'),
  telephones: telephones(''),
  // Step 2 – Domicilio
  address: text('El domicilio', 255),
  garageAddress: z
    .array(z.string().trim().min(1).max(255, 'Cada cochera admite máximo 255 caracteres.'))
    .min(1, 'Agrega al menos una cochera.'),
  // Step 4 – Avales
  guarantors: z
    .array(guarantorSchema)
    .min(1, 'Registra al menos un aval.')
    .max(MAX_GUARANTORS, `Máximo ${MAX_GUARANTORS} avales.`),
});

export type GuarantorFormValues = z.infer<typeof guarantorSchema>;
export type DriverFormValues = z.infer<typeof baseSchema>;

type SchemaOptions = {
  /** In edit mode an already expired license can be left untouched; only a *changed* date must not be in the past. */
  initialLicenseValidity?: string;
};

export const buildDriverSchema = ({ initialLicenseValidity }: SchemaOptions = {}) =>
  baseSchema.extend({
    licenseValidity: date('La vigencia de la licencia').refine(
      (value) => value === initialLicenseValidity || Date.parse(`${value}T23:59:59Z`) > Date.now(),
      'La vigencia de la licencia no puede estar en el pasado.',
    ),
  });

export const EMPTY_GUARANTOR: GuarantorFormValues = {
  name: '',
  surnames: '',
  relation: '',
  telephones: [],
  address: '',
};

export const DEFAULT_DRIVER_FORM_VALUES: DriverFormValues = {
  name: '',
  surnames: '',
  identificationNumber: '',
  licenseNumber: '',
  licenseValidity: '',
  telephones: [],
  address: '',
  garageAddress: [],
  guarantors: [{ ...EMPTY_GUARANTOR }],
};

export type WizardStepId = 'data' | 'address' | 'photo' | 'guarantors' | 'summary' | 'documents';

/** Fields validated when leaving each step (and used to jump to the step of the first invalid field on save). */
export const STEP_FIELDS: Record<
  Exclude<WizardStepId, 'photo' | 'summary' | 'documents'>,
  (keyof DriverFormValues)[]
> = {
  data: ['name', 'surnames', 'identificationNumber', 'licenseNumber', 'licenseValidity', 'telephones'],
  address: ['address', 'garageAddress'],
  guarantors: ['guarantors'],
};

/* ------------------------------------------------------------------ API <-> form */

const toDateInput = (iso: string): string => iso.slice(0, 10);

/** The license validity is a calendar date: it is sent as midnight UTC so it never shifts a day. */
const toApiDateTime = (value: string): string => `${value}T00:00:00Z`;

export const driverToFormValues = (driver: DriverDetail): DriverFormValues => ({
  name: driver.name,
  surnames: driver.surnames,
  identificationNumber: driver.identificationNumber,
  licenseNumber: driver.licenseNumber,
  licenseValidity: toDateInput(driver.licenseValidity),
  telephones: driver.telephones ?? [],
  address: driver.address,
  garageAddress: driver.garageAddress ?? [],
  guarantors: (driver.guarantors ?? []).map((guarantor) => ({
    guarantorId: guarantor.id,
    name: guarantor.name,
    surnames: guarantor.surnames,
    relation: guarantor.relation,
    telephones: guarantor.telephones ?? [],
    address: guarantor.address,
  })),
});

const sameList = (a: string[], b: string[]): boolean => a.length === b.length && a.every((item, i) => item === b[i]);

export const toGuarantorPayload = (guarantor: GuarantorFormValues): GuarantorCreate => ({
  name: guarantor.name.trim(),
  surnames: guarantor.surnames.trim(),
  relation: guarantor.relation.trim(),
  telephones: guarantor.telephones,
  address: guarantor.address.trim(),
});

/** New drivers are always created Inactivo: they can only be activated once their documents are complete. */
export const toCreatePayload = (values: DriverFormValues): DriverCreate => ({
  name: values.name.trim(),
  surnames: values.surnames.trim(),
  status: 'INACTIVE',
  telephones: values.telephones,
  licenseNumber: values.licenseNumber.trim(),
  licenseValidity: toApiDateTime(values.licenseValidity),
  identificationNumber: values.identificationNumber.trim(),
  address: values.address.trim(),
  garageAddress: values.garageAddress,
});

/** Only the fields that changed (the backend re-validates e.g. the license date, so unchanged ones are never sent). */
export const toUpdatePayload = (values: DriverFormValues, initial: DriverFormValues): DriverUpdate => {
  const payload: DriverUpdate = {};
  const trimmed = (field: 'name' | 'surnames' | 'identificationNumber' | 'licenseNumber' | 'address') => {
    const next = values[field].trim();
    if (next !== initial[field].trim()) payload[field] = next;
  };

  (['name', 'surnames', 'identificationNumber', 'licenseNumber', 'address'] as const).forEach(trimmed);
  if (values.licenseValidity !== initial.licenseValidity)
    payload.licenseValidity = toApiDateTime(values.licenseValidity);
  if (!sameList(values.telephones, initial.telephones)) payload.telephones = values.telephones;
  if (!sameList(values.garageAddress, initial.garageAddress)) payload.garageAddress = values.garageAddress;

  return payload;
};

export type GuarantorChanges = {
  added: GuarantorFormValues[];
  updated: { id: number; payload: GuarantorUpdate; label: string }[];
  removed: { id: number; label: string }[];
};

/** Compares the guarantors of the form with the saved ones (matched by `id`). */
export const diffGuarantors = (values: GuarantorFormValues[], initial: GuarantorFormValues[]): GuarantorChanges => {
  const label = (g: GuarantorFormValues) => `${g.name} ${g.surnames}`.trim();
  const keptIds = new Set(values.filter((g) => g.guarantorId !== undefined).map((g) => g.guarantorId));

  const updated = values.flatMap((guarantor) => {
    const saved = initial.find((item) => item.guarantorId !== undefined && item.guarantorId === guarantor.guarantorId);
    if (!saved) return [];

    const payload: GuarantorUpdate = {};
    (['name', 'surnames', 'relation', 'address'] as const).forEach((field) => {
      const next = guarantor[field].trim();
      if (next !== saved[field].trim()) payload[field] = next;
    });
    if (!sameList(guarantor.telephones, saved.telephones)) payload.telephones = guarantor.telephones;

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
