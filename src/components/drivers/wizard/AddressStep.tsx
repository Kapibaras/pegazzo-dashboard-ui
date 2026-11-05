'use client';

import { Info, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { StepCard } from '@/components/common/wizard/fields';
import { Button } from '@/components/ui/button';
import { DriverFormValues, EMPTY_GARAGE } from '@/lib/schemas/driverSchema';
import AddressFieldset from './AddressFieldset';

/** Free-text addresses saved before the split into fields, to show them while the user re-enters them. */
export type LegacyAddresses = {
  driver?: string | null;
  garages: Record<number, string>;
  guarantors: Record<number, string>;
};

type AddressStepProps = {
  form: UseFormReturn<DriverFormValues>;
  legacy: LegacyAddresses;
};

const AddressStep = ({ form, legacy }: AddressStepProps) => {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'garages' });
  const garagesError = form.formState.errors.garages?.root?.message ?? form.formState.errors.garages?.message;

  return (
    <div className="flex flex-col gap-5">
      <StepCard title="Domicilio del conductor" description="El domicilio de su comprobante de domicilio.">
        <AddressFieldset form={form} path="address" legacyText={legacy.driver} />
      </StepCard>

      <div
        className="typo-sm-text bg-primary-50 text-primary-900 flex items-start gap-3 rounded-lg px-4 py-3"
        role="note"
      >
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          Cada cochera necesita su propio comprobante de domicilio. Se sube en el último paso, cuando el conductor ya
          está creado.
        </p>
      </div>

      {fields.map((item, index) => (
        <StepCard
          key={item.id}
          title={`Cochera ${index + 1}`}
          description={item.garageId ? 'Cochera ya registrada: tus cambios se guardan al final.' : undefined}
        >
          <AddressFieldset
            form={form}
            path={`garages.${index}.address`}
            legacyText={item.garageId ? legacy.garages[item.garageId] : null}
          />
          {fields.length > 1 && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => remove(index)}
                className="border-error-500/40 text-error-700 hover:bg-error-50 cursor-pointer gap-2"
              >
                <Trash2 className="size-4" aria-hidden /> Quitar cochera
              </Button>
            </div>
          )}
        </StepCard>
      ))}

      {garagesError && (
        <p className="typo-caption text-error-700" role="alert">
          {garagesError}
        </p>
      )}

      <div>
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ ...EMPTY_GARAGE, address: { ...EMPTY_GARAGE.address } })}
          className="cursor-pointer gap-2"
        >
          <Plus className="size-4" aria-hidden /> Agregar otra cochera
        </Button>
      </div>
    </div>
  );
};

export default AddressStep;
