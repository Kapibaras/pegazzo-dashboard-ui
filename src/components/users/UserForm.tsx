'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';

import {
  UserFormValues,
  userSchema,
  Role,
  updateNamesSchema,
  UpdateNamesFormValues,
  updatePasswordSchema,
  UpdatePasswordFormValues,
} from '@/lib/schemas/userSchema';

import { createUserAction, updateUserNamesAction, updateUserPasswordAction } from '@/actions/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type FormMode = 'create' | 'updateNames' | 'updatePassword';

interface UserFormProps {
  mode: FormMode;
  onSuccess: () => void;
  userId?: string;
  name?: string;
  surnames?: string;
}

const buttonLabels: Record<FormMode, { idle: string; submitting: string; title: string; success: string }> = {
  create: {
    idle: 'Crear Usuario',
    submitting: 'Creando Usuario...',
    title: 'Creación de Usuario',
    success: 'Usuario creado correctamente.',
  },
  updateNames: {
    idle: 'Editar Usuario',
    submitting: 'Editando Usuario...',
    title: 'Edición de Usuario',
    success: 'Usuario editado correctamente.',
  },
  updatePassword: {
    idle: 'Guardar Contraseña',
    submitting: 'Guardando Contraseña...',
    title: 'Cambio de Contraseña',
    success: 'Contraseña cambiada correctamente.',
  },
};

export function UserForm({ mode, onSuccess, userId, name, surnames }: UserFormProps) {
  const { toast } = useToast();
  const { handleApiError } = useApiErrorHandler();

  const schema = mode === 'create' ? userSchema : mode === 'updateNames' ? updateNamesSchema : updatePasswordSchema;

  const defaultValues: Partial<UserFormValues | UpdateNamesFormValues | UpdatePasswordFormValues> =
    mode === 'updateNames'
      ? { name: name, surnames: surnames }
      : mode === 'updatePassword'
        ? { password: '', passwordConfirmation: '' }
        : {
            username: '',
            name: '',
            surnames: '',
            password: '',
            role: Role.EMPLOYEE,
          };

  const form = useForm<UserFormValues | UpdateNamesFormValues | UpdatePasswordFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: defaultValues as any,
    mode: 'onChange',
  });

  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: UserFormValues | UpdateNamesFormValues | UpdatePasswordFormValues) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });

    if (userId) formData.append('userId', userId);

    const result =
      mode === 'create'
        ? await createUserAction(formData)
        : mode === 'updateNames'
          ? await updateUserNamesAction(formData)
          : await updateUserPasswordAction(formData);

    if (!result.success) {
      handleApiError(
        {
          status: result.status || 500,
          detail: result.message || 'Error en la acción del usuario.',
        },
        ['users', 'common'],
      );
      return;
    }

    toast({
      title: buttonLabels[mode].title,
      description: buttonLabels[mode].success,
      variant: 'success',
    });

    onSuccess();
    form.reset(defaultValues as any);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col overflow-y-auto px-2 md:px-4">
        <div className="flex-1 space-y-6 pb-6">
          {mode === 'create' && (
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="mb-4 gap-1 md:mt-3 md:mb-3">
                  <FormLabel className="typo-subtitle text-carbon-500">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre de usuario"
                      {...field}
                      className="typo-text border-surface-700 bg-surface-400 flex items-center self-stretch rounded-md border px-4.5 py-5.5 shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(mode === 'create' || mode === 'updateNames') && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="mb-6 gap-2 md:mb-3">
                  <FormLabel className="typo-subtitle text-carbon-500">Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre"
                      {...field}
                      className="typo-text border-surface-700 bg-surface-400 flex items-center self-stretch rounded-md border px-4.5 py-5.5 shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(mode === 'create' || mode === 'updateNames') && (
            <FormField
              control={form.control}
              name="surnames"
              render={({ field }) => (
                <FormItem className="mb-6 gap-2 md:mb-3">
                  <FormLabel className="typo-subtitle text-carbon-500">Apellidos</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Apellidos"
                      {...field}
                      className="typo-text border-surface-700 bg-surface-400 flex items-center self-stretch rounded-md border px-4.5 py-5.5 shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(mode === 'create' || mode === 'updatePassword') && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mb-6 gap-2 md:mb-3">
                  <FormLabel className="typo-subtitle text-carbon-500">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="******"
                      {...field}
                      className="typo-text border-surface-700 bg-surface-400 flex items-center self-stretch rounded-md border px-4.5 py-5.5 shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {mode === 'updatePassword' && (
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem className="mb-6 gap-2 md:mb-3">
                  <FormLabel className="typo-subtitle text-carbon-500">Repetir Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="******"
                      {...field}
                      className="typo-text border-surface-700 bg-surface-400 flex items-center self-stretch rounded-md border px-4.5 py-5.5 shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {mode === 'create' && (
            <FormField
              control={form.control}
              name="role"
              render={() => (
                <FormItem className="gap-2">
                  <FormLabel className="typo-subtitle text-carbon-500">Rol</FormLabel>
                  <Controller
                    control={form.control}
                    name="role"
                    render={({ field: controllerField }) => (
                      <Select
                        value={controllerField.value}
                        onValueChange={(value) => controllerField.onChange(value as Role)}
                      >
                        <FormControl>
                          <SelectTrigger className="typo-text border-surface-700 bg-surface-400 flex w-full cursor-pointer items-center self-stretch rounded-md border px-4.5 py-5.5 capitalize shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none">
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="capitalize">
                          <SelectItem className="cursor-pointer" value={Role.EMPLOYEE}>
                            {Role.EMPLOYEE}
                          </SelectItem>
                          <SelectItem className="cursor-pointer" value={Role.ADMIN}>
                            {Role.ADMIN}
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
        </div>

        <div className="bg-background sticky bottom-0 pt-4 pb-6">
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="bg-terciary-500 hover:bg-primary-700 text-primary-100 typo-bold-text z-10 w-full cursor-pointer items-center justify-center rounded-md py-5.5 text-center hover:shadow-sm"
          >
            {isSubmitting ? buttonLabels[mode].submitting : buttonLabels[mode].idle}
          </Button>
        </div>
      </form>
    </Form>
  );
}
