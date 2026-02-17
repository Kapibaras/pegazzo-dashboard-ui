'use client';

import { useUser } from '@/contexts/UserProvider';
import { Role } from '@/lib/schemas/userSchema';
import HomeDashboard from './HomeDashboard';
import HomeWelcome from './HomeWelcome';

const HomeContent = () => {
  const { user } = useUser();

  if (user.role === Role.OWNER) {
    return <HomeDashboard />;
  }

  return <HomeWelcome />;
};

export default HomeContent;
