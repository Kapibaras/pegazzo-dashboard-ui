'use client';

import { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { VehicleFormValues } from '@/lib/schemas/vehicleSchema';
import useVehicleCatalogs from '@/hooks/vehicles/useVehicleCatalogs';
import ImageUpload, { ImageItem } from '../ImageUpload';
import { CreateModelDialog } from '../QuickCreateDialogs';
import SearchCombobox, { ComboboxOption } from '../SearchCombobox';
import { FieldGrid, SelectField, StepCard, TextField } from './fields';

type IdentityStepProps = {
  form: UseFormReturn<VehicleFormValues>;
  catalogs: ReturnType<typeof useVehicleCatalogs>;
  agencyImages: ImageItem[];
  onAgencyImagesChange: (items: ImageItem[]) => void;
  /** Edit mode: the folio already exists, so the "generated at the end" banner is hidden. */
  showFolioNotice?: boolean;
};

export const BODY_TYPE_OPTIONS = ['Sedán', 'Hatchback', 'SUV', 'Pickup', 'Van', 'Coupé'].map((value) => ({ value, label: value }));
const SEPARATOR = '\u0000';

export const TRANSMISSION_OPTIONS = [
  { value: 'TA', label: 'Automática (TA)' },
  { value: 'TM', label: 'Manual (TM)' },
];

const IdentityStep = ({ form, catalogs, agencyImages, onAgencyImagesChange, showFolioNotice = true }: IdentityStepProps) => {
  const [createOpen, setCreateOpen] = useState(false);
  const [createMake, setCreateMake] = useState('');
  const { make, model, bodyType } = form.watch();

  // A car saved with a body type outside the list (free text before this was a dropdown) keeps showing its value.
  const bodyTypeOptions =
    bodyType && !BODY_TYPE_OPTIONS.some((option) => option.value === bodyType)
      ? [{ value: bodyType, label: bodyType }, ...BODY_TYPE_OPTIONS]
      : BODY_TYPE_OPTIONS;

  const options = useMemo<ComboboxOption[]>(
    () =>
      catalogs.models.flatMap((group) =>
        group.models.map((item) => ({
          value: `${group.make}${SEPARATOR}${item.model}`,
          label: `${group.make} ${item.model}`,
          description: `Abreviatura: ${item.abbreviation}`,
        })),
      ),
    [catalogs.models],
  );

  const selectedValue = make && model ? `${make}${SEPARATOR}${model}` : '';
  // A car whose make/model is not in the catalog (legacy data) is still shown so edit mode does not lose it.
  const allOptions =
    selectedValue && !options.some((option) => option.value === selectedValue)
      ? [{ value: selectedValue, label: `${make} ${model}`, description: 'No está en el catálogo' }, ...options]
      : options;

  const handleSelect = (value: string) => {
    const [nextMake, nextModel] = value.split(SEPARATOR);
    form.setValue('make', nextMake, { shouldValidate: true, shouldDirty: true });
    form.setValue('model', nextModel, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="flex flex-col gap-5">
      {showFolioNotice && (
        <div className="bg-primary-50 text-primary-900 flex items-start gap-3 rounded-lg px-4 py-3 text-sm" role="note">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            El folio interno <strong>no se captura aquí</strong>: se genera automáticamente al final, con los datos del socio y del
            coche.
          </p>
        </div>
      )}

      <StepCard title="Identidad del vehículo" description="Datos generales y la imagen de agencia.">
        <ImageUpload
          label="Imagen de agencia"
          hint="Opcional. Se muestra en el listado y en el detalle."
          items={agencyImages}
          onChange={onAgencyImagesChange}
          max={1}
        />

        <FieldGrid>
          <FormField
            control={form.control}
            name="model"
            render={() => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-carbon-400 text-sm font-medium">Marca y modelo</FormLabel>
                <SearchCombobox
                  value={selectedValue}
                  options={allOptions}
                  onSelect={handleSelect}
                  placeholder="Selecciona del catálogo"
                  searchPlaceholder="Buscar marca o modelo…"
                  emptyText="No hay modelos con ese nombre."
                  isLoading={catalogs.isLoading}
                  invalid={!!form.formState.errors.model || !!form.formState.errors.make}
                  createLabel={(query) => (query ? `Crear nuevo modelo «${query}»…` : 'Crear nuevo modelo…')}
                  onCreate={(query) => {
                    setCreateMake(query);
                    setCreateOpen(true);
                  }}
                  ariaLabel="Marca y modelo"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <TextField control={form.control} name="year" label="Año" placeholder="2024" inputMode="numeric" maxLength={4} mono />
          <TextField control={form.control} name="color" label="Color" placeholder="Blanco" maxLength={30} />
          <SelectField
            control={form.control}
            name="bodyType"
            label="Carrocería"
            options={bodyTypeOptions}
            placeholder="Selecciona"
          />
          <TextField control={form.control} name="engineType" label="Motor" placeholder="1.5L" maxLength={30} />
          <SelectField
            control={form.control}
            name="transmission"
            label="Transmisión"
            options={TRANSMISSION_OPTIONS}
            placeholder="Selecciona"
          />
        </FieldGrid>
      </StepCard>

      <CreateModelDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialMake={createMake}
        onCreated={(created) => {
          catalogs.addModel(created.make, { id: created.id, model: created.model, abbreviation: created.abbreviation });
          handleSelect(`${created.make}${SEPARATOR}${created.model}`);
        }}
      />
    </div>
  );
};

export default IdentityStep;
