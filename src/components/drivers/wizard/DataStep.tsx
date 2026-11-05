'use client';

import { Info } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import PhoneListField from '@/components/common/PhoneListField';
import { FieldGrid, StepCard, TextField } from '@/components/common/wizard/fields';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DriverFormValues } from '@/lib/schemas/driverSchema';

type DataStepProps = {
  form: UseFormReturn<DriverFormValues>;
  /** Create mode: tells the user the folio is assigned automatically. */
  showFolioNotice?: boolean;
};

const DataStep = ({ form, showFolioNotice = true }: DataStepProps) => (
  <div className="flex flex-col gap-5">
    {showFolioNotice && (
      <div
        className="typo-sm-text bg-primary-50 text-primary-900 flex items-start gap-3 rounded-lg px-4 py-3"
        role="note"
      >
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          El folio del conductor se asigna automáticamente al crearlo y queda como <strong>Inactivo</strong> hasta que su
          documentación y su aval estén completos. Los datos de este paso y de los avales son los que se contrastan con
          los documentos.
        </p>
      </div>
    )}

    <StepCard title="Datos del conductor" description="Escríbelos tal como aparecen en su identificación y su licencia.">
      <FieldGrid>
        <TextField control={form.control} name="name" label="Nombre(s)" maxLength={50} />
        <TextField control={form.control} name="surnames" label="Apellidos" maxLength={100} />
        <TextField
          control={form.control}
          name="identificationNumber"
          label="Número de identificación (INE)"
          maxLength={20}
          mono
        />
        <TextField control={form.control} name="licenseNumber" label="Número de licencia" maxLength={20} mono />
        <TextField control={form.control} name="licenseValidity" label="Vigencia de la licencia" type="date" mono />
      </FieldGrid>

      <FormField
        control={form.control}
        name="telephones"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="typo-label text-carbon-500">Teléfonos</FormLabel>
            <PhoneListField value={field.value} onChange={field.onChange} />
            <FormMessage />
          </FormItem>
        )}
      />
    </StepCard>
  </div>
);

export default DataStep;
