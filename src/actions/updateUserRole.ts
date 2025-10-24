'use server';

import { revalidatePath } from 'next/cache';
import { ScopedAPIClient } from '@/api';
import { UserService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';
import { Role } from '@/lib/schemas/userSchema';

export async function updateUserRoleAction(formData: FormData) {
  const username = formData.get('username') as string;
  const role = formData.get('role') as Role;

  if (!username || !role) {
    return { success: false, message: 'Datos incompletos.' };
  }

  try {
    const cookies = await getCookiesServer();
    const client = new ScopedAPIClient(cookies);
    const userService = new UserService(client);

    await userService.updateUserRole(username, role);

    revalidatePath('/dashboard/users');

    return { success: true };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return {
      success: false,
      message: error.message || 'Error actualizando el rol.',
    };
  }
}
