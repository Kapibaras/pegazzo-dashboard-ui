import { z } from 'zod';
import { isValidTireSpecification } from '@/lib/tire';
import { VehicleCreate, VehicleDetail, VehicleUpdate } from '@/types/vehicle';

/**
 * Form values are kept as strings (what the inputs hold) and converted to the backend types in
 * `toCreatePayload` / `toUpdatePayload`. Limits mirror the backend `CarSchema`.
 */

/** "El motor es obligatorio." / "La placa es obligatoria." / "Los apellidos son obligatorios." (agrees with the article). */
const required = (label: string): string => {
  if (label.startsWith('La ')) return `${label} es obligatoria.`;
  if (label.startsWith('Los ')) return `${label} son obligatorios.`;
  if (label.startsWith('Las ')) return `${label} son obligatorias.`;
  return `${label} es obligatorio.`;
};

const text = (label: string, max: number) =>
  z.string().trim().min(1, required(label)).max(max, `Máximo ${max} caracteres.`);

const integer = (label: string, min: number) =>
  z
    .string()
    .trim()
    .min(1, required(label))
    .refine((value) => /^\d+$/.test(value) && Number(value) >= min, `Ingresa un número entero mayor o igual a ${min}.`);

const money = (label: string) =>
  z
    .string()
    .trim()
    .min(1, required(label))
    .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), 'Ingresa un monto válido (máximo 2 decimales).');

const date = (label: string) =>
  z
    .string()
    .min(1, required(label))
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Fecha inválida.');

/**
 * The engine is typed as a number of litres ("1.5"): the form shows a fixed "L" after it and the API receives "1.5L".
 * A comma is accepted as the decimal separator.
 */
const ENGINE_LITRES = /^\d{1,2}([.,]\d{1,2})?$/;
const ENGINE_FROM_API = /^(\d{1,2}(?:[.,]\d{1,2})?)\s*L$/i;

export const isEngineLitres = (value: string): boolean =>
  ENGINE_LITRES.test(value.trim()) && Number(value.trim().replace(',', '.')) > 0;

/** "1.5" -> "1.5L". Anything that is not a plain number (legacy free text) is sent untouched. */
export const engineTypeToApi = (value: string): string => {
  const trimmed = value.trim();
  return isEngineLitres(trimmed) ? `${trimmed.replace(',', '.')}L` : trimmed;
};

/** "1.5L" -> "1.5". Values saved in another shape (e.g. "Híbrido 1.8L") are kept as they are. */
export const engineTypeFromApi = (value: string): string => ENGINE_FROM_API.exec(value.trim())?.[1] ?? value;

/** In edit mode a legacy value that is not a plain number can stay as long as it is left untouched. */
const engineType = (initial?: string) =>
  z
    .string()
    .trim()
    .min(1, required('El motor'))
    .max(30, 'Máximo 30 caracteres.')
    .refine(
      (value) => value === initial || isEngineLitres(value),
      'Ingresa solo el número de litros, por ejemplo 1.5.',
    );

const baseSchema = z.object({
  // Step 1 – Identidad
  make: text('La marca', 50),
  model: text('El modelo', 50),
  year: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'El año debe tener 4 dígitos.')
    .refine((value) => Number(value) >= 1950 && Number(value) <= new Date().getFullYear() + 1, 'Año fuera de rango.'),
  color: text('El color', 30),
  bodyType: text('La carrocería', 30),
  engineType: engineType(),
  transmission: z.enum(['TM', 'TA'], { message: 'Selecciona la transmisión.' }),

  // Step 2 – Técnico y batería
  vin: text('El VIN', 17),
  plate: text('La placa', 10),
  engineSerialNumber: text('La serie de motor', 30),
  odometer: integer('El odómetro', 0),
  doorsNumber: integer('El número de puertas', 1),
  passengersNumber: integer('El número de pasajeros', 1),
  tireSpecification: text('La especificación de llantas', 20),
  batteryModel: text('El modelo de batería', 20),
  batterySerialNumber: text('La serie de batería', 30),
  batteryDate: date('La fecha de batería'),

  // Step 3 – Administrativo
  insuranceProviderId: z.string().min(1, 'Selecciona una aseguradora.'),
  policyNumber: text('El número de póliza', 30),
  policyType: text('El tipo de póliza', 20),
  policyExpirationDate: date('La vigencia de la póliza'),
  unitValue: money('El valor de unidad'),
  unitBillingValue: money('El valor de facturación'),
  billNumber: text('El número de factura', 30),
  publicVehicleRegistry: text('El RPV', 30),
  altaPublicVehicleRegistry: date('La fecha de alta RPV'),
  isFinancedLiquidated: z.boolean(),
  financingAgency: z.string().trim().max(100, 'Máximo 100 caracteres.'),
  financingPurchaseDate: z.string(),
  financingTermMonths: z.string().trim(),
  financingRemainingAmount: z.string().trim(),
  legalOwnerIsPegazzo: z.boolean(),
  legalOwnerName: text('El nombre', 50),
  legalOwnerSurnames: text('Los apellidos', 100),

  // Step 4 – Socio
  associateId: z.string().min(1, 'Selecciona un socio.'),
  notes: z.string().trim().max(1000, 'Máximo 1000 caracteres.'),
});

export type VehicleFormValues = z.infer<typeof baseSchema>;

type SchemaOptions = {
  /** In edit mode an already expired policy can be left untouched; only a *changed* date must be in the future. */
  initialPolicyDate?: string;
  /** In edit mode an engine saved as free text (not a plain number of litres) can be kept unchanged. */
  initialEngineType?: string;
  /** In edit mode a tyre spec saved as free text can be kept unchanged. */
  initialTireSpecification?: string;
};

export const buildVehicleSchema = ({
  initialPolicyDate,
  initialEngineType,
  initialTireSpecification,
}: SchemaOptions = {}) =>
  baseSchema
    .extend({
      engineType: engineType(initialEngineType),
      tireSpecification: z
        .string()
        .trim()
        .min(1, required('La especificación de llantas'))
        .refine(
          (value) => value === initialTireSpecification || isValidTireSpecification(value),
          'Completa ancho, perfil y rin. Ejemplo: 185/65 R15.',
        ),
      policyExpirationDate: date('La vigencia de la póliza').refine(
        (value) => value === initialPolicyDate || Date.parse(`${value}T23:59:59Z`) > Date.now(),
        'La vigencia de la póliza no puede estar en el pasado.',
      ),
    })
    .superRefine((values, ctx) => {
      if (values.isFinancedLiquidated) return;

      const required: [keyof VehicleFormValues, string][] = [
        ['financingAgency', 'La agencia es obligatoria si el coche no está liquidado.'],
        ['financingPurchaseDate', 'La fecha de compra es obligatoria.'],
        ['financingTermMonths', 'El plazo es obligatorio.'],
        ['financingRemainingAmount', 'El monto restante es obligatorio.'],
      ];

      for (const [field, message] of required) {
        if (!String(values[field]).trim()) ctx.addIssue({ code: 'custom', path: [field], message });
      }
      if (values.financingTermMonths && !/^[1-9]\d*$/.test(values.financingTermMonths)) {
        ctx.addIssue({ code: 'custom', path: ['financingTermMonths'], message: 'Ingresa meses como número entero.' });
      }
      if (values.financingRemainingAmount && !/^\d+(\.\d{1,2})?$/.test(values.financingRemainingAmount)) {
        ctx.addIssue({ code: 'custom', path: ['financingRemainingAmount'], message: 'Ingresa un monto válido.' });
      }
    });

export const PEGAZZO_OWNER = { name: 'Pegazzo', surnames: 'S.A. de C.V.' } as const;

export const DEFAULT_VEHICLE_FORM_VALUES: VehicleFormValues = {
  make: '',
  model: '',
  year: '',
  color: '',
  bodyType: '',
  engineType: '',
  transmission: 'TA',
  vin: '',
  plate: '',
  engineSerialNumber: '',
  odometer: '',
  doorsNumber: '4',
  passengersNumber: '5',
  tireSpecification: '',
  batteryModel: '',
  batterySerialNumber: '',
  batteryDate: '',
  insuranceProviderId: '',
  policyNumber: '',
  policyType: '',
  policyExpirationDate: '',
  unitValue: '',
  unitBillingValue: '',
  billNumber: '',
  publicVehicleRegistry: '',
  altaPublicVehicleRegistry: '',
  isFinancedLiquidated: true,
  financingAgency: '',
  financingPurchaseDate: '',
  financingTermMonths: '',
  financingRemainingAmount: '',
  legalOwnerIsPegazzo: false,
  legalOwnerName: '',
  legalOwnerSurnames: '',
  associateId: '',
  notes: '',
};

export type WizardStepId = 'identity' | 'technical' | 'admin' | 'associate' | 'summary' | 'documents';

/** Fields validated when leaving each step (`trigger`). */
export const STEP_FIELDS: Record<Exclude<WizardStepId, 'summary' | 'documents'>, (keyof VehicleFormValues)[]> = {
  identity: ['make', 'model', 'year', 'color', 'bodyType', 'engineType', 'transmission'],
  technical: [
    'vin',
    'plate',
    'engineSerialNumber',
    'odometer',
    'doorsNumber',
    'passengersNumber',
    'tireSpecification',
    'batteryModel',
    'batterySerialNumber',
    'batteryDate',
  ],
  admin: [
    'insuranceProviderId',
    'policyNumber',
    'policyType',
    'policyExpirationDate',
    'unitValue',
    'unitBillingValue',
    'billNumber',
    'publicVehicleRegistry',
    'altaPublicVehicleRegistry',
    'isFinancedLiquidated',
    'financingAgency',
    'financingPurchaseDate',
    'financingTermMonths',
    'financingRemainingAmount',
    'legalOwnerName',
    'legalOwnerSurnames',
  ],
  associate: ['associateId', 'notes'],
};

const toDateInput = (value: string | null | undefined): string => (value ? value.slice(0, 10) : '');
const toDateTime = (value: string): string => `${value}T00:00:00Z`;

const getNotes = (details: unknown): string => {
  if (details && typeof details === 'object' && 'notes' in details) {
    const notes = (details as { notes?: unknown }).notes;
    return typeof notes === 'string' ? notes : '';
  }
  return '';
};

export const vehicleToFormValues = (vehicle: VehicleDetail): VehicleFormValues => ({
  make: vehicle.make,
  model: vehicle.model,
  year: vehicle.year,
  color: vehicle.color,
  bodyType: vehicle.bodyType,
  engineType: engineTypeFromApi(vehicle.engineType),
  transmission: vehicle.transmission === 'TM' ? 'TM' : 'TA',
  vin: vehicle.vin,
  plate: vehicle.plate,
  engineSerialNumber: vehicle.engineSerialNumber,
  odometer: String(vehicle.odometer),
  doorsNumber: String(vehicle.doorsNumber),
  passengersNumber: String(vehicle.passengersNumber),
  tireSpecification: vehicle.tireSpecification,
  batteryModel: vehicle.batteryModel,
  batterySerialNumber: vehicle.batterySerialNumber,
  batteryDate: toDateInput(vehicle.batteryDate),
  insuranceProviderId: String(vehicle.insurance.id),
  policyNumber: vehicle.insurance.policyNumber,
  policyType: vehicle.insurance.policyType,
  policyExpirationDate: toDateInput(vehicle.insurance.policyExpirationDate),
  unitValue: String(vehicle.unitValue),
  unitBillingValue: String(vehicle.unitBillingValue),
  billNumber: vehicle.billNumber,
  publicVehicleRegistry: vehicle.publicVehicleRegistry,
  altaPublicVehicleRegistry: toDateInput(vehicle.altaPublicVehicleRegistry),
  isFinancedLiquidated: vehicle.isFinancedLiquidated,
  financingAgency: vehicle.financingAgency ?? '',
  financingPurchaseDate: toDateInput(vehicle.financingPurchaseDate),
  financingTermMonths: vehicle.financingTermMonths ? String(vehicle.financingTermMonths) : '',
  financingRemainingAmount:
    vehicle.financingRemainingAmount !== null && vehicle.financingRemainingAmount !== undefined
      ? String(vehicle.financingRemainingAmount)
      : '',
  legalOwnerIsPegazzo: vehicle.legalOwnerName.trim().toLowerCase() === PEGAZZO_OWNER.name.toLowerCase(),
  legalOwnerName: vehicle.legalOwnerName,
  legalOwnerSurnames: vehicle.legalOwnerSurnames,
  associateId: vehicle.associate ? String(vehicle.associate.id) : '',
  notes: getNotes(vehicle.details),
});

/** Converts one form field to its API representation (field name = API field name unless noted). */
const convertField = (values: VehicleFormValues, field: keyof VehicleFormValues): Partial<VehicleUpdate> => {
  switch (field) {
    case 'odometer':
    case 'doorsNumber':
    case 'passengersNumber':
    case 'unitValue':
    case 'unitBillingValue':
    case 'insuranceProviderId':
      return { [field]: Number(values[field]) };
    case 'associateId':
      return { associateId: values.associateId ? Number(values.associateId) : null };
    case 'batteryDate':
    case 'policyExpirationDate':
    case 'altaPublicVehicleRegistry':
      return { [field]: toDateTime(values[field]) };
    case 'engineType':
      return { engineType: engineTypeToApi(values.engineType) };
    case 'isFinancedLiquidated':
      return { isFinancedLiquidated: values.isFinancedLiquidated };
    case 'financingAgency':
      return { financingAgency: values.isFinancedLiquidated ? null : values.financingAgency.trim() || null };
    case 'financingPurchaseDate':
      return { financingPurchaseDate: values.isFinancedLiquidated ? null : values.financingPurchaseDate || null };
    case 'financingTermMonths':
      return { financingTermMonths: values.isFinancedLiquidated ? null : Number(values.financingTermMonths) || null };
    case 'financingRemainingAmount':
      return {
        financingRemainingAmount: values.isFinancedLiquidated ? null : Number(values.financingRemainingAmount) || 0,
      };
    case 'notes':
      return { details: values.notes.trim() ? { notes: values.notes.trim() } : null };
    case 'legalOwnerIsPegazzo':
      return {}; // UI-only: it is derived from the owner name and only feeds the folio.
    default:
      return { [field]: String(values[field]).trim() } as Partial<VehicleUpdate>;
  }
};

export const toCreatePayload = (values: VehicleFormValues, folio: string): VehicleCreate => {
  const payload = (Object.keys(values) as (keyof VehicleFormValues)[]).reduce<Partial<VehicleUpdate>>(
    (acc, field) => ({ ...acc, ...convertField(values, field) }),
    {},
  );

  return { ...payload, id: folio, status: 'ACTIVE' } as VehicleCreate;
};

const FINANCING_FIELDS: (keyof VehicleFormValues)[] = [
  'financingAgency',
  'financingPurchaseDate',
  'financingTermMonths',
  'financingRemainingAmount',
];

/** Only the fields that changed (the backend re-validates e.g. the policy date, so unchanged ones are never sent). */
export const toUpdatePayload = (values: VehicleFormValues, initial: VehicleFormValues): VehicleUpdate => {
  const changed = (Object.keys(values) as (keyof VehicleFormValues)[]).filter(
    (field) => values[field] !== initial[field],
  );

  // The backend validates the *resulting* financing state, so send the whole block when any part of it changes.
  if (changed.includes('isFinancedLiquidated') || FINANCING_FIELDS.some((field) => changed.includes(field))) {
    for (const field of [...FINANCING_FIELDS, 'isFinancedLiquidated' as const]) {
      if (!changed.includes(field)) changed.push(field);
    }
  }

  return changed.reduce<VehicleUpdate>((acc, field) => ({ ...acc, ...convertField(values, field) }), {});
};
