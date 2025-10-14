import { getUsernameFromSession } from '@/actions';
import { LogoutButton } from '@/components/auth';

export default async function HomePage() {
  const username = await getUsernameFromSession();

  return (
    <div className="p-8">
      <header className="flex flex-wrap justify-between gap-4">
        <h1 className="typo-title">Bienvenido al Dashboard</h1>
        <LogoutButton initialUsername={username} />
      </header>
    </div>
  );
}
