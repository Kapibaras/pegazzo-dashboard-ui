import { getUsernameFromSession } from '@/actions/getUsername';
import ScopedAPIClient from '@/api/clients/scoped';
import { Header, NavSidebar } from '@/components/navigation';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { UserProvider } from '@/contexts';
import { UserService } from '@/services';
import { getCookiesServer } from '@/utils/cookies/server';
import { unstable_cache } from 'next/cache';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUsername = await getUsernameFromSession();

  if (!currentUsername) return null;

  const cookies = await getCookiesServer();

  const getCachedUser = unstable_cache(
    async (username: string, cookies: string) => {
      const scopedClient = new ScopedAPIClient(cookies);
      const service = new UserService(scopedClient);

      return await service.getUserByUsername(username);
    },
    [currentUsername],
    {
      tags: ['user'],
      revalidate: 3600,
    },
  );

  const user = await getCachedUser(currentUsername, cookies);

  return (
    <SidebarProvider>
      <UserProvider initialUser={user}>
        <NavSidebar />
        <SidebarInset>
          <main className="w-full bg-red-500">
            <Header title="Inicio" />
            {children}
          </main>
        </SidebarInset>
      </UserProvider>
    </SidebarProvider>
  );
}
