'use client';

import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { PEGAZZO_OWNER, VehicleFormValues } from '@/lib/schemas/vehicleSchema';
import { cn } from '@/lib/utils';
import useVehicleCatalogs from '@/hooks/vehicles/useVehicleCatalogs';
import { CreateInsuranceDialog } from '../QuickCreateDialogs';
import SearchCombobox from '../SearchCombobox';
import { FieldGrid, StepCard, TextField } from '@/components/common/wizard/fields';

type AdminStepProps = {
  form: UseFormReturn<VehicleFormValues>;
  catalogs: ReturnType<typeof useVehicleCatalogs>;
};

const ToggleRow = ({
  label,
  checked,
  onChange,
  yesLabel,
  noLabel,
  id,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  yesLabel: string;
  noLabel: string;
  id: string;
}) => (
  <div className="bg-surface-400 flex items-center justify-between gap-4 rounded-lg px-4 py-3">
    <label htmlFor={id} className="typo-label text-carbon-500 cursor-pointer">
      {label}
    </label>
    <div className="flex items-center gap-3">
      <span
        className={cn(
          'typo-caption rounded-full px-2.5 py-0.5',
          checked ? 'bg-success-50 text-success-700' : 'bg-warning-100 text-warning-700',
        )}
      >
        {checked ? yesLabel : noLabel}
      </span>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  </div>
);

const AdminStep = ({ form, catalogs }: AdminStepProps) => {
  const { control } = form;
  const [insuranceDialog, setInsuranceDialog] = useState<{ open: boolean; name: string }>({ open: false, name: '' });
  const liquidated = form.watch('isFinancedLiquidated');
  const pegazzoOwner = form.watch('legalOwnerIsPegazzo');

  // "Propiedad de Pegazzo": owner fields are filled and locked; turning it off leaves them editable.
  useEffect(() => {
    if (!pegazzoOwner) return;
    form.setValue('legalOwnerName', PEGAZZO_OWNER.name, { shouldValidate: true, shouldDirty: true });
    form.setValue('legalOwnerSurnames', PEGAZZO_OWNER.surnames, { shouldValidate: true, shouldDirty: true });
  }, [pegazzoOwner, form]);

  const handleLiquidatedChange = (value: boolean) => {
    form.setValue('isFinancedLiquidated', value, { shouldValidate: true, shouldDirty: true });
    if (value) {
      form.setValue('financingAgency', '');
      form.setValue('financingPurchaseDate', '');
      form.setValue('financingTermMonths', '');
      form.setValue('financingRemainingAmount', '');
      form.clearErrors(['financingAgency', 'financingPurchaseDate', 'financingTermMonths', 'financingRemainingAmount']);
    }
  };

  const handlePegazzoChange = (value: boolean) => {
    form.setValue('legalOwnerIsPegazzo', value, { shouldDirty: true });
    if (!value) {
      form.setValue('legalOwnerName', '', { shouldDirty: true });
      form.setValue('legalOwnerSurnames', '', { shouldDirty: true });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <StepCard title="Seguro" description="La aseguradora y los datos de la póliza.">
        <FieldGrid>
          <FormField
            control={control}
            name="insuranceProviderId"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="typo-label text-carbon-500">Aseguradora</FormLabel>
                <FormControl>
                  <SearchCombobox
                    value={field.value}
                    options={catalogs.insurances.map((insurance) => ({
                      value: String(insurance.id),
                      label: insurance.name,
                    }))}
                    onSelect={(value) => field.onChange(value)}
                    placeholder="Selecciona una aseguradora"
                    searchPlaceholder="Buscar aseguradora…"
                    emptyText="No hay aseguradoras con ese nombre."
                    isLoading={catalogs.isLoading}
                    invalid={!!form.formState.errors.insuranceProviderId}
                    createLabel={() => 'Agregar nueva aseguradora…'}
                    onCreate={(query) => setInsuranceDialog({ open: true, name: query })}
                    ariaLabel="Aseguradora"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <TextField control={control} name="policyNumber" label="Número de póliza" maxLength={30} mono />
          <TextField control={control} name="policyType" label="Tipo de póliza" placeholder="Amplia" maxLength={20} />
          <TextField control={control} name="policyExpirationDate" label="Vigencia" type="date" mono />
        </FieldGrid>
      </StepCard>

      <StepCard title="Registro y facturación">
        <FieldGrid>
          <TextField
            control={control}
            name="unitValue"
            label="Valor de unidad"
            inputMode="decimal"
            format="decimal"
            suffix="MXN"
            mono
          />
          <TextField
            control={control}
            name="unitBillingValue"
            label="Valor de facturación"
            inputMode="decimal"
            format="decimal"
            suffix="MXN"
            mono
          />
          <TextField control={control} name="billNumber" label="Número de factura" maxLength={30} mono />
          <TextField control={control} name="publicVehicleRegistry" label="RPV" maxLength={30} mono />
          <TextField control={control} name="altaPublicVehicleRegistry" label="Fecha de alta RPV" type="date" mono />
        </FieldGrid>
      </StepCard>

      <StepCard title="Financiamiento">
        <ToggleRow
          id="liquidated"
          label="¿El coche ya está liquidado?"
          checked={liquidated}
          onChange={handleLiquidatedChange}
          yesLabel="Sí"
          noLabel="No"
        />
        {!liquidated && (
          <FieldGrid>
            <TextField control={control} name="financingAgency" label="Agencia" maxLength={100} />
            <TextField control={control} name="financingPurchaseDate" label="Fecha de compra" type="date" mono />
            <TextField
              control={control}
              name="financingTermMonths"
              label="Plazo"
              inputMode="numeric"
              suffix="meses"
              mono
            />
            <TextField
              control={control}
              name="financingRemainingAmount"
              label="Monto restante"
              inputMode="decimal"
              format="decimal"
              suffix="MXN"
              mono
            />
          </FieldGrid>
        )}
      </StepCard>

      <StepCard title="Propietario legal">
        <ToggleRow
          id="pegazzo-owner"
          label="Propiedad de Pegazzo"
          checked={pegazzoOwner}
          onChange={handlePegazzoChange}
          yesLabel="Pegazzo"
          noLabel="Particular"
        />
        <FieldGrid>
          <TextField control={control} name="legalOwnerName" label="Nombre" maxLength={50} disabled={pegazzoOwner} />
          <TextField
            control={control}
            name="legalOwnerSurnames"
            label="Apellidos"
            maxLength={100}
            disabled={pegazzoOwner}
          />
        </FieldGrid>
      </StepCard>

      <CreateInsuranceDialog
        open={insuranceDialog.open}
        onOpenChange={(open) => setInsuranceDialog((prev) => ({ ...prev, open }))}
        initialName={insuranceDialog.name}
        onCreated={(created) => {
          catalogs.addInsurance(created);
          form.setValue('insuranceProviderId', String(created.id), { shouldValidate: true, shouldDirty: true });
        }}
      />
    </div>
  );
};

export default AdminStep;
