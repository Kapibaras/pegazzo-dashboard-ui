'use client';

import { useUser } from '@/contexts/UserProvider';
import { Role } from '@/lib/schemas/userSchema';
import HomeAdminDashboard from './HomeAdminDashboard';
import HomeDashboard from './HomeDashboard';
import HomeWelcome from './HomeWelcome';

const HomeContent = () => {
  const { user } = useUser();

  if (user.role === Role.OWNER) {
    return <HomeDashboard />;
  }

  if (user.role === Role.ADMIN) {
    return <HomeAdminDashboard />;
  }

  return <HomeWelcome />;
};

export default HomeContent;
