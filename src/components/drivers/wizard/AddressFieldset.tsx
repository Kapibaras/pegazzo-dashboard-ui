'use client';

import { Info } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { TextField } from '@/components/common/wizard/fields';
import { FormField } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { ADDRESS_LIMITS, formatAddress, isAddressComplete } from '@/lib/address';
import { DriverFormValues } from '@/lib/schemas/driverSchema';
import { cn } from '@/lib/utils';

/** Where the address lives in the form: the driver's own, or inside a garage / guarantor of a field array. */
export type AddressPath = 'address' | `garages.${number}.address` | `guarantors.${number}.address`;

/** The flag that makes a garage / guarantor use the driver's address. */
export type SameAsDriverPath = `garages.${number}.sameAsDriver` | `guarantors.${number}.sameAsDriver`;

type AddressFieldsetProps = {
  form: UseFormReturn<DriverFormValues>;
  path: AddressPath;
  /** The address as it was saved before it was split into fields (free text). Shown so it can be re-entered. */
  legacyText?: string | null;
  /** When given, shows the "Usar domicilio del conductor" switch bound to this flag. */
  sameAsDriverPath?: SameAsDriverPath;
};

/** The address split into the usual fields; the backend joins them into the single text it keeps. */
const AddressFieldset = ({ form, path, legacyText, sameAsDriverPath }: AddressFieldsetProps) => {
  const driverAddress = form.watch('address');
  const driverReady = isAddressComplete(driverAddress);
  const sameAsDriver = sameAsDriverPath ? form.watch(sameAsDriverPath) : false;

  return (
    <div className="flex flex-col gap-4">
      {sameAsDriverPath && (
        <FormField
          control={form.control}
          name={sameAsDriverPath}
          render={({ field }) => (
            <label
              className="flex cursor-pointer items-start gap-3"
              title={driverReady ? undefined : 'Primero captura el domicilio del conductor'}
            >
              <Switch
                checked={!!field.value}
                onCheckedChange={field.onChange}
                disabled={!driverReady && !field.value}
                aria-label="Usar domicilio del conductor"
                className="mt-0.5"
              />
              <span className="flex flex-col">
                <span
                  className={cn('typo-label transition-colors', field.value ? 'text-primary-700' : 'text-carbon-300')}
                >
                  Usar domicilio del conductor
                </span>
                <span className="typo-caption text-carbon-300">
                  {driverReady
                    ? 'Se copia el domicilio y su comprobante de domicilio.'
                    : 'Primero captura el domicilio del conductor en el paso Domicilio.'}
                </span>
              </span>
            </label>
          )}
        />
      )}

      {sameAsDriver ? (
        <p className="typo-sm-text text-carbon-500 bg-surface-600/40 rounded-lg px-4 py-3 break-words">
          {formatAddress(driverAddress)}
        </p>
      ) : (
        <>
          {legacyText && (
            <p
              className="typo-sm-text bg-warning-100/60 text-warning-800 flex items-start gap-2 rounded-lg px-4 py-3"
              role="note"
            >
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Este domicilio se guardó como texto libre: <strong className="break-words">{legacyText}</strong>.
                Captúralo por campos para poder guardarlo.
              </span>
            </p>
          )}

          <div className="grid items-start gap-4 sm:grid-cols-12">
            <TextField
              control={form.control}
              name={`${path}.street`}
              label="Calle"
              maxLength={ADDRESS_LIMITS.street}
              className="sm:col-span-6"
            />
            <TextField
              control={form.control}
              name={`${path}.exteriorNumber`}
              label="Núm. exterior"
              maxLength={ADDRESS_LIMITS.exteriorNumber}
              className="sm:col-span-3"
            />
            <TextField
              control={form.control}
              name={`${path}.interiorNumber`}
              label="Núm. interior"
              optional
              maxLength={ADDRESS_LIMITS.interiorNumber}
              className="sm:col-span-3"
            />
            <TextField
              control={form.control}
              name={`${path}.neighborhood`}
              label="Colonia"
              maxLength={ADDRESS_LIMITS.neighborhood}
              className="sm:col-span-6"
            />
            <TextField
              control={form.control}
              name={`${path}.postalCode`}
              label="Código postal"
              inputMode="numeric"
              maxLength={5}
              mono
              transform={(value) => value.replace(/\D/g, '')}
              className="sm:col-span-6"
            />
            <TextField
              control={form.control}
              name={`${path}.municipality`}
              label="Municipio o alcaldía"
              maxLength={ADDRESS_LIMITS.municipality}
              className="sm:col-span-6"
            />
            <TextField
              control={form.control}
              name={`${path}.state`}
              label="Estado"
              maxLength={ADDRESS_LIMITS.state}
              className="sm:col-span-6"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AddressFieldset;
