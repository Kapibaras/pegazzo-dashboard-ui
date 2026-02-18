import { getUsernameFromSession } from '@/actions/auth';
import ScopedAPIClient from '@/api/clients/scoped';
import isAPIErrorType from '@/api/errors';
import { Header, NavSidebar } from '@/components/navigation';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { UserProvider } from '@/contexts';
import { UserService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';
import { redirect } from 'next/navigation';
import { unstable_cache } from 'next/cache';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUsername = await getUsernameFromSession();

  if (!currentUsername) return null;

  const cookieHeader = await getCookiesServer();

  const getCachedUser = unstable_cache(
    async (username: string, cookieHeader: string) => {
      const scopedClient = new ScopedAPIClient(cookieHeader);
      const service = new UserService(scopedClient);

      return await service.getUserByUsername(username);
    },
    [currentUsername],
    {
      tags: ['user'],
      revalidate: 3600,
    },
  );

  let user;
  try {
    user = await getCachedUser(currentUsername, cookieHeader);
  } catch (error) {
    if (isAPIErrorType(error) && error.status_code === 401 && error.detail === 'SESSION_EXPIRED') {
      redirect('/api/auth/signout');
    }
    throw error;
  }

  return (
    <SidebarProvider>
      <UserProvider initialUser={user}>
        <NavSidebar />
        <SidebarInset>
          <main className="h-full w-full">
            <Header />
            {children}
          </main>
        </SidebarInset>
      </UserProvider>
    </SidebarProvider>
  );
}
