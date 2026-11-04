import { redirect } from 'next/navigation';
import { getUsernameFromSession } from '@/actions/auth';
import ScopedAPIClient from '@/api/clients/scoped';
import isAPIErrorType from '@/api/errors';
import { Role } from '@/lib/schemas/userSchema';
import { UserService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';

/** Server-side route guard: sends anyone whose role is not in `allowed` back to the home page. */
export const requireRole = async (allowed: Role[]) => {
  const username = await getUsernameFromSession();
  if (!username) redirect('/login');

  const cookies = await getCookiesServer();
  try {
    const user = await new UserService(new ScopedAPIClient(cookies)).getUserByUsername(username);
    if (!allowed.includes(user.role as Role)) redirect('/');
  } catch (error) {
    if (isAPIErrorType(error) && error.status_code === 401 && error.detail === 'SESSION_EXPIRED') {
      redirect('/api/auth/signout');
    }
    throw error;
  }
};
