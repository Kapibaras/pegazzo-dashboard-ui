'use server';

import { revalidatePath } from 'next/cache';
import { ScopedAPIClient } from '@/api';
import { UserService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';
import { APIError, APIRequestFailed } from '@/api/errors';

export default async function deleteUserAction(username: string) {
  if (!username) {
    return { success: false, status: 400, detail: 'Datos incompletos.' };
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

    if (error instanceof APIError || error instanceof APIRequestFailed) {
      return {
        success: false,
        status: error.status_code,
        detail: error.detail || 'Error al eliminar el usuario.',
      };
    }

    const message = error instanceof Error ? error.message : 'Error al eliminar el usuario.';
    return {
      success: false,
      status: 500,
      detail: message,
    };
  }
}
