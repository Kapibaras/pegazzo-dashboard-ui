'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { TEXTAREA_CLASS } from '@/lib/formField';
import { VehicleFormValues } from '@/lib/schemas/vehicleSchema';
import useVehicleCatalogs from '@/hooks/vehicles/useVehicleCatalogs';
import { CreateAssociateDialog } from '../QuickCreateDialogs';
import SearchCombobox from '../SearchCombobox';
import { StepCard } from './fields';

type AssociateStepProps = {
  form: UseFormReturn<VehicleFormValues>;
  catalogs: ReturnType<typeof useVehicleCatalogs>;
};

const AssociateStep = ({ form, catalogs }: AssociateStepProps) => {
  const [dialog, setDialog] = useState<{ open: boolean; name: string }>({ open: false, name: '' });

  return (
    <div className="flex flex-col gap-5">
      <StepCard
        title="Socio"
        description="El socio que aporta el coche. Es obligatorio porque el folio interno depende de él."
      >
        <FormField
          control={form.control}
          name="associateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="typo-label text-carbon-500">Socio</FormLabel>
              <FormControl>
                <SearchCombobox
                  value={field.value}
                  options={catalogs.associates.map((associate) => ({
                    value: String(associate.id),
                    label: `${associate.name} ${associate.surnames}`,
                    description: associate.telephones?.[0],
                  }))}
                  onSelect={(value) => field.onChange(value)}
                  placeholder="Busca un socio existente"
                  searchPlaceholder="Buscar por nombre o teléfono…"
                  emptyText="No encontramos ese socio."
                  isLoading={catalogs.isLoading}
                  invalid={!!form.formState.errors.associateId}
                  createLabel={(query) => (query ? `Crear nuevo socio «${query}»…` : 'Crear nuevo socio…')}
                  onCreate={(query) => setDialog({ open: true, name: query })}
                  ariaLabel="Socio"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="typo-label text-carbon-500">
                Notas adicionales <span className="text-carbon-300 font-normal">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} maxLength={1000} className={TEXTAREA_CLASS} />
              </FormControl>
              <FormDescription className="typo-caption">{field.value.length}/1000</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </StepCard>

      <CreateAssociateDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
        initialName={dialog.name}
        onCreated={(created) => {
          catalogs.addAssociate(created);
          form.setValue('associateId', String(created.id), { shouldValidate: true, shouldDirty: true });
        }}
      />
    </div>
  );
};

export default AssociateStep;
