'use server';

import { revalidatePath } from 'next/cache';
import { ScopedAPIClient } from '@/api';
import { UserService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';
import { Role } from '@/lib/schemas/userSchema';
import isAPIErrorType from '@/api/errors';

export default async function updateUserRoleAction(formData: FormData) {
  const username = formData.get('username') as string;
  const role = formData.get('role') as Role;

  if (!username || !role) {
    return { success: false, status: 400, detail: 'Datos incompletos.' };
  }

  try {
    const cookies = await getCookiesServer();
    const client = new ScopedAPIClient(cookies);
    const userService = new UserService(client);

    await userService.updateUserRole(username, role);

    revalidatePath('/dashboard/users');

    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating user role:', error);
    return {
      success: false,
      status: isAPIErrorType(error) ? error.status_code : 500,
      detail: isAPIErrorType(error) ? error.detail : 'Unknown error',
    };
  }
}
