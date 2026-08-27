'use server';

import { revalidatePath } from 'next/cache';
import { ScopedAPIClient } from '@/api';
import { UserService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';
import isAPIErrorType from '@/api/errors';

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
    return {
      success: false,
      status: isAPIErrorType(error) ? error.status_code : 500,
      detail: isAPIErrorType(error) ? error.detail : 'Unknown error',
    };
  }
}
