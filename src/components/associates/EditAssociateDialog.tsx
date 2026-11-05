'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { updateAssociateAction } from '@/actions/associates';
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
import { Label } from '@/components/ui/label';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import { fieldClass } from '@/lib/formField';
import { ToastService } from '@/services/toast';
import { Associate } from '@/types/vehicle';
import PhoneListField from '@/components/common/PhoneListField';

type EditAssociateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  associate: Associate;
  onSaved: (associate: Associate) => void;
};

const EditAssociateDialog = ({ open, onOpenChange, associate, onSaved }: EditAssociateDialogProps) => {
  const { handleApiError } = useApiErrorHandler();
  const [name, setName] = useState(associate.name);
  const [surnames, setSurnames] = useState(associate.surnames);
  const [phones, setPhones] = useState<string[]>(associate.telephones ?? []);
  const [errors, setErrors] = useState<{ name?: string; surnames?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(associate.name);
      setSurnames(associate.surnames);
      setPhones(associate.telephones ?? []);
      setErrors({});
    }
    // Only reset when the dialog opens; a refresh of `associate` mid-edit must not wipe what was typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = 'El nombre es obligatorio.';
    if (!surnames.trim()) nextErrors.surnames = 'Los apellidos son obligatorios.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    const result = await updateAssociateAction(associate.id, {
      name: name.trim(),
      surnames: surnames.trim(),
      telephones: phones,
    });
    setIsSaving(false);

    if (!result.success) {
      await handleApiError({ status: result.status, detail: result.detail }, ['common', 'vehicles']);
      return;
    }

    ToastService.success('Socio actualizado', 'Los cambios se guardaron correctamente.');
    onSaved(result.data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Editar socio</DialogTitle>
            <DialogDescription>
              Los cambios no alteran el folio de los coches que ya tiene registrados.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5">
            <Label htmlFor="associate-name">Nombre</Label>
            <Input
              id="associate-name"
              value={name}
              maxLength={50}
              aria-invalid={!!errors.name}
              className={fieldClass()}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name && (
              <p role="alert" className="typo-caption text-error-700">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="associate-surnames">Apellidos</Label>
            <Input
              id="associate-surnames"
              value={surnames}
              maxLength={100}
              aria-invalid={!!errors.surnames}
              className={fieldClass()}
              onChange={(event) => setSurnames(event.target.value)}
            />
            {errors.surnames && (
              <p role="alert" className="typo-caption text-error-700">
                {errors.surnames}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label>
              Teléfonos <span className="text-carbon-300 font-normal">(opcional)</span>
            </Label>
            <PhoneListField value={phones} onChange={setPhones} />
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
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssociateDialog;
