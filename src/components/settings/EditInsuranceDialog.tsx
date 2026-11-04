'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { updateInsuranceAction } from '@/actions/insurances';
import PhoneListField from '@/components/associates/PhoneListField';
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
import { Insurance } from '@/types/vehicle';

type EditInsuranceDialogProps = {
  insurance: Insurance | null;
  onClose: () => void;
};

const EditInsuranceDialog = ({ insurance, onClose }: EditInsuranceDialogProps) => {
  const { handleApiError } = useApiErrorHandler();
  const [name, setName] = useState('');
  const [phones, setPhones] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (insurance) {
      setName(insurance.name);
      setPhones(insurance.telephones ?? []);
      setError(undefined);
    }
    // Reset only when a different insurer is opened; a refresh mid-edit must not wipe what was typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insurance?.id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!insurance) return;

    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    setError(undefined);

    setIsSaving(true);
    const result = await updateInsuranceAction(insurance.id, { name: name.trim(), telephones: phones });
    setIsSaving(false);

    if (!result.success) {
      await handleApiError({ status: result.status, detail: result.detail }, ['common', 'vehicles']);
      return;
    }

    ToastService.success('Aseguradora actualizada', 'Los cambios se guardaron correctamente.');
    onClose();
  };

  return (
    <Dialog open={insurance !== null} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Editar aseguradora</DialogTitle>
            <DialogDescription>
              Los coches que ya la tienen asignada verán el cambio de nombre y teléfonos.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5">
            <Label htmlFor="insurance-name">Nombre</Label>
            <Input
              id="insurance-name"
              value={name}
              maxLength={50}
              aria-invalid={!!error}
              className={fieldClass()}
              onChange={(event) => setName(event.target.value)}
            />
            {error && (
              <p role="alert" className="typo-caption text-error-700">
                {error}
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
            <Button type="button" variant="outline" disabled={isSaving} onClick={onClose} className="cursor-pointer">
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

export default EditInsuranceDialog;
