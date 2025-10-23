'use server';

import { revalidatePath } from 'next/cache';
import { userSchema } from '@/lib/schemas/userSchema';
import { ScopedAPIClient } from '@/api';
import { UserService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';

export default async function handleUserAction({
  formData,
  action,
  successMessage,
  errorMessage,
}: {
  formData: FormData;
  action: (userService: UserService, data: any) => Promise<any>;
  successMessage: string;
  errorMessage: string;
}) {
  const data = Object.fromEntries(formData);

  const validatedFields = userSchema.safeParse(data);

  if (!validatedFields.success) {
    const fieldErrors: Record<string, string[]> = {};
    validatedFields.error.issues.forEach((issue) => {
      const path = issue.path[0];
      if (!fieldErrors[path as string]) fieldErrors[path as string] = [];
      fieldErrors[path as string].push(issue.message);
    });

    return { success: false, errors: fieldErrors };
  }

  try {
    const initialCookieHeader = await getCookiesServer();
    const scopedClient = new ScopedAPIClient(initialCookieHeader);
    const userService = new UserService(scopedClient);

    const result = await action(userService, validatedFields.data);

    revalidatePath('/users');

    return {
      success: true,
      message: successMessage,
      data: result,
    };
  } catch (error: any) {
    console.error('Error en acción de usuario:', error?.response?.data || error.message);
    return {
      success: false,
      message: errorMessage,
    };
  }
}
