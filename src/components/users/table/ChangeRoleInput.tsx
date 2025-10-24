'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Role } from '@/lib/schemas/userSchema';
import { Controller, useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { updateUserRoleAction } from '@/actions/users';

interface ChangeRoleInputProps {
  currentRole: Role;
  username: string;
  onRoleUpdated?: () => void;
}

const ChangeRoleInput = ({ currentRole, username, onRoleUpdated }: ChangeRoleInputProps) => {
  const { toast } = useToast();
  const isOwner = currentRole === Role.OWNER;

  const form = useForm<{ role: Role }>({
    defaultValues: { role: currentRole },
    mode: 'onChange',
  });

  async function handleRoleChange(value: Role) {
    form.setValue('role', value);

    if (value === currentRole) return;

    const formData = new FormData();
    formData.append('username', username);
    formData.append('role', value);

    const result = await updateUserRoleAction(formData);

    if (!result.success) {
      toast({
        title: 'Error',
        description: result.message || 'No se pudo actualizar el rol.',
        variant: 'destructive',
      });
      form.setValue('role', currentRole);
    } else {
      onRoleUpdated?.();
    }
  }

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="role"
        render={() => (
          <FormItem className="gap-2">
            <FormLabel className="typo-subtitle text-carbon-500">Rol</FormLabel>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => handleRoleChange(value as Role)}
                  disabled={isOwner}
                >
                  <FormControl>
                    <SelectTrigger className="typo-text border-surface-700 bg-surface-400 w-93 cursor-pointer rounded-md border px-4.5 py-5.5 text-left capitalize shadow-sm placeholder:text-left focus:border-blue-600 focus:outline-none md:w-88">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="capitalize">
                    <SelectItem value={Role.EMPLOYEE} className="cursor-pointer">
                      {Role.EMPLOYEE}
                    </SelectItem>
                    <SelectItem value={Role.ADMIN} className="cursor-pointer">
                      {Role.ADMIN}
                    </SelectItem>
                    {isOwner && (
                      <SelectItem value={Role.OWNER} className="cursor-pointer">
                        {Role.OWNER}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
};

export default ChangeRoleInput;
