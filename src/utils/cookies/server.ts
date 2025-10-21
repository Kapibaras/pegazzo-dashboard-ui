import { cookies } from 'next/headers';
import setCookieParser from 'set-cookie-parser';
import CONFIG from '@/config';

export async function getCookiesServer(): Promise<string> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  return allCookies.map((c: { name: string; value: string }) => `${c.name}=${c.value}`).join('; ');
}

export async function setCookiesOnServer(setCookiesHeaders: string[]) {
  const cookieStore = await cookies();

  const parsedCookies = setCookieParser.parse(setCookiesHeaders, { map: false });

  const isDev = CONFIG.NODE_ENV === 'development';

  for (const cookie of parsedCookies) {
    cookieStore.set({
      name: cookie.name,
      value: cookie.value,
      httpOnly: cookie.httpOnly,
      secure: isDev ? false : (cookie.secure ?? true),
      sameSite: (cookie?.sameSite?.toLowerCase() as 'lax' | 'strict' | 'none') ?? 'lax',
      path: cookie.path || '/',
    });
  }

  return cookieStore;
}
