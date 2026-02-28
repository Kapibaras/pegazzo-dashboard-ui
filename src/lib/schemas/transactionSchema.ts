import { z } from 'zod';
import { isAfter, isBefore, subMonths } from 'date-fns';

export const createTransactionSchema = z.object({
  amount: z
    .coerce
    .number({ error: 'El monto debe ser un número.' })
    .positive('El monto debe ser un número positivo.'),
  date: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return !isAfter(new Date(val), new Date());
      },
      { message: 'La fecha no puede ser futura.' },
    )
    .refine(
      (val) => {
        if (!val) return true;
        return !isBefore(new Date(val), subMonths(new Date(), 2));
      },
      { message: 'La fecha no puede ser de más de 2 meses atrás.' },
    ),
  type: z.enum(['debit', 'credit'], { error: 'Selecciona un tipo.' }),
  description: z
    .string()
    .min(1, 'La descripción es requerida.')
    .max(255, 'Máximo 255 caracteres.'),
  payment_method: z.enum(['cash', 'personal_transfer', 'pegazzo_transfer'], {
    error: 'Selecciona un método de pago.',
  }),
});

export const editTransactionSchema = createTransactionSchema.pick({
  amount: true,
  description: true,
  payment_method: true,
});

export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;
export type EditTransactionFormValues = z.infer<typeof editTransactionSchema>;
