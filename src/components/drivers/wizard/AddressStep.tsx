'use client';

import { UseFormReturn } from 'react-hook-form';
import { StepCard, TextField } from '@/components/common/wizard/fields';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DriverFormValues } from '@/lib/schemas/driverSchema';
import AddressListField from './AddressListField';

const AddressStep = ({ form }: { form: UseFormReturn<DriverFormValues> }) => (
  <StepCard title="Domicilio" description="El domicilio del comprobante y las cocheras donde guarda el coche.">
    <TextField control={form.control} name="address" label="Domicilio" maxLength={255} />

    <FormField
      control={form.control}
      name="garageAddress"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="typo-label text-carbon-500">Cocheras</FormLabel>
          <AddressListField
            value={field.value}
            onChange={field.onChange}
            placeholder="Calle, número, colonia y ciudad de la cochera"
            ariaLabel="Agregar una cochera"
          />
          <FormMessage />
        </FormItem>
      )}
    />
  </StepCard>
);

export default AddressStep;
