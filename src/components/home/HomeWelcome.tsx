'use client';

import { useUser } from '@/contexts/UserProvider';

const HomeWelcome = () => {
  const { user } = useUser();

  return (
    <div className="space-y-2">
      <h1 className="typo-title">Bienvenido, {user.name}</h1>
      <p className="typo-text text-muted-foreground">Selecciona una opción del menú para comenzar.</p>
    </div>
  );
};

export default HomeWelcome;
