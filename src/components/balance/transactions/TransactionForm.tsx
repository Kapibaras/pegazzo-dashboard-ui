'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToastService } from '@/services/toast';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import {
  createTransactionSchema,
  editTransactionSchema,
  CreateTransactionFormValues,
  EditTransactionFormValues,
} from '@/lib/schemas/transactionSchema';
import { createTransactionAction } from '@/actions/balance';
import SingletonAPIClient from '@/api/clients/singleton';
import BalanceService from '@/services/balance';
import { PAYMENT_METHOD_LABELS } from '@/lib/balance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import DatePickerField from './DatePickerField';
import SaveOptionsDialog from './SaveOptionsDialog';

type FormMode = 'create' | 'edit';

interface TransactionFormProps {
  mode: FormMode;
  onSuccess: () => void;
  reference?: string;
  defaultValues?: Partial<EditTransactionFormValues>;
  /** Cuando el form edita una transacción REJECTED siendo ADMIN: muestra diálogo Guardar / Guardar y reenviar. */
  requireResubmissionPrompt?: boolean;
}

const PAYMENT_METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label }));

const inputClass =
  'typo-text border-surface-700 bg-surface-400 flex items-center self-stretch rounded-md border px-4.5 py-5.5 shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none';

const TransactionForm = ({
  mode,
  onSuccess,
  reference,
  defaultValues,
  requireResubmissionPrompt,
}: TransactionFormProps) => {
  const { handleApiError } = useApiErrorHandler();
  const [pendingValues, setPendingValues] = useState<EditTransactionFormValues | null>(null);
  const [isSavingFromDialog, setIsSavingFromDialog] = useState(false);

  const schema = mode === 'create' ? createTransactionSchema : editTransactionSchema;

  const form = useForm<CreateTransactionFormValues | EditTransactionFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues:
      defaultValues ??
      (mode === 'create'
        ? { amount: '' as any, date: undefined, type: undefined, description: '', payment_method: undefined }
        : { amount: '' as any, description: '', payment_method: undefined }),
    mode: 'onChange',
  });

  const { isSubmitting, isValid } = form.formState;

  const updateTransaction = async (values: EditTransactionFormValues) => {
    await new BalanceService(SingletonAPIClient.getInstance()).updateTransaction(reference!, values);
  };

  const onSubmit = async (values: CreateTransactionFormValues | EditTransactionFormValues) => {
    if (mode === 'create') {
      const result = await createTransactionAction(values as CreateTransactionFormValues);
      if (!result.success) {
        handleApiError({ status: result.status || 500, detail: result.message || 'Error al crear la transacción.' }, [
          'balance',
          'common',
        ]);
        return;
      }
      ToastService.success('Transacción creada', 'La transacción fue creada exitosamente.');
      onSuccess();
      form.reset();
      return;
    }

    if (requireResubmissionPrompt) {
      setPendingValues(values as EditTransactionFormValues);
      return;
    }

    try {
      await updateTransaction(values as EditTransactionFormValues);
      ToastService.success('Transacción actualizada', 'La transacción fue actualizada exitosamente.');
    } catch (err) {
      const apiErr = err as { status_code?: number; detail?: string };
      handleApiError(
        { status: apiErr?.status_code ?? 500, detail: apiErr?.detail ?? 'Error al actualizar la transacción.' },
        ['balance', 'common'],
      );
      return;
    }
    onSuccess();
    form.reset();
  };

  const handleSaveOnly = async () => {
    if (!pendingValues) return;
    setIsSavingFromDialog(true);
    try {
      await updateTransaction(pendingValues);
      ToastService.success('Transacción actualizada', 'La transacción fue actualizada exitosamente.');
      setPendingValues(null);
      onSuccess();
      form.reset();
    } catch (err) {
      const apiErr = err as { status_code?: number; detail?: string };
      handleApiError(
        { status: apiErr?.status_code ?? 500, detail: apiErr?.detail ?? 'Error al actualizar la transacción.' },
        ['balance', 'common'],
      );
    } finally {
      setIsSavingFromDialog(false);
    }
  };

  const handleSaveAndResubmit = async () => {
    if (!pendingValues) return;
    setIsSavingFromDialog(true);
    const service = new BalanceService(SingletonAPIClient.getInstance());
    try {
      await service.updateTransaction(reference!, pendingValues);
    } catch (err) {
      const apiErr = err as { status_code?: number; detail?: string };
      handleApiError(
        { status: apiErr?.status_code ?? 500, detail: apiErr?.detail ?? 'Error al actualizar la transacción.' },
        ['balance', 'common'],
      );
      setIsSavingFromDialog(false);
      return;
    }

    try {
      await service.authorizeTransaction(reference!, { status: 'PENDING' });
      ToastService.success('Cambios reenviados', 'La transacción fue actualizada y enviada a revisión.');
    } catch {
      ToastService.info(
        'Cambios guardados',
        'Se guardaron los cambios, pero no se pudo reenviar a revisión. Vuelve a intentarlo desde el detalle.',
      );
    } finally {
      setIsSavingFromDialog(false);
      setPendingValues(null);
      onSuccess();
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col overflow-y-auto px-2 md:px-4">
        <div className="flex-1 space-y-6 pb-6">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="mb-4 gap-1 md:mt-3 md:mb-3">
                <FormLabel className="typo-subtitle text-carbon-500">Monto</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} className={inputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === 'create' && (
            <FormField
              control={form.control}
              name="type"
              render={() => (
                <FormItem className="gap-1 md:mt-3 md:mb-3">
                  <FormLabel className="typo-subtitle text-carbon-500">Tipo</FormLabel>
                  <Controller
                    control={form.control}
                    name="type"
                    render={({ field: controllerField }) => (
                      <Select value={controllerField.value} onValueChange={controllerField.onChange}>
                        <FormControl>
                          <SelectTrigger className={`${inputClass} w-full cursor-pointer`}>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem className="cursor-pointer" value="debit">
                            Cargo
                          </SelectItem>
                          <SelectItem className="cursor-pointer" value="credit">
                            Abono
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="mb-4 gap-1 md:mt-3 md:mb-3">
                <FormLabel className="typo-subtitle text-carbon-500">Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descripción de la transacción"
                    maxLength={255}
                    rows={4}
                    {...field}
                    className="typo-text border-surface-700 bg-surface-400 self-stretch rounded-md border px-4.5 py-3 shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_method"
            render={() => (
              <FormItem className="gap-1 md:mt-3 md:mb-3">
                <FormLabel className="typo-subtitle text-carbon-500">Método de pago</FormLabel>
                <Controller
                  control={form.control}
                  name="payment_method"
                  render={({ field: controllerField }) => (
                    <Select value={controllerField.value} onValueChange={controllerField.onChange}>
                      <FormControl>
                        <SelectTrigger className={`${inputClass} w-full cursor-pointer`}>
                          <SelectValue placeholder="Selecciona un método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHOD_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} className="cursor-pointer" value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === 'create' && (
            <FormField
              control={form.control}
              name="date"
              render={({ field, fieldState }) => (
                <FormItem className="mb-4 gap-1 md:mt-3 md:mb-3">
                  <FormLabel className="typo-subtitle text-carbon-500">Fecha</FormLabel>
                  <FormControl>
                    <DatePickerField
                      value={field.value as string | undefined}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="gap-1 space-y-1 md:mt-3 md:mb-3">
            <div className="flex items-center gap-2">
              <span className="typo-subtitle text-carbon-500">Coche</span>
              <Badge className="self-center text-xs bg-warning-100 text-warning-700 hover:bg-warning-100">🚧 En desarrollo</Badge>
            </div>
            <Select disabled>
              <SelectTrigger className={`${inputClass} w-full`} aria-disabled="true">
                <SelectValue placeholder="Próximamente..." />
              </SelectTrigger>
            </Select>
          </div>
        </div>

        <div className="bg-background sticky bottom-0 pt-4 pb-6">
          <Button
            type="submit"
            disabled={!isValid || isSubmitting || isSavingFromDialog}
            className="bg-terciary-500 hover:bg-primary-700 text-primary-100 typo-bold-text z-10 w-full cursor-pointer items-center justify-center rounded-md py-5.5 text-center hover:shadow-sm"
          >
            {isSubmitting || isSavingFromDialog
              ? mode === 'create'
                ? 'Creando...'
                : 'Guardando...'
              : mode === 'create'
                ? 'Crear transacción'
                : 'Guardar cambios'}
          </Button>
        </div>
      </form>

      <SaveOptionsDialog
        open={pendingValues !== null}
        isSaving={isSavingFromDialog}
        onOpenChange={(next) => (!next && !isSavingFromDialog ? setPendingValues(null) : undefined)}
        onSaveOnly={handleSaveOnly}
        onSaveAndResubmit={handleSaveAndResubmit}
      />
    </Form>
  );
};

export default TransactionForm;
