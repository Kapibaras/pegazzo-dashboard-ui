'use server';

import { AuthService } from '@/services';
import { getCookiesServer, setCookiesOnServer } from '@/utils/cookies/server';
import { ScopedAPIClient } from '@/api';
import { sign } from 'jsonwebtoken';
import VARIABLES from '@/config/variables';
import isAPIErrorType from '@/api/errors';

export default async function login(formData: FormData) {
  const username = (formData.get('username') as string)?.trim();
  const password = (formData.get('password') as string)?.trim();

  if (!username || !password) {
    return { error: 'Required attributes username & password' };
  }

  try {
    const initialCookieHeader = await getCookiesServer();
    const scopedClient = new ScopedAPIClient(initialCookieHeader);
    const { setCookiesHeaders } = await new AuthService(scopedClient).login({ username, password });

    const cookieStore = await setCookiesOnServer(setCookiesHeaders);

    const sessionToken = sign({ username }, VARIABLES.NEXT_SESSION_SECRET, {
      expiresIn: '1h',
    });

    //TODO: Right now we have a session provided by Next.js and another by the API (httpOnly).
    // We should ideally unify both sessions into one. For now, we keep both.
    // The Next.js session is used to identify the user in the frontend (hardcoded in 1 hour duration),
    // while the API session is used for authenticating API requests.

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
