'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';

import { UserFormValues, userSchema, Role } from '@/lib/schemas/userSchema';
import { createUserAction } from '@/actions/createUser';
import { updateUserNamesAction } from '@/actions/updateUserNames';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type FormMode = 'create' | 'updateNames';

interface UserFormProps {
  mode: FormMode;
  onSuccess: () => void;
  userId?: string;
}

export function UserForm({ mode, onSuccess, userId }: UserFormProps) {
  const { toast } = useToast();

  const defaultValues: Partial<UserFormValues> =
    mode === 'updateNames'
      ? {
          name: '',
          surnames: '',
        }
      : {
          username: '',
          name: '',
          surnames: '',
          password: '',
          role: Role.EMPLOYEE,
        };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultValues as UserFormValues,
    mode: 'onChange',
  });

  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: UserFormValues) {
    const formData = new FormData();
    const fieldsToSubmit = mode === 'updateNames' ? { name: values.name, surnames: values.surnames } : values;

    Object.entries(fieldsToSubmit).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    let result;
    if (mode === 'create') {
      result = await createUserAction(formData);
    } else if (mode === 'updateNames' && userId) {
      formData.append('userId', userId);
      result = await updateUserNamesAction(formData);
    } else {
      toast({ title: 'Error', description: 'Modo de formulario o ID de usuario no válido.', variant: 'destructive' });
      return;
    }

    const actionText = mode === 'create' ? 'Usuario' : 'Nombres';

    if (result.success) {
      toast({
        title: 'Éxito',
        description: `${actionText} actualizado/creado correctamente.`,
        variant: 'success',
      });
      onSuccess();
      form.reset(defaultValues as UserFormValues);
    } else {
      toast({
        title: 'Error',
        description: result.message || 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
    }
  }

  const isCreateMode = mode === 'create';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {isCreateMode && (
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

        {isCreateMode && (
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

        {isCreateMode && (
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="mb-20 gap-2 md:mb-12">
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

        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="bg-terciary-500 hover:bg-primary-700 text-primary-100 typo-bold-text flex w-full cursor-pointer items-center justify-center rounded-md py-5.5 text-center hover:shadow-sm"
        >
          {isSubmitting
            ? isCreateMode
              ? 'Creando Usuario...'
              : 'Editando Usuario...'
            : isCreateMode
              ? 'Crear Usuario'
              : 'Editar Usuario'}
        </Button>
      </form>
    </Form>
  );
}
