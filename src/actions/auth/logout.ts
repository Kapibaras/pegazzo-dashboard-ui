'use server';

import { cookies } from 'next/headers';
import { ScopedAPIClient } from '@/api';
import AuthService from '@/services/auth';
import { getCookiesServer } from '@/utils/cookies/server';

export default async function logout() {
  try {
    const cookieHeader = await getCookiesServer();
    const scopedClient = new ScopedAPIClient(cookieHeader);
    const authService = new AuthService(scopedClient);
    await authService.logout();
  } finally {
    const cookieStore = await cookies();
    cookieStore.delete({ name: 'session', path: '/' });
  }

  return { success: true };
}
