'use server';
import { cookies } from 'next/headers';
import { APIError, APIRequestFailed } from '@/api/errors';

export default async function logout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete({
      name: 'session',
      path: '/',
    });

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof APIError || error instanceof APIRequestFailed) {
      return {
        success: false,
        status: error.status_code,
        detail: error.detail || 'Error al cerrar sesión.',
      };
    }

    return {
      success: false,
      status: 500,
      detail: error instanceof Error ? error.message : 'Error inesperado al cerrar sesión.',
    };
  }
}
