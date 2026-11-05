'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SingletonAPIClient } from '@/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import PhoneInput from '@/components/common/PhoneInput';
import { Label } from '@/components/ui/label';
import { normalizeApiError } from '@/helpers/apiError';
import { fieldClass } from '@/lib/formField';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import VehicleService from '@/services/vehicle';
import { ToastService } from '@/services/toast';
import { Associate, Insurance, VehicleModel } from '@/types/vehicle';

type FieldConfig = {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  type?: string;
};

type QuickCreateDialogProps<T> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  fields: FieldConfig[];
  initialValues?: Record<string, string>;
  submitLabel: string;
  successTitle: string;
  onSubmit: (values: Record<string, string>) => Promise<T>;
  onCreated: (created: T) => void;
};

const QuickCreateDialog = <T,>({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialValues,
  submitLabel,
  successTitle,
  onSubmit,
  onCreated,
}: QuickCreateDialogProps<T>) => {
  const { handleApiError } = useApiErrorHandler();
  const empty = useMemo(() => Object.fromEntries(fields.map((field) => [field.name, ''])), [fields]);
  const [values, setValues] = useState<Record<string, string>>({ ...empty, ...initialValues });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues({ ...empty, ...initialValues });
      setErrors({});
    }
  }, [open, empty, initialValues]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const nextErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.required && !values[field.name]?.trim()) nextErrors[field.name] = `${field.label} es obligatorio.`;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      const created = await onSubmit(values);
      ToastService.success(successTitle, 'Ya está disponible para seleccionarlo.');
      onCreated(created);
      onOpenChange(false);
    } catch (error) {
      await handleApiError(normalizeApiError(error), ['common', 'vehicles']);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            {fields.map((field) => (
              <div key={field.name} className="grid gap-1.5">
                <Label htmlFor={`qc-${field.name}`}>
                  {field.label}
                  {!field.required && <span className="text-carbon-300 font-normal"> (opcional)</span>}
                </Label>
                {field.type === 'phone' ? (
                  <PhoneInput
                    id={`qc-${field.name}`}
                    invalid={!!errors[field.name]}
                    onChange={(value) => setValues((prev) => ({ ...prev, [field.name]: value }))}
                  />
                ) : (
                  <Input
                    id={`qc-${field.name}`}
                    type={field.type ?? 'text'}
                    value={values[field.name] ?? ''}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                    aria-invalid={!!errors[field.name]}
                    className={fieldClass()}
                    onChange={(event) => setValues((prev) => ({ ...prev, [field.name]: event.target.value }))}
                  />
                )}
                {errors[field.name] && (
                  <p role="alert" className="typo-caption text-error-700">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-terciary-500 text-primary-100 hover:bg-primary-800 cursor-pointer"
            >
              {isSaving && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const useService = () => useMemo(() => new VehicleService(SingletonAPIClient.getInstance()), []);

type CreatedProps<T> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (created: T) => void;
};

export const CreateModelDialog = ({ initialMake, ...props }: CreatedProps<VehicleModel> & { initialMake?: string }) => {
  const service = useService();
  const initialValues = useMemo(() => ({ make: initialMake ?? '' }), [initialMake]);

  return (
    <QuickCreateDialog
      {...props}
      title="Crear nuevo modelo"
      description="Se agrega al catálogo. La abreviatura se usa para armar el folio interno (p. ej. MZ2)."
      fields={[
        { name: 'make', label: 'Marca', required: true, maxLength: 50, placeholder: 'Mazda' },
        { name: 'model', label: 'Modelo', required: true, maxLength: 50, placeholder: '2' },
        { name: 'abbreviation', label: 'Abreviatura', required: true, maxLength: 10, placeholder: 'MZ2' },
      ]}
      initialValues={initialValues}
      submitLabel="Crear modelo"
      successTitle="Modelo creado"
      onSubmit={(values) =>
        service.createModel({
          make: values.make.trim(),
          model: values.model.trim(),
          abbreviation: values.abbreviation.trim().toUpperCase(),
        })
      }
    />
  );
};

export const CreateInsuranceDialog = ({
  initialName,
  ...props
}: CreatedProps<Insurance> & { initialName?: string }) => {
  const service = useService();
  const initialValues = useMemo(() => ({ name: initialName ?? '' }), [initialName]);

  return (
    <QuickCreateDialog
      {...props}
      title="Agregar aseguradora"
      description="Quedará disponible para este y los siguientes coches."
      fields={[
        { name: 'name', label: 'Nombre', required: true, maxLength: 50, placeholder: 'Qualitas' },
        { name: 'phone', label: 'Teléfono', type: 'phone' },
      ]}
      initialValues={initialValues}
      submitLabel="Crear aseguradora"
      successTitle="Aseguradora creada"
      onSubmit={(values) =>
        service.createInsurance({
          name: values.name.trim(),
          telephones: values.phone.trim() ? [values.phone.trim()] : [],
        })
      }
    />
  );
};

/**
 * The design also asked for an optional email, but the backend `AssociateSchema` has no email field, so it is
 * left out until the API supports it.
 */
export const CreateAssociateDialog = ({
  initialName,
  ...props
}: CreatedProps<Associate> & { initialName?: string }) => {
  const service = useService();
  const initialValues = useMemo(() => ({ name: initialName ?? '' }), [initialName]);

  return (
    <QuickCreateDialog
      {...props}
      title="Registrar nuevo socio"
      description="Las iniciales del nombre y apellidos se usan para armar el folio interno del coche."
      fields={[
        { name: 'name', label: 'Nombre', required: true, maxLength: 50 },
        { name: 'paternal', label: 'Apellido paterno', required: true, maxLength: 50 },
        { name: 'maternal', label: 'Apellido materno', maxLength: 50 },
        { name: 'phone', label: 'Teléfono', type: 'phone' },
      ]}
      initialValues={initialValues}
      submitLabel="Crear socio"
      successTitle="Socio creado"
      onSubmit={(values) =>
        service.createAssociate({
          name: values.name.trim(),
          surnames: `${values.paternal.trim()} ${values.maternal.trim()}`.trim(),
          telephones: values.phone.trim() ? [values.phone.trim()] : [],
        })
      }
    />
  );
};
