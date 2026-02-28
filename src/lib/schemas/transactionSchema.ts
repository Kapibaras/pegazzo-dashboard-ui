import { z } from 'zod';

export const createTransactionSchema = z.object({
  amount: z
    .coerce
    .number({ invalid_type_error: 'El monto debe ser un número.' })
    .positive('El monto debe ser un número positivo.'),
  date: z.string().optional(),
  type: z.enum(['debit', 'credit'], { required_error: 'Selecciona un tipo.' }),
  description: z
    .string()
    .min(1, 'La descripción es requerida.')
    .max(255, 'Máximo 255 caracteres.'),
  payment_method: z.enum(['cash', 'personal_transfer', 'pegazzo_transfer'], {
    required_error: 'Selecciona un método de pago.',
  }),
});

export const editTransactionSchema = createTransactionSchema.pick({
  amount: true,
  description: true,
  payment_method: true,
});

export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;
export type EditTransactionFormValues = z.infer<typeof editTransactionSchema>;
