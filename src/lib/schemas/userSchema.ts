import { z } from 'zod';

export enum Role {
  EMPLOYEE = 'empleado',
  ADMIN = 'administrador',
  OWNER = 'propietario',
}

export const userSchema = z.object({
  username: z.string().min(6, {
    message: 'El nombre de usuario debe tener al menos 6 caracteres.',
  }),
  name: z.string().min(3, {
    message: 'El nombre debe tener al menos 3 caracteres.',
  }),
  surnames: z.string().min(10, {
    message: 'Los apellidos deben tener al menos 10 caracteres.',
  }),
  password: z.string().min(6, {
    message: 'La contraseña debe tener al menos 6 caracteres.',
  }),
  role: z.enum(Object.values(Role) as [Role, ...Role[]], {
    message: 'Debes seleccionar un rol.',
  }),
});

export type UserFormValues = z.infer<typeof userSchema>;
