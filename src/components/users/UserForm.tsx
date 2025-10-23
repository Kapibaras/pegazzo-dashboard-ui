'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';

import { UserFormValues, userSchema, Role } from '@/lib/schemas/userSchema';
import { createUserAction } from '@/actions/createUser';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface UserFormProps {
  onSuccess: () => void;
}

export function UserForm({ onSuccess }: UserFormProps) {
  const { toast } = useToast();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      name: '',
      surnames: '',
      password: '',
      role: Role.EMPLOYEE,
    },
    mode: 'onChange',
  });

  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: UserFormValues) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await createUserAction(formData);

    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
        variant: 'success',
      });
      onSuccess();
      form.reset();
    } else {
      toast({
        title: 'Error',
        description: result.message || 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="mb-6 gap-2 md:mt-3 md:mb-3">
              <FormLabel className="typo-subtitle text-carbon-500">Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="JuanOvando"
                  {...field}
                  className="typo-text border-surface-700 bg-surface-400 w-93 rounded-md border py-6 shadow-sm focus:border-blue-600 focus:outline-none md:w-88 md:py-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="mb-6 gap-2 md:mb-3">
              <FormLabel className="typo-subtitle text-carbon-500">Nombre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Juan"
                  {...field}
                  className="typo-text border-surface-700 bg-surface-400 w-93 rounded-md border py-6 shadow-sm focus:border-blue-600 focus:outline-none md:w-88 md:py-3"
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
                  placeholder="Velázquez Ovando"
                  {...field}
                  className="typo-text border-surface-700 bg-surface-400 w-93 rounded-md border py-6 shadow-sm focus:border-blue-600 focus:outline-none md:w-88 md:py-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  className="typo-text border-surface-700 bg-surface-400 w-93 rounded-md border py-6 shadow-sm focus:border-blue-600 focus:outline-none md:w-88 md:py-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="mb-22 gap-2 md:mb-25">
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
                      <SelectTrigger className="typo-text border-surface-700 bg-surface-400 w-93 rounded-md border py-6 text-left shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none md:w-88 md:py-3">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={Role.EMPLOYEE}>Empleado</SelectItem>
                      <SelectItem value={Role.ADMIN}>Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="bg-terciary-500 hover:bg-primary-700 text-primary-100 typo-bold-text flex min-h-10 w-93 cursor-pointer items-center justify-center gap-1 rounded-md py-6 text-center hover:shadow-sm md:w-88"
        >
          {isSubmitting ? 'Creando Usuario...' : 'Crear Usuario'}
        </Button>
      </form>
    </Form>
  );
}
