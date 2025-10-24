'use server';

import { revalidatePath } from 'next/cache';
import { ScopedAPIClient } from '@/api';
import { UserService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';

export default async function deleteUserAction(username: string) {
  if (!username) {
    return { success: false, message: 'Datos incompletos.' };
  }

  try {
    const cookies = await getCookiesServer();
    const client = new ScopedAPIClient(cookies);
    const userService = new UserService(client);

    await userService.deleteUser(username);

    revalidatePath('/dashboard/users');

    return { success: true };
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    const message = error instanceof Error ? error.message : 'Error eliminando el usuario.';
    return {
      success: false,
      message: message,
    };
  }
}
