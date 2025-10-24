'use server';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import VARIABLES from '@/config/variables';

interface SessionPayload {
  username: string;
}

export default async function getUsernameFromSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(VARIABLES.NEXT_SESSION_SECRET);
    const { payload } = await jwtVerify<SessionPayload>(sessionToken, secret);

    return payload.username || null;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
