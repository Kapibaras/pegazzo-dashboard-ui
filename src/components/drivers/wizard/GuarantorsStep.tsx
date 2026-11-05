'use client';

import { Info, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import PhoneListField from '@/components/common/PhoneListField';
import { FieldGrid, StepCard, TextField } from '@/components/common/wizard/fields';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MAX_GUARANTORS } from '@/lib/driver';
import { DriverFormValues, EMPTY_GUARANTOR } from '@/lib/schemas/driverSchema';
import AddressFieldset from './AddressFieldset';
import { LegacyAddresses } from './AddressStep';

type GuarantorsStepProps = {
  form: UseFormReturn<DriverFormValues>;
  legacy: LegacyAddresses;
};

const GuarantorsStep = ({ form, legacy }: GuarantorsStepProps) => {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'guarantors' });
  const rootError = form.formState.errors.guarantors?.root?.message ?? form.formState.errors.guarantors?.message;

  return (
    <div className="flex flex-col gap-5">
      <div
        className="typo-sm-text bg-primary-50 text-primary-900 flex items-start gap-3 rounded-lg px-4 py-3"
        role="note"
      >
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          Registra de uno a {MAX_GUARANTORS} avales. Sus documentos (INE y comprobante de domicilio) se suben en el
          último paso, cuando el conductor ya está creado.
        </p>
      </div>

      {fields.map((item, index) => (
        <StepCard
          key={item.id}
          title={`Aval ${index + 1}`}
          description={item.guarantorId ? 'Aval ya registrado: tus cambios se guardan al final.' : undefined}
        >
          <FieldGrid>
            <TextField control={form.control} name={`guarantors.${index}.name`} label="Nombre(s)" maxLength={50} />
            <TextField control={form.control} name={`guarantors.${index}.surnames`} label="Apellidos" maxLength={100} />
            <TextField
              control={form.control}
              name={`guarantors.${index}.relation`}
              label="Parentesco"
              placeholder="Hermana, amigo, compañero de trabajo…"
              maxLength={50}
            />
          </FieldGrid>

          <AddressFieldset
            form={form}
            path={`guarantors.${index}.address`}
            legacyText={item.guarantorId ? legacy.guarantors[item.guarantorId] : null}
          />

          <FormField
            control={form.control}
            name={`guarantors.${index}.telephones`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="typo-label text-carbon-500">Teléfonos</FormLabel>
                <PhoneListField value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />

          {fields.length > 1 && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => remove(index)}
                className="border-error-500/40 text-error-700 hover:bg-error-50 cursor-pointer gap-2"
              >
                <Trash2 className="size-4" aria-hidden /> Quitar aval
              </Button>
            </div>
          )}
        </StepCard>
      ))}

      {rootError && (
        <p className="typo-caption text-error-700" role="alert">
          {rootError}
        </p>
      )}

      <div>
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ ...EMPTY_GUARANTOR, address: { ...EMPTY_GUARANTOR.address } })}
          disabled={fields.length >= MAX_GUARANTORS}
          className="cursor-pointer gap-2"
        >
          <Plus className="size-4" aria-hidden /> Agregar otro aval
        </Button>
        {fields.length >= MAX_GUARANTORS && (
          <span className="typo-caption text-carbon-300 ml-3">Llegaste al máximo de {MAX_GUARANTORS} avales.</span>
        )}
      </div>
    </div>
  );
};

export default GuarantorsStep;
