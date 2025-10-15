'use server';

import { AuthService } from '@/services';
import getCookiesServer from '@/utils/getCookiesServer';
import { ScopedAPIClient } from '@/api';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';
import VARIABLES from '@/config/variables';
import isAPIErrorType from '@/api/errors';

export async function login(formData: FormData) {
  const username = (formData.get('username') as string)?.trim();
  const password = (formData.get('password') as string)?.trim();

  if (!username || !password) {
    return { error: 'Required attributes username & password' };
  }

  try {
    const initialCookieHeader = await getCookiesServer();
    const scopedClient = new ScopedAPIClient(initialCookieHeader);
    await new AuthService(scopedClient).login({ username, password });

    const sessionToken = sign({ username }, VARIABLES.NEXT_SESSION_SECRET, {
      expiresIn: '1h',
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'session',
      value: sessionToken,
      httpOnly: true,
      path: '/',
      secure: VARIABLES.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
    });

    return { success: true };
  } catch (err: unknown) {
    if (!isAPIErrorType(err)) {
      console.error('Login failed with non-API error:', err);
      return { error: 'Something went wrong' };
    }

    if (err.status_code === 401) return { error: 'Invalid Credentials' };
    else if (err.status_code === 404) return { error: 'User not found' };
    else {
      console.error('Login failed with unexpected error:', err.message, err.status_code);
      return { error: 'Something went wrong' };
    }
  }
}
