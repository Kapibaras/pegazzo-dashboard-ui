'use server';

import { revalidatePath } from 'next/cache';
import { userSchema } from '@/lib/schemas/userSchema';
import { ScopedAPIClient } from '@/api';
import { UserService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';

export async function createUserAction(formData: FormData) {
  const data = Object.fromEntries(formData);

  const validatedFields = userSchema.safeParse(data);

  if (!validatedFields.success) {
    const fieldErrors: Record<string, string[]> = {};
    validatedFields.error.issues.forEach((issue) => {
      const path = issue.path[0];
      if (!fieldErrors[path as string]) {
        fieldErrors[path as string] = [];
      }
      fieldErrors[path as string].push(issue.message);
    });

    return {
      success: false,
      errors: fieldErrors,
    };
  }

  try {
    const initialCookieHeader = await getCookiesServer();
    const scopedClient = new ScopedAPIClient(initialCookieHeader);
    const userService = new UserService(scopedClient);

    const user = await userService.createUser(validatedFields.data);

    revalidatePath('/users');

    return {
      success: true,
      message: '¡Usuario creado exitosamente!',
      data: user,
    };
  } catch (error: any) {
    console.error('Error creando usuario:', error?.response?.data || error.message);
    return {
      success: false,
      message: 'Error al crear el usuario. Inténtalo de nuevo.',
    };
  }
}
