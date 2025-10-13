import { getUsernameFromSession } from '@/actions/getUsername';
import LogoutButton from '@/components/common/LogoutBotton';

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