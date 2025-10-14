import { getUsernameFromSession } from '@/actions';
import { LogoutButton } from '@/components/auth';

export default async function HomePage() {
  const username = await getUsernameFromSession();

  return (
    <div className="p-8">
      <header className="flex justify-end">
        <LogoutButton initialUsername={username} />
      </header>
      <h1 className="title">Bienvenido al Dashboard</h1>
    </div>
  );
}
