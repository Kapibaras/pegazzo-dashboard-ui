import { redirect } from 'next/navigation';
import { getUsernameFromSession } from '@/actions/auth';
import ScopedAPIClient from '@/api/clients/scoped';
import isAPIErrorType from '@/api/errors';
import { AutorizacionesView } from '@/components/balance/autorizaciones';
import { Role } from '@/lib/schemas/userSchema';
import { UserService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';

const AutorizacionesPage = async () => {
  const username = await getUsernameFromSession();
  if (!username) redirect('/login');

  const cookies = await getCookiesServer();

  try {
    const user = await new UserService(new ScopedAPIClient(cookies)).getUserByUsername(username);
    if (user.role !== Role.OWNER) redirect('/');
  } catch (error) {
    if (isAPIErrorType(error) && error.status_code === 401 && error.detail === 'SESSION_EXPIRED') {
      redirect('/api/auth/signout');
    }
    throw error;
  }

  return <AutorizacionesView />;
};

export default AutorizacionesPage;
